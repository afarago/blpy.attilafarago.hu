import { eventChannel, type EventChannel } from "redux-saga";
import { call, fork, put, select, take, takeEvery } from "typed-redux-saga";
import { getBleState } from "../selectors";
import { bleSlice } from "../slices/ble";
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
} from "./util/hardware";
import { EventType, getEventType, parseStatusReport } from "./util/protocol";

function* handleConnectBle() {
  const decoder = new TextDecoder();

  if (navigator.bluetooth === undefined) {
    yield* put(
      bleSlice.actions.didFailToConnectBle("WebBluetooth not supported")
    );
    return;
  }
  if (!(yield* call(() => navigator.bluetooth.getAvailability()))) {
    yield* put(bleSlice.actions.didFailToConnectBle("Bluetooth not available"));
    return;
  }

  try {
    const device: BluetoothDevice = yield* call(() =>
      navigator.bluetooth.requestDevice({
        filters: [{ services: [pybricksServiceUUID] }],
        optionalServices: [pybricksServiceUUID, deviceInformationServiceUUID],
      })
    );

    const onDisconnected = function () {
      // This will be handled by didDisconnectBle action
    };
    device.addEventListener("gattserverdisconnected", onDisconnected);

    const gatt = device.gatt;
    if (!gatt) {
      yield* put(bleSlice.actions.didFailToConnectBle("GATT not available"));
      return;
    }
    const server = yield* call(() => gatt.connect());
    const deviceInfoService = yield* call(() =>
      server.getPrimaryService(deviceInformationServiceUUID)
    );
    const pybricksService = yield* call(() =>
      server.getPrimaryService(pybricksServiceUUID)
    );
    const pybricksControlChar = yield* call(() =>
      pybricksService.getCharacteristic(pybricksControlEventCharacteristicUUID)
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
        deviceInfoService.getCharacteristic(firmwareRevisionStringUUID)
      );
      const firmwareRevisionValue = yield* call(() =>
        firmwareRevision.readValue()
      );
      const firmwareVersion = decoder.decode(firmwareRevisionValue);
      yield* put(bleSlice.actions.didReadFirmwareVersion(firmwareVersion));
    } catch {
      // NOOP
    }

    // Software Revision
    try {
      const softwareRevision = yield* call(() =>
        deviceInfoService.getCharacteristic(softwareRevisionStringUUID)
      );
      const softwareRevisionValue = yield* call(() =>
        softwareRevision.readValue()
      );
      const softwareVersion = decoder.decode(softwareRevisionValue);
      yield* put(bleSlice.actions.didReadSoftwareVersion(softwareVersion));
    } catch {
      // NOOP
    }

    // PnP ID
    try {
      const pnpId = yield* call(() =>
        deviceInfoService.getCharacteristic(pnpIdUUID)
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
          pybricksHubCapabilitiesCharacteristicUUID
        )
      );
      const hubCapabilitiesValue = yield* call(() =>
        hubCapabilities.readValue()
      );
      const maxWriteSize = hubCapabilitiesValue.getUint16(0, true) || 20;
      const maxUserProgramSize = hubCapabilitiesValue.getUint32(6, true) || 20;
      const flags = hubCapabilitiesValue.getUint32(2, true);
      yield* put(
        bleSlice.actions.didReadHubCapabilities({
          maxWriteSize,
          capabilitiesFlags: flags,
          maxUserProgramSize,
        })
      );
    } catch {
      // NOOP
    }

    // Watch characteristic changes
    yield* fork(watchPybricksControlCharacteristic, pybricksControlChar);

    // Start notifications
    yield* call(() => pybricksControlChar.startNotifications());
    yield* put(
      bleSlice.actions.didConnectDevice({
        device,
        server,
        pybricksControlChar,
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    yield* put(
      bleSlice.actions.didFailToConnectBle(error?.message || "Unknown error")
    );
  }
}

function* handleDisconnectBle() {
  const state = yield* select(getBleState);
  const { pybricksControlChar, server, device } = state;

  if (!device || !server) {
    return;
  }
  try {
    if (pybricksControlChar) {
      yield* call(() => pybricksControlChar.writeValue(new Uint8Array([0x00])));
      //pybricksControlChar.removeEventListener(
      yield* call(() => pybricksControlChar.stopNotifications());
    }
    yield* call(() => server.disconnect());
    yield* put(bleSlice.actions.didDisconnectBle());
  } catch {
    // NOOP
  }
}

// Helper to create the channel
function createCharacteristicChannel(char: BluetoothRemoteGATTCharacteristic) {
  return eventChannel((emit) => {
    const handler = (event: Event) => {
      emit(event);
    };
    char.addEventListener("characteristicvaluechanged", handler);
    return () => {
      char.removeEventListener("characteristicvaluechanged", handler);
    };
  });
}

function* watchPybricksControlCharacteristic(
  characteristic: BluetoothRemoteGATTCharacteristic
) {
  // Create a channel to listen for events
  const decoder = new TextDecoder();
  const chan: EventChannel<Event> = yield call(
    createCharacteristicChannel,
    characteristic
  );
  let msgStdoutBuffer = "";
  try {
    while (true) {
      const event: Event = yield take(chan);
      const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
      if (value) {
        const dview = new DataView(value.buffer);
        const responseType = getEventType(dview);
        const message = new Uint8Array(
          value.buffer,
          value.byteOffset + 1,
          value.byteLength - 1
        );
        switch (responseType) {
          // case EventType.WriteAppData:
          case EventType.WriteStdout: {
            const commandData = decoder.decode(message);
            msgStdoutBuffer += commandData;
            break;
          }
          case EventType.StatusReport: {
            const status = parseStatusReport(dview);
            yield put(bleSlice.actions.didReadStatusReport(status));

            if (msgStdoutBuffer.length) {
              yield put(
                bleSlice.actions.didReceiveWriteStdout(msgStdoutBuffer)
              );
              msgStdoutBuffer = "";
            }
          }
        }
      }
    }
  } finally {
    chan.close();
  }
}

export function* bleSaga() {
  yield* takeEvery(bleSlice.actions.connectBle.type, handleConnectBle);
  yield* takeEvery(bleSlice.actions.disconnectBle.type, handleDisconnectBle);
}
