// @flow

export const KeyKind = Object.freeze({
  BIP32ED25519: 0,
  BIP32: 1,
});
export type KeyKindType = $Values<typeof KeyKind>;
export const KeySubkind = Object.freeze({
  Public: 0,
  Private: 1,
});
export type KeySubkindType = $Values<typeof KeySubkind>;

export interface IKey {
  toBuffer(): Buffer;
  getType(): KeyKindType;
}

export interface IKeyDerivation {
}

export interface IPrivate {
  sign(data: Buffer): Buffer;

  /**
   * Since the public key can support different functionality than the private key
   * The best we can do is return a generic type from this function
   * and have the user re-assert any functionality
   */
  toPublic(): IKey & IPublic
}

export interface IPublic {
  verify(data: Buffer, signature: Buffer): boolean;
}
