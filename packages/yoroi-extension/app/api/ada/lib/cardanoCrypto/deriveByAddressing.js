// @flow
import type { Addressing } from '../storage/models/PublicDeriver/interfaces';
import { RustModule } from './rustLoader';

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
    derivedKey = derivedKey.derive(request.addressing.path[i]);
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
    derivedKey = derivedKey.derive(request.addressing.path[i]);
  }
  return derivedKey;
}