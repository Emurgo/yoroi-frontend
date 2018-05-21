const bs58 = require('bs58');

// @flow
export const unixTimestampToDate = (timestamp: number) => new Date(timestamp * 1000);

export const localeDateToUnixTimestamp =
  (localeDate: string) => new Date(localeDate).getTime();

export function mapToList(map) {
  return Object.values(map);
}

export function getAddressInHex(address) {
  const bytes = bs58.decode(address);
  return bytes.toString('hex');
}
