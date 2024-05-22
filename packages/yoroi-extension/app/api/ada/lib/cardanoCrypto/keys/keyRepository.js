// @flow

import {
  Mixin,
} from 'mixwith';
import type {
  IKey,
  IKeyDerivation,
  KeyKindType,
  IPrivate,
  IPublic,
} from './types';
import {
  KeyKind,
} from './types';
import { RustModule } from '../rustLoader';
import type { BIP32Interface } from 'bip32';
import { fromBase58, fromPublicKey } from 'bip32';
import { decode, encode } from 'bs58check';

// ================
//   BIP32ED25519
// ================

export class BIP32ED25519PublicKey implements IKey, IKeyDerivation, IPublic {
  key: RustModule.WalletV4.Bip32PublicKey;

  // warning: don't use this function as it's won't decorate the object correctly
  constructor(key: RustModule.WalletV4.Bip32PublicKey) {
    this.key = key;
  }

  toBuffer(): Buffer {
    return Buffer.from(this.key.as_bytes());
  }

  getType(): KeyKindType {
    return KeyKind.BIP32ED25519;
  }

  verify(data: Buffer, signature: Buffer): boolean {
    return RustModule.WasmScope(Scope => {
      return this.key.to_raw_key().verify(
        data,
        Scope.WalletV4.Ed25519Signature.from_bytes(signature)
      );
    });
  }

  static fromBuffer(buff: Buffer): BIP32ED25519PublicKey {
    const key = RustModule.WalletV4.Bip32PublicKey.from_bytes(buff);
    return BIP32ED25519PublicKey.fromV3Key(key);
  }

  static fromV3Key(key: RustModule.WalletV4.Bip32PublicKey): BIP32ED25519PublicKey {
    const newKey = annotateBIP32ED25519PublicKey(BIP32ED25519PublicKey);
    return new newKey(key);
  }
}
function annotateBIP32ED25519PublicKey(
  clazz: Class<BIP32ED25519PublicKey>
): Class<BIP32ED25519PublicKey> {
  return PublicKey(KeyDerivation(clazz));
}

export class BIP32ED25519PrivateKey implements IKey, IKeyDerivation, IPrivate {
  key: RustModule.WalletV4.Bip32PrivateKey;

  // warning: don't use this function as it's won't decorate the object correctly
  constructor(key: RustModule.WalletV4.Bip32PrivateKey) {
    this.key = key;
  }

  toBuffer(): Buffer {
    return Buffer.from(this.key.as_bytes());
  }

  getType(): KeyKindType {
    return KeyKind.BIP32ED25519;
  }

  sign(data: Buffer): Buffer {
    return Buffer.from(this.key.to_raw_key().sign(data).to_hex(), 'hex');
  }

  toPublic(): BIP32ED25519PublicKey {
    const pubKey = this.key.to_public();
    return BIP32ED25519PublicKey.fromV3Key(pubKey);
  }

  static fromBuffer(buff: Buffer): BIP32ED25519PrivateKey {
    const key = RustModule.WalletV4.Bip32PrivateKey.from_bytes(buff);
    return BIP32ED25519PrivateKey.fromV3Key(key);
  }

  static fromV3Key(key: RustModule.WalletV4.Bip32PrivateKey): BIP32ED25519PrivateKey {
    const newKey = annotateBIP32ED25519PrivateKey(BIP32ED25519PrivateKey);
    return new newKey(key);
  }
}

function annotateBIP32ED25519PrivateKey(
  clazz: Class<BIP32ED25519PrivateKey>
): Class<BIP32ED25519PrivateKey> {
  return PrivateKey(KeyDerivation(clazz));
}

// =========
//   BIP32
// =========

export class BIP32PublicKey implements IKey, IKeyDerivation, IPublic {
  key: BIP32Interface;

  // warning: don't use this function as it's won't decorate the object correctly
  constructor(key: BIP32Interface) {
    this.key = key;
  }

  toBuffer(): Buffer {
    return decode(this.key.toBase58());
  }

  getType(): KeyKindType {
    return KeyKind.BIP32;
  }

  verify(data: Buffer, signature: Buffer): boolean {
    return this.key.verify(
      data,
      signature
    );
  }

  static fromBuffer(buff: Buffer): BIP32PublicKey {
    const key = fromBase58(encode(buff));
    return BIP32PublicKey.fromBip32(key);
  }

  static fromBip32(key: BIP32Interface): BIP32PublicKey {
    const newKey = annotateBIP32PublicKey(BIP32PublicKey);
    return new newKey(key);
  }
}
function annotateBIP32PublicKey(
  clazz: Class<BIP32PublicKey>
): Class<BIP32PublicKey> {
  return PublicKey(KeyDerivation(clazz));
}

export class BIP32PrivateKey implements IKey, IKeyDerivation, IPrivate {
  key: BIP32Interface;

  // warning: don't use this function as it's won't decorate the object correctly
  constructor(key: BIP32Interface) {
    this.key = key;
  }

  toBuffer(): Buffer {
    return decode(this.key.toBase58());
  }

  getType(): KeyKindType {
    return KeyKind.BIP32;
  }

  sign(data: Buffer): Buffer {
    return this.key.sign(data);
  }

  toPublic(): BIP32PublicKey {
    const pubKey = fromPublicKey(this.key.publicKey, this.key.chainCode);
    return BIP32PublicKey.fromBip32(pubKey);
  }

  static fromBuffer(buff: Buffer): BIP32PrivateKey {
    const key = fromBase58(encode(buff));
    return BIP32PrivateKey.fromBip32(key);
  }

  static fromBip32(key: BIP32Interface): BIP32PrivateKey {
    const newKey = annotateBIP32PrivateKey(BIP32PrivateKey);
    return new newKey(key);
  }
}

function annotateBIP32PrivateKey(
  clazz: Class<BIP32PrivateKey>
): Class<BIP32PrivateKey> {
  return PrivateKey(KeyDerivation(clazz));
}


interface Empty {}

// =================
//   KeyDerivation
// =================

type KeyDerivationDependencies = IKeyDerivation;
const KeyDerivationMixin = (
  superclass: Class<KeyDerivationDependencies>,
) => (class KeyDerivation extends superclass {
});
const KeyDerivation: * = Mixin<
  KeyDerivationDependencies,
  Empty,
>(KeyDerivationMixin);
export function asKeyDerivationInstance<
  T: Empty
>(
  obj: T
): void | (IKeyDerivation & KeyDerivationDependencies & T) {
  if (obj instanceof KeyDerivation) {
    return obj;
  }
  return undefined;
}

// ==============
//   PrivateKey
// ==============

type PrivateKeyDependencies = IPrivate;
const PrivateKeyMixin = (
  superclass: Class<PrivateKeyDependencies>,
) => (class PrivateKey extends superclass {
});
const PrivateKey: * = Mixin<
  PrivateKeyDependencies,
  Empty,
>(PrivateKeyMixin);
export function asPrivateKeyInstance<
  T: Empty
>(
  obj: T
): void | (IPrivate & PrivateKeyDependencies & T) {
  if (obj instanceof PrivateKey) {
    return obj;
  }
  return undefined;
}

// =============
//   PublicKey
// =============

type PublicKeyDependencies = IPublic;
const PublicKeyMixin = (
  superclass: Class<PublicKeyDependencies>,
) => (class PublicKey extends superclass {
});
const PublicKey: * = Mixin<
  PublicKeyDependencies,
  Empty,
>(PublicKeyMixin);
export function asPublicKeyInstance<
  T: Empty
>(
  obj: T
): void | (IPublic & PublicKeyDependencies & T) {
  if (obj instanceof PublicKey) {
    return obj;
  }
  return undefined;
}

/**
 * Unlike Typescript, Flow doesn't allow function that return "this"
 * so instead we mimic this behavior using this utility function
 */
export function deriveKey<T: IKeyDerivation>(key: T, index: number): T {
  /** simply deriving a key should never change its type so we can safely coerce to T */
  const coerceToT = (obj: any): T => obj;
  if (key instanceof BIP32ED25519PrivateKey) {
    return coerceToT(BIP32ED25519PrivateKey.fromV3Key(key.key.derive(index)));
  }
  if (key instanceof BIP32ED25519PublicKey) {
    return coerceToT(BIP32ED25519PublicKey.fromV3Key(key.key.derive(index)));
  }
  if (key instanceof BIP32PrivateKey) {
    return coerceToT(BIP32PrivateKey.fromBip32(key.key.derive(index)));
  }
  if (key instanceof BIP32PublicKey) {
    return coerceToT(BIP32PublicKey.fromBip32(key.key.derive(index)));
  }
  throw new Error(`Unexpected class in ${nameof(deriveKey)}`);
}
export function derivePath<T: IKeyDerivation>(startingKey: T, path: $ReadOnlyArray<number>): T {
  let currKey = startingKey;
  for (let i = 0; i < path.length; i++) {
    currKey = deriveKey(currKey, path[i]);
  }
  return currKey;
}
