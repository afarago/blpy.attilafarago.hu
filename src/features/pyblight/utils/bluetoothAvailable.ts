export function isBluetoothAvailable(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.bluetooth;
}
