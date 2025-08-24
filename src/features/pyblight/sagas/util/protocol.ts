export enum CommandType {
    /**
     * Request to stop the user program, if it is running.
     *
     * @since Pybricks Profile v1.0.0
     */
    StopUserProgram = 0,
    /**
     * Request to start the user program.
     *
     * @since Pybricks Profile v1.2.0 - changed in v1.4.0
     */
    StartUserProgram = 1,
    /**
     *  Request to start the interactive REPL.
     *
     * @since Pybricks Profile v1.2.0 - removed in v1.4.0
     */
    StartRepl = 2,
    /**
     *  Request to write user program metadata.
     *
     * @since Pybricks Profile v1.2.0
     */
    WriteUserProgramMeta = 3,
    /**
     * Request to write to user RAM.
     *
     * @since Pybricks Profile v1.2.0
     */
    WriteUserRam = 4,
    /**
     * Request to reboot in firmware update mode.
     *
     * @since Pybricks Profile v1.2.0
     */
    ResetInUpdateMode = 5,
    /**
     * Request to write data to stdin.
     *
     * @since Pybricks Profile v1.3.0
     */
    WriteStdin = 6,
    /**
     * Requests to write to a buffer that is pre-allocated by a user program.
     *
     * Parameters:
     * - offset: The offset from the buffer base address (16-bit little-endian
     *   unsigned integer).
     * - payload: The data to write.
     *
     * @since Pybricks Profile v1.4.0
     */
    WriteAppData = 7,
}

export enum BuiltinProgramId {
    /**
     * Requests to start the built-in REPL on stdio.
     *
     * @since Pybricks Profile v1.4.0
     */
    REPL = 0x80,
    /**
     * Requests to start the built-in sensor port view monitoring program.
     *
     * @since Pybricks Profile v1.4.0
     */
    PortView = 0x81,
    /**
     * Requests to start the built-in IMU calibration program.
     *
     * @since Pybricks Profile v1.4.0
     */
    IMUCalibration = 0x82,
}

export function statusToFlag(status: Status): number {
    return 1 << status;
}

export function createStartUserProgramCommand(
    slot: number | BuiltinProgramId,
): Uint8Array {
    const msg = new Uint8Array(2);
    msg[0] = CommandType.StartUserProgram;
    msg[1] = slot;
    return msg;
}

export function createStopUserProgramCommand(): Uint8Array {
    const msg = new Uint8Array(1);
    msg[0] = CommandType.StopUserProgram;
    return msg;
}

export function createWriteUserRamCommand(
    offset: number,
    payload: ArrayBuffer,
): Uint8Array {
    const msg = new Uint8Array(5 + payload.byteLength);
    const view = new DataView(msg.buffer);
    view.setUint8(0, CommandType.WriteUserRam);
    view.setUint32(1, offset, true);
    msg.set(new Uint8Array(payload), 5);
    return msg;
}

export function createWriteUserProgramMetaCommand(size: number): Uint8Array {
    const msg = new Uint8Array(5);
    const view = new DataView(msg.buffer);
    view.setUint8(0, CommandType.WriteUserProgramMeta);
    view.setUint32(1, size, true);
    return msg;
}

export enum EventType {
    /**
     * Status report event.
     *
     * Received when notifications are enabled and when status changes.
     *
     * @since Pybricks Profile v1.0.0
     */
    StatusReport = 0,
    /**
     * Hub wrote to stdout event.
     *
     * @since Pybricks Profile v1.3.0
     */
    WriteStdout = 1,
    /**
     * Hub wrote to AppData event.
     *
     * @since Pybricks Profile v1.4.0
     */
    WriteAppData = 2,
}

/** Status indications received by Event.StatusReport */
export enum Status {
    /**
     * Battery voltage is low.
     *
     * @since Pybricks Profile v1.0.0
     */
    BatteryLowVoltageWarning = 0,
    /**
     * Battery voltage is critically low.
     *
     * @since Pybricks Profile v1.0.0
     */
    BatteryLowVoltageShutdown = 1,
    /**
     * Battery current is too high.
     *
     * @since Pybricks Profile v1.0.0
     */
    BatteryHighCurrent = 2,
    /**
     * Bluetooth Low Energy is advertising/discoverable.
     *
     * @since Pybricks Profile v1.0.0
     */
    BLEAdvertising = 3,
    /**
     * Bluetooth Low Energy has low signal.
     *
     * @since Pybricks Profile v1.0.0
     */
    BLELowSignal = 4,
    /**
     * Power button is currently pressed.
     *
     * @since Pybricks Profile v1.0.0
     */
    PowerButtonPressed = 5,
    /**
     * User program is currently running.
     *
     * @since Pybricks Profile v1.0.0
     */
    UserProgramRunning = 6,
    /**
     * Hub is shutting down.
     *
     * @since Pybricks Profile v1.1.0
     */
    Shutdown = 7,
}

export function getEventType(msg: DataView): EventType {
    return msg.getUint8(0) as EventType;
}

export function parseStatusReport(msg: DataView): {
    flags: number;
    slot: number;
} {
    // assert(msg.getUint8(0) === EventType.StatusReport, 'expecting status report event');
    return {
        flags: msg.getUint32(1, true),
        slot: msg.byteLength > 5 ? msg.getUint8(5) : 0,
    };
}

export function hex(n: number, pad: number): string {
    return `0x${n.toString(16).padStart(pad, '0')}`;
}

export class ProtocolError extends Error {
    constructor(message: string, public value: DataView) {
        super(message);
    }
}
