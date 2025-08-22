import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export enum BleStatus {
  Disconnected = "disconnected",
  Connecting = "connecting",
  Connected = "connected",
  Disconnecting = "disconnecting",
}

export interface BleState {
  status: BleStatus;
  device: BluetoothDevice | null;
  server: BluetoothRemoteGATTServer | null;
  pybricksControlChar: BluetoothRemoteGATTCharacteristic | null;
  // uartRxChar: BluetoothRemoteGATTCharacteristic | null;
  // uartTxChar: BluetoothRemoteGATTCharacteristic | null;
  firmwareVersion: string | null;
  softwareVersion: string | null;
  pnpHubType: string | null;
  maxWriteSize: number;
  capabilitiesFlags: number;
  maxUserProgramSize: number;
  statusFlags: number;
  statusSlot: number;
  stdoutMessage: string;
  appDataMessage: string;
}

const initialState: BleState = {
  status: BleStatus.Disconnected,
  device: null,
  server: null,
  pybricksControlChar: null,
  // uartRxChar: null,
  // uartTxChar: null,
  firmwareVersion: null,
  softwareVersion: null,
  pnpHubType: null,
  maxWriteSize: 20,
  capabilitiesFlags: 0,
  maxUserProgramSize: 20,
  statusFlags: 0,
  statusSlot: 0,
  stdoutMessage: "",
  appDataMessage: "",
};

export const bleSlice = createSlice({
  name: "ble",
  initialState,
  reducers: {
    connectBle: (state) => {
      state.status = BleStatus.Connecting;
    },
    disconnectBle: (state) => {
      state.status = BleStatus.Disconnecting;
    },
    didFailToConnectBle: (
      state,
      _action: PayloadAction<string | undefined>
    ) => {
      state.status = BleStatus.Disconnected;
    },
    didDisconnectBle: (state) => {
      // state.status = "disconnected";
      state.device = null;
      state.server = null;
      state.pybricksControlChar = null;
      Object.assign(state, bleSlice.getInitialState());
    },
    didReadFirmwareVersion: (state, action: PayloadAction<string>) => {
      state.firmwareVersion = action.payload;
    },
    didReadSoftwareVersion: (state, action: PayloadAction<string>) => {
      state.softwareVersion = action.payload;
    },
    didReadPnpHubType: (state, action: PayloadAction<string>) => {
      state.pnpHubType = action.payload;
    },
    didReadHubCapabilities: (
      state,
      action: PayloadAction<{
        maxWriteSize: number;
        capabilitiesFlags: number;
        maxUserProgramSize: number;
      }>
    ) => {
      state.maxWriteSize = action.payload.maxWriteSize;
      state.capabilitiesFlags = action.payload.capabilitiesFlags;
      state.maxUserProgramSize = action.payload.maxUserProgramSize;
    },
    didConnectDevice: (
      state,
      action: PayloadAction<{
        device: BluetoothDevice;
        server: BluetoothRemoteGATTServer;
        pybricksControlChar: BluetoothRemoteGATTCharacteristic | null;
      }>
    ) => {
      const { device, server, pybricksControlChar } = action.payload;
      state.status = BleStatus.Connected;
      state.device = device;
      state.server = server;
      state.pybricksControlChar = pybricksControlChar;
    },
    didReceiveWriteStdout: (state, action: PayloadAction<string>) => {
      state.stdoutMessage += action.payload;
    },
    didReceiveWriteAppData: (state, action: PayloadAction<string>) => {
      state.appDataMessage += action.payload;
    },
    didReadStatusReport: (
      state,
      action: PayloadAction<{
        flags: number;
        slot: number;
      }>
    ) => {
      state.statusFlags = action.payload.flags;
      state.statusSlot = action.payload.slot;
    },
  },
});

export default bleSlice.reducer;
export const { connectBle, disconnectBle } = bleSlice.actions;
