// @flow

export const ellipsis = (str:string, maxChars:number): string => (
  str.length > maxChars ? str.substr(0, maxChars) + '\u2026' : str
);
