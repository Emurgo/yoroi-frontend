// @flow

declare function toWords(bytes: ArrayLike<number>): number[];
declare function fromWordsUnsafe(words: ArrayLike<number>): number[] | void;
declare function fromWords(words: ArrayLike<number>): number[];
declare module "bech32" {
  declare export var bech32: BechLib;
  declare export var bech32m: BechLib;
  declare export interface Decoded {
      prefix: string;
      words: number[];
  }
  declare export interface BechLib {
      decodeUnsafe: (str: string, LIMIT?: number | void) => Decoded | void;
      decode: (str: string, LIMIT?: number | void) => Decoded;
      encode: (prefix: string, words: ArrayLike<number>, LIMIT?: number | void) => string;
      toWords: typeof toWords;
      fromWordsUnsafe: typeof fromWordsUnsafe;
      fromWords: typeof fromWords;
  }
}
