// @flow

import type { CoreAddressT } from '../database/primitives/enums';
import { CoreAddressTypes } from '../database/primitives/enums';
import { Bech32Prefix } from '../../../../../config/stringConfig';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import type { NetworkRow } from '../database/primitives/tables';
import { isJormungandr, isCardanoHaskell } from '../database/prepackaged/networks';
import { defineMessages, } from 'react-intl';
import type { $npm$ReactIntl$MessageDescriptor, } from 'react-intl';

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
  if (RustModule.WalletV4.ByronAddress.is_valid(address)) {
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

export function isValidReceiveAddress(
  bech32: string,
  network: $ReadOnly<NetworkRow>,
): true | [false, $Exact<$npm$ReactIntl$MessageDescriptor>] {
  const messages = defineMessages({
    invalidAddress: {
      id: 'wallet.send.form.errors.invalidAddress',
      defaultMessage: '!!!Please enter a valid address.',
    },
    cannotSendToLegacy: {
      id: 'wallet.send.form.cannotSendToLegacy',
      defaultMessage: '!!!You cannot send to legacy addresses (any address created before November 29th, 2019)',
    },
    cannotSendToReward: {
      id: 'wallet.send.form.cannotSendToReward',
      defaultMessage: '!!!You cannot send to a reward account',
    },
  });

  const kind = tryAddressToKind(bech32, 'bech32', network);
  if (kind == null) {
    return [false, messages.invalidAddress];
  }
  if (isJormungandr(network)) {
    if (kind === CoreAddressTypes.CARDANO_LEGACY) {
      return [false, messages.cannotSendToLegacy];
    }
    if (isJormungandrAddress(kind)) {
      return true;
    }
    return [false, messages.invalidAddress];
  }
  if (isCardanoHaskell(network)) {
    if (kind === CoreAddressTypes.CARDANO_REWARD) {
      return [false, messages.cannotSendToLegacy];
    }
    if (isCardanoHaskellAddress(kind)) {
      return true;
    }
    return [false, messages.invalidAddress];
  }

  throw new Error(`${nameof(isValidReceiveAddress)} Unsupported network ${JSON.stringify(network)}`);
}

export function byronAddrToHex(
  base58Addr: string
): string {
  return Buffer.from(RustModule.WalletV4.ByronAddress.from_base58(
    base58Addr
  ).to_bytes()).toString('hex');
}

export function normalizeToBase58(
  addr: string
): void | string {
  // in Shelley, addresses can be base16, bech32 or base58
  // this function normalizes everything to base58

  // 1) If already base58, simply return
  if (RustModule.WalletV4.ByronAddress.is_valid(addr)) {
    return addr;
  }

  // 2) Try converting from base16
  try {
    const wasmAddr = RustModule.WalletV4.Address.from_bytes(
      Buffer.from(addr, 'hex')
    );
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(wasmAddr);
    if (byronAddr) return byronAddr.to_base58();
    return undefined; // wrong address kind
  } catch (_e) {} // eslint-disable-line no-empty

  // 3) Try converting from base32
  try {
    const wasmAddr = RustModule.WalletV4.Address.from_bech32(addr);
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(wasmAddr);
    if (byronAddr) return byronAddr.to_base58();
    return undefined; // wrong address kind
  } catch (_e) {} // eslint-disable-line no-empty

  return undefined;
}

export function normalizeToAddress(
  addr: string
): void | RustModule.WalletV4.Address {
  // in Shelley, addresses can be base16, bech32 or base58
  // this function, we try parsing in all encodings possible

  // 1) Try converting from base58
  if (RustModule.WalletV4.ByronAddress.is_valid(addr)) {
    return RustModule.WalletV4.ByronAddress.from_base58(addr).to_address();
  }

  // 2) If already base16, simply return
  try {
    return RustModule.WalletV4.Address.from_bytes(
      Buffer.from(addr, 'hex')
    );
  } catch (_e) {} // eslint-disable-line no-empty

  // 3) Try converting from base32
  try {
    return RustModule.WalletV4.Address.from_bech32(addr);
  } catch (_e) {} // eslint-disable-line no-empty

  return undefined;
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
  baseAddress: string
): string {
  const wasmAddr = RustModule.WalletV4.Address.from_bytes(
    Buffer.from(baseAddress, 'hex')
  );
  const baseAddr = RustModule.WalletV4.BaseAddress.from_address(wasmAddr);
  if (baseAddr == null) {
    throw new Error(`${nameof(baseToEnterprise)} not a base address ` + baseAddress);
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
  addr: RustModule.WalletV4.Address,
): (
  // null -> legacy address (no key hash)
  // undefined -> script hash instead of key hash
  RustModule.WalletV4.Ed25519KeyHash | null | void
) {
  {
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(addr);
    if (byronAddr) return null;
  }
  {
    const baseAddr = RustModule.WalletV4.BaseAddress.from_address(addr);
    if (baseAddr) return baseAddr.payment_cred().to_keyhash();
  }
  {
    const ptrAddr = RustModule.WalletV4.PointerAddress.from_address(addr);
    if (ptrAddr) return ptrAddr.payment_cred().to_keyhash();
  }
  {
    const enterpriseAddr = RustModule.WalletV4.EnterpriseAddress.from_address(addr);
    if (enterpriseAddr) return enterpriseAddr.payment_cred().to_keyhash();
  }
  {
    const rewardAddr = RustModule.WalletV4.RewardAddress.from_address(addr);
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
  if (RustModule.WalletV4.ByronAddress.is_valid(address)) {
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
      const wasmAddr = RustModule.WalletV4.Address.from_bytes(
        Buffer.from(address, 'hex')
      );
      const byronAddr = RustModule.WalletV4.ByronAddress.from_address(wasmAddr);
      if (byronAddr == null) {
        return wasmAddr.to_bech32();
      }
      return byronAddr.to_base58();
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
  if (RustModule.WalletV4.ByronAddress.is_valid(address)) {
    return address;
  }
  try {
    if (isJormungandr(network)) {
      return Buffer.from(
        // bech32
        RustModule.WalletV3.Address.from_string(address).as_bytes()
      ).toString('hex');
    }
    if (isCardanoHaskell(network)) {
      const wasmAddr = RustModule.WalletV4.Address.from_bech32(address);
      const byronAddr = RustModule.WalletV4.ByronAddress.from_address(wasmAddr);
      if (byronAddr == null) {
        return Buffer.from(wasmAddr.to_bytes()).toString('hex');
      }
      return byronAddr.to_base58();
    }
    throw new Error(`${nameof(addressToKind)} not implemented for network ${network.NetworkId}`);
  } catch (_e2) {
    throw new Error(`${nameof(getAddressPayload)} failed to parse address type ` + address);
  }
}
