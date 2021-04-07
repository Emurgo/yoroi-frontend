// @flow

declare class Blake2b {
  update(input: Uint8Array): this;
  digest(out: "hex"): string;
  digest(out: "binary" | Uint8Array): Uint8Array;
}
declare module 'blake2b' {
  declare export default function createHash(
    outlen?: number,
    key?: Uint8Array | void,
    salt?: Uint8Array | void,
    personal?: Uint8Array | void,
    noAssert?: boolean
  ): Blake2b;
}
