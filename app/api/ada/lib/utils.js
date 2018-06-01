// @flow
import bs58 from 'bs58';

export const unixTimestampToDate = (timestamp: number) => new Date(timestamp * 1000);

export const localeDateToUnixTimestamp =
  (localeDate: string) => new Date(localeDate).getTime();

export function mapToList(map: any): Array<any> {
  return Object.values(map);
}

export function getAddressInHex(address: string): string {
  const bytes = bs58.decode(address);
  return bytes.toString('hex');
}

export function saveInStorage(key: string, toSave: any): void {
  localStorage.setItem(key, JSON.stringify(toSave));
}

export function getFromStorage(key: string): any {
  const result = localStorage.getItem(key);
  if (result) return JSON.parse(result);
  return undefined;
}
