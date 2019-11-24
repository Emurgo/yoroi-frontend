// @flow

import type { CoreAddressT } from '../database/primitives/enums';
import { CoreAddressTypes } from '../database/primitives/enums';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import envrionment from '../../../../../environment';

export function addressToKind(
  address: string
): CoreAddressT {
  try {
    // Need to try parsing as a legacy address first
    // Since parsing as bech32 directly may give a wrong result if the address contains a 1
    RustModule.WalletV2.Address.from_base58(address);
    return CoreAddressTypes.CARDANO_LEGACY;
  } catch (_e1) {
    try {
      const wasmAddr = RustModule.WalletV3.Address.from_bytes(
        Buffer.from(address, 'hex')
      );
      switch (wasmAddr.get_kind()) {
        case RustModule.WalletV3.AddressKind.Single: return CoreAddressTypes.SHELLEY_SINGLE;
        case RustModule.WalletV3.AddressKind.Group: return CoreAddressTypes.SHELLEY_GROUP;
        case RustModule.WalletV3.AddressKind.Account: return CoreAddressTypes.SHELLEY_ACCOUNT;
        case RustModule.WalletV3.AddressKind.Multisig: return CoreAddressTypes.SHELLEY_MULTISIG;
        default: throw new Error('addressToKind unknown address type ' + address);
      }
    } catch (_e2) {
      throw new Error('addressToKind failed to parse address type ' + address);
    }
  }
}

export function verifyAddress(
  address: string
): boolean {
  if (envrionment.isShelley()) {
    try {
      RustModule.WalletV3.Address.from_string(address);
      return true;
    } catch (_e2) {
      return false;
    }
  } else {
    try {
      RustModule.WalletV2.Address.from_base58(address);
      return true;
    } catch (_e1) {
      return false;
    }
  }
}
