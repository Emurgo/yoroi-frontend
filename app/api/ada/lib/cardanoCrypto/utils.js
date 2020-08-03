// @flow

import { RustModule } from './rustLoader';
import type {
  Addressing,
} from '../storage/models/PublicDeriver/interfaces';

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

export function derivePublicByAddressing(
  keyLevel: number,
  addressing: $PropertyType<Addressing, 'addressing'>,
  key: RustModule.WalletV4.Bip32PublicKey,
): RustModule.WalletV4.Bip32PublicKey {
  if (keyLevel + 1 < addressing.startLevel) {
    throw new Error(`${nameof(derivePublicByAddressing)} keyLevel < startLevel`);
  }
  let derivedKey = key;
  for (let i = keyLevel - addressing.startLevel + 1; i < addressing.path.length; i++) {
    derivedKey = derivedKey.derive(
      addressing.path[i]
    );
  }
  return derivedKey;
}
export function derivePrivateByAddressing(
  keyLevel: number,
  addressing: $PropertyType<Addressing, 'addressing'>,
  key: RustModule.WalletV4.Bip32PrivateKey,
): RustModule.WalletV4.Bip32PrivateKey {
  if (keyLevel + 1 < addressing.startLevel) {
    throw new Error(`${nameof(derivePrivateByAddressing)} keyLevel < startLevel`);
  }
  let derivedKey = key;
  for (let i = keyLevel - addressing.startLevel + 1; i < addressing.path.length; i++) {
    derivedKey = derivedKey.derive(
      addressing.path[i]
    );
  }
  return derivedKey;
}
