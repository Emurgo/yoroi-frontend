// @flow

export const checkIfElementsInArrayAreUnique = async function (
  arr: Array<string>
): Promise<boolean> {
  return (new Set(arr)).size === arr.length;
};
