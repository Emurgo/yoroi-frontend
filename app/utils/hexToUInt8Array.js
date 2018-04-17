// Convert from hex string to UInt8Array
export default function hexToUInt8Array(input) {
  let hexString = input.slice(0, input.length);
  const result = [];
  while (hexString.length >= 2) {
    result.push(parseInt(hexString.substring(0, 2), 16));
    hexString = hexString.substring(2, hexString.length);
  }
  return result;
}
