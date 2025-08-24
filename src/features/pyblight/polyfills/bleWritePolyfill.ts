// Polyfill for writeValueWithResponse and writeValueWithoutResponse

if (typeof (window as any).BluetoothRemoteGATTCharacteristic !== 'undefined') {
    const proto = (window as any).BluetoothRemoteGATTCharacteristic.prototype as any;

    if (!proto.writeValueWithResponse) {
        proto.writeValueWithResponse = function (value: BufferSource) {
            // Fallback to writeValue if available
            if (typeof this.writeValue === 'function') {
                return this.writeValue(value);
            }
            return Promise.reject(
                new Error('writeValueWithResponse and writeValue are not supported on this device')
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
                new Error('writeValueWithoutResponse and writeValue are not supported on this device')
            );
        };
    }
}
