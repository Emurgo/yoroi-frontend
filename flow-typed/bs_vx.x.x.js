// @flow

declare module "bs58" {
  declare function encode(input: Buffer): string;
  declare function decode(input: string): Buffer;
}
