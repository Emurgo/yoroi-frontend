// @flow

import { RustModule } from './rustLoader';

export function v4SecretToV2(
  v4Key: RustModule.WalletV4.Bip32PrivateKey,
): RustModule.WalletV2.PrivateKey {
  return RustModule.WalletV2.PrivateKey.from_hex(
    Buffer.from(v4Key.as_bytes()).toString('hex')
  );
}
export function v4PublicToV2(
  v4Key: RustModule.WalletV4.Bip32PublicKey,
): RustModule.WalletV2.PublicKey {
  return RustModule.WalletV2.PublicKey.from_hex(
    Buffer.from(v4Key.as_bytes()).toString('hex')
  );
}
