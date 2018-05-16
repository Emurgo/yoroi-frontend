// @flow
export const unixTimestampToDate = (timestamp: number) => new Date(timestamp * 1000);

export function listToMap(list) {
  const map = {};
  list.forEach((index, value) => {
    map[index] = value;
  });
  return map;
}

export function mapToList(map) {
  return Object.values(map);
}
