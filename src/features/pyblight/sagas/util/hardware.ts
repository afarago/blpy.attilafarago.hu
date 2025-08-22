export const pybricksServiceUUID = "c5f50001-8280-46da-89f4-6d8051e4aeef";
export const pybricksControlEventCharacteristicUUID =
  "c5f50002-8280-46da-89f4-6d8051e4aeef";
export const pybricksHubCapabilitiesCharacteristicUUID =
  "c5f50003-8280-46da-89f4-6d8051e4aeef";
export const deviceInformationServiceUUID = 0x180a;
export const firmwareRevisionStringUUID = 0x2a26;
export const softwareRevisionStringUUID = 0x2a28;
export const pnpIdUUID = 0x2a50;
export const nordicUartServiceUUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
export const nordicUartRxCharUUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
export const nordicUartTxCharUUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
export const nordicUartSafeTxCharLength = 20;

export function decodePnpId(data: DataView): PnpId {
  return {
    vendorIdSource: data.getUint8(0),
    vendorId: data.getUint16(1, true),
    productId: data.getUint16(3, true),
    productVersion: data.getUint16(5, true),
  };
}

export function getHubTypeName(pnpId: PnpId): string {
  if (pnpId.vendorIdSource !== PnpIdVendorIdSource.BluetoothSig) {
    return "USB";
  }

  if (pnpId.vendorId !== LegoCompanyId) {
    return "non-LEGO";
  }

  switch (pnpId.productId) {
    case HubType.MoveHub:
      return "Move hub";
    case HubType.CityHub:
      return "City hub";
    case HubType.TechnicHub:
      return "Technic hub";
    case HubType.TechnicLargeHub:
      switch (pnpId.productVersion) {
        case TechnicLargeHubVariant.SpikePrimeHub:
          return "Prime hub";
        case TechnicLargeHubVariant.MindstormsInventorHub:
          return "Inventor hub";
      }
      break;
    case HubType.TechnicSmallHub:
      switch (pnpId.productVersion) {
        case TechnicSmallHubVariant.SpikeEssentialHub:
          return "Essential hub";
      }
      break;
  }

  return "Unsupported";
}

export const LegoCompanyId = 0x0397;

export enum HubType {
  /** WeDo 2.0 uses different protocol so shouldn't be seen in LWP3. */
  WeDo2Hub = 0x00,
  /** Duplo train hub. */
  DuploTrainHub = 0x20,
  /** BOOST Move hub.  */
  MoveHub = 0x40,
  /** 2-port System hub. */
  CityHub = 0x41,
  /** Remote Control. */
  Handset = 0x42,
  /** Mario minifig. */
  Mario = 0x43,
  /** Luigi minifig. */
  Luigi = 0x44,
  /** 4-port Technic hub. */
  TechnicHub = 0x80,
  /** 6-port SPIKE/MINDSTORMS hub. */
  TechnicLargeHub = 0x81,
  /** 2-port SPIKE hub. */
  TechnicSmallHub = 0x83,
}

export enum TechnicLargeHubVariant {
  /** Yellow SPIKE Prime variant. */
  SpikePrimeHub = 0,
  /** Teal MINDSTORMS Robot Inventor variant. */
  MindstormsInventorHub = 1,
}

export enum TechnicSmallHubVariant {
  /** Yellow SPIKE Essential variant. */
  SpikeEssentialHub = 0,
}

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

export enum PnpIdVendorIdSource {
  /** The vendor ID was assigned by the Bluetooth SIG. */
  BluetoothSig = 1,
  /** The vendor and product IDs were assigned by the USB implementors forum. */
  UsbImpForum = 2,
}

export type PnpId = {
  /** For Pybricks hubs, this should be PnpIdVendorIdSource.BluetoothSig */
  vendorIdSource: PnpIdVendorIdSource;
  /** For Pybricks hubs, this should be LegoCompanyId (from ble-lwp3-service/protocol). */
  vendorId: number;
  /** For Pybricks hubs, this should be one of HubType (from ble-lwp3-service/protocol). */
  productId: number;
  /** For Pybricks hubs, this should be hub variant if applicable (from ble-lwp3-service/protocol). */
  productVersion: number;
};
