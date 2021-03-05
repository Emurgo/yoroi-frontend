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

export function derivePublicByAddressing(request: {|
  addressing: $PropertyType<Addressing, 'addressing'>,
  startingFrom: {|
    key: RustModule.WalletV4.Bip32PublicKey,
    level: number,
  |},
|}): RustModule.WalletV4.Bip32PublicKey {
  if (request.startingFrom.level + 1 < request.addressing.startLevel) {
    throw new Error(`${nameof(derivePublicByAddressing)} keyLevel < startLevel`);
  }
  let derivedKey = request.startingFrom.key;
  for (
    let i = request.startingFrom.level - request.addressing.startLevel + 1;
    i < request.addressing.path.length;
    i++
  ) {
    derivedKey = derivedKey.derive(
      request.addressing.path[i]
    );
  }
  return derivedKey;
}
export function derivePrivateByAddressing(request: {|
  addressing: $PropertyType<Addressing, 'addressing'>,
  startingFrom: {|
    key: RustModule.WalletV4.Bip32PrivateKey,
    level: number,
  |},
|}): RustModule.WalletV4.Bip32PrivateKey {
  if (request.startingFrom.level + 1 < request.addressing.startLevel) {
    throw new Error(`${nameof(derivePrivateByAddressing)} keyLevel < startLevel`);
  }
  let derivedKey = request.startingFrom.key;
  for (
    let i = request.startingFrom.level - request.addressing.startLevel + 1;
    i < request.addressing.path.length;
    i++
  ) {
    derivedKey = derivedKey.derive(
      request.addressing.path[i]
    );
  }
  return derivedKey;
}
