// @flow
export const unixTimestampToDate = (timestamp: number) => new Date(timestamp * 1000);

export const localeDateToUnixTimestamp = (localeDate: string) => new Date(localeDate).getTime();
