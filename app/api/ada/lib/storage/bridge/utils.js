// @flow

import type { CoreAddressT } from '../database/primitives/enums';
import { CoreAddressTypes } from '../database/primitives/enums';
import { Bech32Prefix } from '../../../../../config/stringConfig';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import type { NetworkRow } from '../database/primitives/tables';
import { isJormungandr, isCardanoHaskell } from '../database/prepackaged/networks';

export function tryAddressToKind(
  address: string,
  parseAs: 'bech32' | 'bytes',
  network: $ReadOnly<NetworkRow>,
): void | CoreAddressT {
  try {
    return addressToKind(address, parseAs, network);
  } catch (_e) {
    return undefined;
  }
}

export function addressToKind(
  address: string,
  parseAs: 'bech32' | 'bytes',
  network: $ReadOnly<NetworkRow>,
): CoreAddressT {
  // Need to try parsing as a legacy address first
  // Since parsing as bech32 directly may give a wrong result if the address contains a 1
  if (RustModule.WalletV2.Address.is_valid(address)) {
    return CoreAddressTypes.CARDANO_LEGACY;
  }
  try {
    if (isJormungandr(network)) {
      const wasmAddr = parseAs === 'bytes'
        ? RustModule.WalletV3.Address.from_bytes(Buffer.from(address, 'hex'))
        : RustModule.WalletV3.Address.from_string(address);

      switch (wasmAddr.get_kind()) {
        case RustModule.WalletV3.AddressKind.Single: return CoreAddressTypes.JORMUNGANDR_SINGLE;
        case RustModule.WalletV3.AddressKind.Group: return CoreAddressTypes.JORMUNGANDR_GROUP;
        case RustModule.WalletV3.AddressKind.Account: return CoreAddressTypes.JORMUNGANDR_ACCOUNT;
        case RustModule.WalletV3.AddressKind.Multisig: return CoreAddressTypes.JORMUNGANDR_MULTISIG;
        default: throw new Error(`${nameof(addressToKind)} unknown address type ` + address);
      }
    }
    if (isCardanoHaskell(network)) {
      const wasmAddr = parseAs === 'bytes'
        ? RustModule.WalletV4.Address.from_bytes(Buffer.from(address, 'hex'))
        : RustModule.WalletV4.Address.from_bech32(address);
      {
        const byronAddr = RustModule.WalletV4.ByronAddress.from_address(wasmAddr);
        if (byronAddr) return CoreAddressTypes.CARDANO_LEGACY;
      }
      {
        const baseAddr = RustModule.WalletV4.BaseAddress.from_address(wasmAddr);
        if (baseAddr) return CoreAddressTypes.CARDANO_BASE;
      }
      {
        const ptrAddr = RustModule.WalletV4.PointerAddress.from_address(wasmAddr);
        if (ptrAddr) return CoreAddressTypes.CARDANO_PTR;
      }
      {
        const enterpriseAddr = RustModule.WalletV4.EnterpriseAddress.from_address(wasmAddr);
        if (enterpriseAddr) return CoreAddressTypes.CARDANO_ENTERPRISE;
      }
      {
        const rewardAddr = RustModule.WalletV4.RewardAddress.from_address(wasmAddr);
        if (rewardAddr) return CoreAddressTypes.CARDANO_REWARD;
      }
      throw new Error(`${nameof(getCardanoAddrKeyHash)} unknown address type`);
    }
    throw new Error(`${nameof(addressToKind)} not implemented for network ${network.NetworkId}`);
  } catch (e1) {
    throw new Error(`${nameof(addressToKind)} failed to parse address type ${e1} ${address}`);
  }
}

export function byronAddrToHex(
  base58Addr: string
): string {
  return Buffer.from(RustModule.WalletV4.ByronAddress.from_base58(
    base58Addr
  ).to_bytes()).toString('hex');
}

export function isJormungandrAddress(
  kind: CoreAddressT
): boolean {
  if (kind === CoreAddressTypes.JORMUNGANDR_SINGLE) return true;
  if (kind === CoreAddressTypes.JORMUNGANDR_GROUP) return true;
  if (kind === CoreAddressTypes.JORMUNGANDR_ACCOUNT) return true;
  if (kind === CoreAddressTypes.JORMUNGANDR_MULTISIG) return true;
  return false;
}

export function baseToEnterprise(
  groupAddress: string
): string {
  const wasmAddr = RustModule.WalletV4.Address.from_bytes(
    Buffer.from(groupAddress, 'hex')
  );
  const baseAddr = RustModule.WalletV4.BaseAddress.from_address(wasmAddr);
  if (baseAddr == null) {
    throw new Error(`${nameof(baseToEnterprise)} not a group address ` + groupAddress);
  }
  const singleAddr = RustModule.WalletV4.EnterpriseAddress.new(
    wasmAddr.network_id(),
    baseAddr.payment_cred(),
  );
  const asString = Buffer.from(singleAddr.to_address().to_bytes()).toString('hex');

  return asString;
}

export function isCardanoHaskellAddress(
  kind: CoreAddressT
): boolean {
  if (kind === CoreAddressTypes.CARDANO_LEGACY) return true;
  if (kind === CoreAddressTypes.CARDANO_BASE) return true;
  if (kind === CoreAddressTypes.CARDANO_PTR) return true;
  if (kind === CoreAddressTypes.CARDANO_ENTERPRISE) return true;
  if (kind === CoreAddressTypes.CARDANO_REWARD) return true;
  return false;
}

export function getCardanoAddrKeyHash(
  addr: string | RustModule.WalletV4.Address,
): (
  // null -> legacy address (no key hash)
  // undefined -> script hash instead of key hash
  RustModule.WalletV4.Ed25519KeyHash | null | void
) {
  const wasmAddr = typeof addr === 'string'
    ? RustModule.WalletV4.Address.from_bytes(Buffer.from(addr, 'hex'))
    : addr;
  {
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(wasmAddr);
    if (byronAddr) return null;
  }
  {
    const baseAddr = RustModule.WalletV4.BaseAddress.from_address(wasmAddr);
    if (baseAddr) return baseAddr.payment_cred().to_keyhash();
  }
  {
    const ptrAddr = RustModule.WalletV4.PointerAddress.from_address(wasmAddr);
    if (ptrAddr) return ptrAddr.payment_cred().to_keyhash();
  }
  {
    const enterpriseAddr = RustModule.WalletV4.EnterpriseAddress.from_address(wasmAddr);
    if (enterpriseAddr) return enterpriseAddr.payment_cred().to_keyhash();
  }
  {
    const rewardAddr = RustModule.WalletV4.RewardAddress.from_address(wasmAddr);
    if (rewardAddr) return rewardAddr.payment_cred().to_keyhash();
  }
  throw new Error(`${nameof(getCardanoAddrKeyHash)} unknown address type`);
}

export function addressToDisplayString(
  address: string,
  network: $ReadOnly<NetworkRow>,
): string {
  // Need to try parsing as a legacy address first
  // Since parsing as bech32 directly may give a wrong result if the address contains a 1
  if (RustModule.WalletV2.Address.is_valid(address)) {
    return address;
  }
  try {
    if (isJormungandr(network)) {
      const wasmAddr = RustModule.WalletV3.Address.from_bytes(
        Buffer.from(address, 'hex')
      );
      return wasmAddr.to_string(Bech32Prefix.ADDRESS);
    }
    if (isCardanoHaskell(network)) {
      throw new Error(`${nameof(addressToKind)} not implemented for network ${network.NetworkId}`);
    }
    throw new Error(`${nameof(addressToKind)} not implemented for network ${network.NetworkId}`);
  } catch (_e2) {
    throw new Error(`${nameof(addressToDisplayString)} failed to parse address type ` + address);
  }
}

export function getAddressPayload(
  address: string,
  network: $ReadOnly<NetworkRow>,
): string {
  // Need to try parsing as a legacy address first
  // Since parsing as bech32 directly may give a wrong result if the address contains a 1
  if (RustModule.WalletV2.Address.is_valid(address)) {
    return address;
  }
  try {
    if (isJormungandr(network)) {
      return Buffer.from(
        RustModule.WalletV3.Address.from_string(address).as_bytes()
      ).toString('hex');
    }
    if (isCardanoHaskell(network)) {
      throw new Error(`${nameof(addressToKind)} not implemented for network ${network.NetworkId}`);
    }
    throw new Error(`${nameof(addressToKind)} not implemented for network ${network.NetworkId}`);
  } catch (_e2) {
    throw new Error(`${nameof(getAddressPayload)} failed to parse address type ` + address);
  }
}
