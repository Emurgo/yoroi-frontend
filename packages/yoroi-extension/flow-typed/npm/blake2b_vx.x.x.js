// @flow

declare class Blake2b {
  update(input: Uint8Array): this;
  digest(out: "hex"): string;
  digest(out: "binary" | Uint8Array): Uint8Array;
}
declare module 'blake2b' {
  declare export default function createHash(
    outlen?: number,
    key?: Uint8Array | undefined,
    salt?: Uint8Array | undefined,
    personal?: Uint8Array | undefined,
    noAssert?: boolean
  ): Blake2b;
}
