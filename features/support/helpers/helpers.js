// @flow

export const checkIfElementsInArrayAreUnique = function (
  arr: Array<string>
): boolean {
  return (new Set(arr)).size === arr.length;
};
