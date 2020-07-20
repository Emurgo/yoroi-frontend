// @flow

import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';

export function v4Bip32PrivateToV3(
  v4key: RustModule.WalletV4.Bip32PrivateKey,
): RustModule.WalletV3.Bip32PrivateKey {
  return RustModule.WalletV3.Bip32PrivateKey.from_bytes(v4key.as_bytes());
}
export function v3Bip32PrivateToV4(
  v3key: RustModule.WalletV3.Bip32PrivateKey,
): RustModule.WalletV4.Bip32PrivateKey {
  return RustModule.WalletV4.Bip32PrivateKey.from_bytes(v3key.as_bytes());
}

export function v3SecretToV2(
  v3Key: RustModule.WalletV3.Bip32PrivateKey,
): RustModule.WalletV2.PrivateKey {
  return RustModule.WalletV2.PrivateKey.from_hex(
    Buffer.from(v3Key.as_bytes()).toString('hex')
  );
}
export function v3PublicToV2(
  v3Key: RustModule.WalletV3.Bip32PublicKey,
): RustModule.WalletV2.PublicKey {
  return RustModule.WalletV2.PublicKey.from_hex(
    Buffer.from(v3Key.as_bytes()).toString('hex')
  );
}

/**
 * Will return undefined for Daedalus addresses (can't be represented by v3 WASM)
 */
export function v2SecretToV3(
  v2Key: RustModule.WalletV2.PrivateKey,
): RustModule.WalletV3.Bip32PrivateKey | void {
  try {
    return RustModule.WalletV3.Bip32PrivateKey.from_bytes(
      Buffer.from(v2Key.to_hex(), 'hex')
    );
  } catch (_e) {
    return undefined;
  }
}
/**
 * Will return undefined for Daedalus addresses (can't be represented by v3 WASM)
 */
export function v2PublicToV3(
  v2Key: RustModule.WalletV2.PublicKey,
): RustModule.WalletV3.Bip32PublicKey | void {
  try {
    return RustModule.WalletV3.Bip32PublicKey.from_bytes(
      Buffer.from(v2Key.to_hex(), 'hex')
    );
  } catch (_e) {
    return undefined;
  }
}
