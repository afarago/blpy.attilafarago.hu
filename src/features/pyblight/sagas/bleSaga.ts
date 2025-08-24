import { buffers, eventChannel, type Task } from 'redux-saga';
import {
    call,
    cancel,
    fork,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'typed-redux-saga';
import { delay } from 'redux-saga/effects';
import { getBleState } from '../selectors';
import { bleSlice, disconnectBle } from '../slices/ble';
import {
    decodePnpId,
    deviceInformationServiceUUID,
    firmwareRevisionStringUUID,
    getHubTypeName,
    pnpIdUUID,
    pybricksControlEventCharacteristicUUID,
    pybricksHubCapabilitiesCharacteristicUUID,
    pybricksServiceUUID,
    softwareRevisionStringUUID,
} from './util/hardware';
import { EventType, getEventType, parseStatusReport } from './util/protocol';

function* handleConnectBle(action: ReturnType<typeof bleSlice.actions.connectBle>) {
    const decoder = new TextDecoder();
    const allowAutoReconnect = !!action.payload;

    if (navigator.bluetooth === undefined) {
        yield* put(bleSlice.actions.didFailToConnectBle('WebBluetooth not supported'));
        return;
    }
    if (!(yield* call(() => navigator.bluetooth.getAvailability()))) {
        yield* put(bleSlice.actions.didFailToConnectBle('Bluetooth not available'));
        return;
    }

    const tasks = new Array<Task>();
    const defer = new Array<() => void>();

    try {
        // Try known devices first if allowed
        let device: BluetoothDevice | null = null;
        if (allowAutoReconnect && navigator.bluetooth.getDevices) {
            const knownDevices: BluetoothDevice[] = yield* call(() =>
                navigator.bluetooth.getDevices(),
            );
            for (const knownDevice of knownDevices) {
                try {
                    if (!knownDevice.gatt?.connected) {
                        // Race connection vs 200ms timeout
                        const { connected } = yield* race({
                            connected: call(() => knownDevice.gatt?.connect()),
                            timeout: delay(200),
                        });
                        if (!connected) {
                            // Timed out, try next device
                            continue;
                        }
                    }
                    device = knownDevice;
                    break; // Stop at first successful connection
                } catch {
                    // If connection fails, try next device
                    continue;
                }
            }
        }

        // If no known device connected, prompt user
        if (!device) {
            device = yield* call(() =>
                navigator.bluetooth.requestDevice({
                    filters: [{ services: [pybricksServiceUUID] }],
                    optionalServices: [
                        pybricksServiceUUID,
                        deviceInformationServiceUUID,
                    ],
                }),
            );
        }

        yield* put(bleSlice.actions.didReadName(device.name || 'Unknown'));

        const disconnectChannel = eventChannel<Event>((emit) => {
            device.addEventListener('gattserverdisconnected', emit);
            return (): void =>
                device.removeEventListener('gattserverdisconnected', emit);
        }, buffers.sliding(1));

        defer.push(() => disconnectChannel.close());

        const gatt = device.gatt;
        if (!gatt) {
            yield* put(bleSlice.actions.didFailToConnectBle('GATT not available'));
            return;
        }
        const server = yield* call(() => gatt.connect());
        // on failure: disconnectChannel.close();
        const deviceInfoService = yield* call(() =>
            server.getPrimaryService(deviceInformationServiceUUID),
        );
        const pybricksService = yield* call(() =>
            server.getPrimaryService(pybricksServiceUUID),
        );

        // const uartService = yield* call(() =>
        //   server?.getPrimaryService(nordicUartServiceUUID)
        // );
        // const uartRxChar = yield* call(() =>
        //   pybricksService.getCharacteristic(nordicUartRxCharUUID)
        // );
        // const uartTxChar = yield* call(() =>
        //   pybricksService.getCharacteristic(nordicUartTxCharUUID)
        // );

        // Firmware Revision
        try {
            const firmwareRevision = yield* call(() =>
                deviceInfoService.getCharacteristic(firmwareRevisionStringUUID),
            );
            const firmwareRevisionValue = yield* call(() =>
                firmwareRevision.readValue(),
            );
            const firmwareVersion = decoder.decode(firmwareRevisionValue);
            yield* put(bleSlice.actions.didReadFirmwareVersion(firmwareVersion));
        } catch {
            // NOOP
        }

        // Software Revision
        try {
            const softwareRevision = yield* call(() =>
                deviceInfoService.getCharacteristic(softwareRevisionStringUUID),
            );
            const softwareRevisionValue = yield* call(() =>
                softwareRevision.readValue(),
            );
            const softwareVersion = decoder.decode(softwareRevisionValue);
            yield* put(bleSlice.actions.didReadSoftwareVersion(softwareVersion));
        } catch {
            // NOOP
        }

        // PnP ID
        try {
            const pnpId = yield* call(() =>
                deviceInfoService.getCharacteristic(pnpIdUUID),
            );
            const pnpIdValue = yield* call(() => pnpId.readValue());
            const pnpIdDecoded = decodePnpId(pnpIdValue);
            const pnpHubType = getHubTypeName(pnpIdDecoded);
            yield* put(bleSlice.actions.didReadPnpHubType(pnpHubType));
        } catch {
            // NOOP
        }

        // Hub Capabilities
        try {
            const hubCapabilities = yield* call(() =>
                pybricksService.getCharacteristic(
                    pybricksHubCapabilitiesCharacteristicUUID,
                ),
            );
            const hubCapabilitiesValue = yield* call(() => hubCapabilities.readValue());
            const maxWriteSize = hubCapabilitiesValue.getUint16(0, true) || 20;
            const maxUserProgramSize = hubCapabilitiesValue.getUint32(6, true) || 20;
            const flags = hubCapabilitiesValue.getUint32(2, true);
            yield* put(
                bleSlice.actions.didReadHubCapabilities({
                    maxWriteSize,
                    capabilitiesFlags: flags,
                    maxUserProgramSize,
                }),
            );
        } catch {
            // NOOP
        }

        // Subscribe to Pybricks Control characteristic
        const pybricksControlChar = yield* subscribeToPybricksControl(
            pybricksService,
            defer,
            tasks,
        );

        // TODO: Nordic UART (for testing with nRF Connect)
        //tasks.push(yield* takeEvery(writeUart, handleWriteUart, uartRxChar));

        yield* put(
            bleSlice.actions.didConnectDevice({
                device,
                server,
                pybricksControlChar,
            }),
        );

        // Handle disconnect requests
        const handleDisconnectRequest = function* (): Generator {
            yield* take(disconnectBle);

            yield* call(handleDisconnectBle);
        };

        // fork a dedicated task to handle disconnect requests
        yield* fork(handleDisconnectRequest);

        // wait for disconnection
        yield* take(disconnectChannel);

        // cleanup
        yield* put(bleSlice.actions.didDisconnectBle());

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        yield* put(
            bleSlice.actions.didFailToConnectBle(error?.message || 'Unknown error'),
        );
    } finally {
        yield* cancel(tasks);

        while (defer.length > 0) {
            defer.pop()?.();
        }
    }
}

function* subscribeToPybricksControl(
    pybricksService: BluetoothRemoteGATTService,
    defer: (() => void)[],
    tasks: Task[],
) {
    const pybricksControlChar = yield* call(() =>
        pybricksService.getCharacteristic(pybricksControlEventCharacteristicUUID),
    );

    const pybricksControlChannel = eventChannel<DataView>((emit) => {
        const listener = (): void => {
            if (!pybricksControlChar.value) {
                return;
            }
            emit(pybricksControlChar.value);
        };

        pybricksControlChar.addEventListener('characteristicvaluechanged', listener);

        return (): void =>
            pybricksControlChar.removeEventListener(
                'characteristicvaluechanged',
                listener,
            );
    });

    const handlePybricksControlValueChanged =
        createPybricksControlValueChangedHandler();
    defer.push(() => pybricksControlChannel.close());
    tasks.push(
        yield* takeEvery(pybricksControlChannel, handlePybricksControlValueChanged),
    );

    // tasks.push(
    //     yield* takeEvery(writeCommand, handleWriteCommand, pybricksControlChar),
    // );

    // Start notifications
    yield* call(() => pybricksControlChar.startNotifications());
    return pybricksControlChar;
}

function* handleDisconnectBle() {
    const state = yield* select(getBleState);
    const { pybricksControlChar, server, device } = state;

    if (!device || !server) {
        return;
    }
    try {
        if (pybricksControlChar) {
            yield* call(() =>
                pybricksControlChar.writeValueWithResponse(new Uint8Array([0x00])),
            );
            //pybricksControlChar.removeEventListener(
            yield* call(() => pybricksControlChar.stopNotifications());
        }
        yield* call(() => server.disconnect());
        yield* put(bleSlice.actions.didDisconnectBle());
    } catch {
        // NOOP
    }
}

function createPybricksControlValueChangedHandler() {
    let msgStdoutBuffer = '';
    return function* handlePybricksControlValueChanged(data: DataView): Generator {
        const decoder = new TextDecoder();
        const responseType = getEventType(data);
        const message = new Uint8Array(
            data.buffer,
            data.byteOffset + 1,
            data.byteLength - 1,
        );
        switch (responseType) {
            case EventType.WriteStdout: {
                const commandData = decoder.decode(message);
                msgStdoutBuffer += commandData;
                break;
            }
            case EventType.StatusReport: {
                const status = parseStatusReport(data);
                yield put(bleSlice.actions.didReadStatusReport(status));
                if (msgStdoutBuffer.length) {
                    yield put(bleSlice.actions.didReceiveWriteStdout(msgStdoutBuffer));
                    msgStdoutBuffer = '';
                }
            }
        }
    };
}

export function* bleSaga() {
    yield* takeEvery(bleSlice.actions.connectBle.type, handleConnectBle);
    yield* takeEvery(bleSlice.actions.disconnectBle.type, handleDisconnectBle);
}
