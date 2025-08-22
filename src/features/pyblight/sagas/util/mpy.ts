const encoder = new TextEncoder();

export function encodeUInt32LE(value: number): ArrayBuffer {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    view.setUint32(0, value, true);
    return buf;
}

export function cString(str: string): Uint8Array {
    return encoder.encode(str + '\x00');
}

export function xor8(data: Iterable<number>): number {
    let checksum = 0xff;
    for (const n of data) {
        checksum ^= n & 0xff;
    }
    return checksum;
}
