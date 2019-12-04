// @flow

import type { CoreAddressT } from '../database/primitives/enums';
import { CoreAddressTypes } from '../database/primitives/enums';
import { Bech32Prefix } from '../../../../../config/stringConfig';
import { RustModule } from '../../cardanoCrypto/rustLoader';

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

export function groupToSingle(
  groupAddress: string
): string {
  const wasmAddr = RustModule.WalletV3.Address.from_bytes(
    Buffer.from(groupAddress, 'hex')
  );
  const wasmGroupAddr = wasmAddr.to_group_address();
  if (wasmGroupAddr == null) {
    throw new Error('groupToSingle not a group address ' + groupAddress);
  }
  const singleWasm = RustModule.WalletV3.Address.single_from_public_key(
    wasmGroupAddr.get_spending_key(),
    wasmAddr.get_discrimination()
  );
  const asString = Buffer.from(singleWasm.as_bytes()).toString('hex');

  return asString;
}

export function verifyAddress(
  address: string,
  isShelley: boolean,
): boolean {
  if (isShelley) {
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

export function addressToDisplayString(
  address: string
): string {
  try {
    // Need to try parsing as a legacy address first
    // Since parsing as bech32 directly may give a wrong result if the address contains a 1
    RustModule.WalletV2.Address.from_base58(address);
    return address;
  } catch (_e1) {
    try {
      const wasmAddr = RustModule.WalletV3.Address.from_bytes(
        Buffer.from(address, 'hex')
      );
      return wasmAddr.to_string(Bech32Prefix.ADDRESS);
    } catch (_e2) {
      throw new Error('addressToKind failed to parse address type ' + address);
    }
  }
}
