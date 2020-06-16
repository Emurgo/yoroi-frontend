// @flow

declare module "bs58check" {
  declare function encode(input: Buffer): string;
  declare function decode(input: string): Buffer;
  declare function decodeUnsafe(input: string): Buffer;
}
