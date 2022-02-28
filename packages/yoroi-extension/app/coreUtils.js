// @flow

export function bytesToHex(bytes: *): string {
  return Buffer.from(bytes).toString('hex');
}

export function hexToBytes(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}