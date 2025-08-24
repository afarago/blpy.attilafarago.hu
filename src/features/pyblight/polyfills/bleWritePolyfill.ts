// Polyfill for writeValueWithResponse and writeValueWithoutResponse

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (window as any).BluetoothRemoteGATTCharacteristic !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proto = (window as any).BluetoothRemoteGATTCharacteristic.prototype as any;

    if (!proto.writeValueWithResponse) {
        proto.writeValueWithResponse = function (value: BufferSource) {
            // Fallback to writeValue if available
            if (typeof this.writeValue === 'function') {
                return this.writeValue(value);
            }
            return Promise.reject(
                new Error(
                    'writeValueWithResponse and writeValue are not supported on this device',
                ),
            );
        };
    }

    if (!proto.writeValueWithoutResponse) {
        proto.writeValueWithoutResponse = function (value: BufferSource) {
            // Fallback to writeValue if available
            if (typeof this.writeValue === 'function') {
                return this.writeValue(value);
            }
            return Promise.reject(
                new Error(
                    'writeValueWithoutResponse and writeValue are not supported on this device',
                ),
            );
        };
    }
}
