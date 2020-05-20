// @flow

import type { CoreAddressT } from '../database/primitives/enums';
import { CoreAddressTypes } from '../database/primitives/enums';
import { Bech32Prefix } from '../../../../../config/stringConfig';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import type {
  AccountStateDelegation,
  PoolTuples,
} from '../../state-fetch/types';

export function tryAddressToKind(
  address: string,
  parseAs: 'bech32' | 'bytes',
): void | CoreAddressT {
  try {
    return addressToKind(address, parseAs);
  } catch (_e) {
    return undefined;
  }
}

export function addressToKind(
  address: string,
  parseAs: 'bech32' | 'bytes',
): CoreAddressT {
  // Need to try parsing as a legacy address first
  // Since parsing as bech32 directly may give a wrong result if the address contains a 1
  if (RustModule.WalletV2.Address.is_valid(address)) {
    return CoreAddressTypes.CARDANO_LEGACY;
  }
  try {
    const wasmAddr = parseAs === 'bytes'
      ? RustModule.WalletV3.Address.from_bytes(Buffer.from(address, 'hex'))
      : RustModule.WalletV3.Address.from_string(address);

    switch (wasmAddr.get_kind()) {
      case RustModule.WalletV3.AddressKind.Single: return CoreAddressTypes.SHELLEY_SINGLE;
      case RustModule.WalletV3.AddressKind.Group: return CoreAddressTypes.SHELLEY_GROUP;
      case RustModule.WalletV3.AddressKind.Account: return CoreAddressTypes.SHELLEY_ACCOUNT;
      case RustModule.WalletV3.AddressKind.Multisig: return CoreAddressTypes.SHELLEY_MULTISIG;
      default: throw new Error(`${nameof(addressToKind)} unknown address type ` + address);
    }
  } catch (e1) {
    throw new Error(`${nameof(addressToKind)} failed to parse address type ${e1} ${address}`);
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

export function addressToDisplayString(
  address: string
): string {
  // Need to try parsing as a legacy address first
  // Since parsing as bech32 directly may give a wrong result if the address contains a 1
  if (RustModule.WalletV2.Address.is_valid(address)) {
    return address;
  }
  try {
    const wasmAddr = RustModule.WalletV3.Address.from_bytes(
      Buffer.from(address, 'hex')
    );
    return wasmAddr.to_string(Bech32Prefix.ADDRESS);
  } catch (_e2) {
    throw new Error(`${nameof(addressToDisplayString)} failed to parse address type ` + address);
  }
}

export function getAddressPayload(
  address: string
): string {
  // Need to try parsing as a legacy address first
  // Since parsing as bech32 directly may give a wrong result if the address contains a 1
  if (RustModule.WalletV2.Address.is_valid(address)) {
    return address;
  }
  try {
    return Buffer.from(
      RustModule.WalletV3.Address.from_string(address).as_bytes()
    ).toString('hex');
  } catch (_e2) {
    throw new Error(`${nameof(getAddressPayload)} failed to parse address type ` + address);
  }
}

export function groupAddrContainsAccountKey(
  address: string,
  targetAccountKey: string,
  acceptTypeMismatch: boolean,
): boolean {
  const wasmAddr = RustModule.WalletV3.Address.from_bytes(
    Buffer.from(address, 'hex')
  );
  if (wasmAddr.get_kind() !== RustModule.WalletV3.AddressKind.Group) {
    return acceptTypeMismatch;
  }
  const groupKey = wasmAddr.to_group_address();
  if (groupKey == null) return acceptTypeMismatch;
  const accountKey = groupKey.get_account_key();
  const accountKeyString = Buffer.from(accountKey.as_bytes()).toString('hex');
  return targetAccountKey === accountKeyString;
}

export function filterAddressesByStakingKey<T: { address: string, ... }>(
  stakingKey: RustModule.WalletV3.PublicKey,
  utxos: Array<T>,
  acceptTypeMismatch: boolean,
): Array<T> {
  const stakingKeyString = Buffer.from(stakingKey.as_bytes()).toString('hex');
  const result = [];
  for (const utxo of utxos) {
    if (groupAddrContainsAccountKey(utxo.address, stakingKeyString, acceptTypeMismatch)) {
      result.push(utxo);
    }
  }
  return result;
}

export function unwrapStakingKey(
  stakingAddress: string,
): RustModule.WalletV3.PublicKey {
  const accountAddress = RustModule.WalletV3.Address.from_bytes(
    Buffer.from(stakingAddress, 'hex')
  ).to_account_address();
  if (accountAddress == null) {
    throw new Error(`${nameof(unwrapStakingKey)} staking key invalid`);
  }
  const stakingKey = accountAddress.get_account_key();

  return stakingKey;
}

export function delegationTypeToResponse(
  type: RustModule.WalletV3.DelegationType,
): AccountStateDelegation {
  const kind = type.get_kind();
  switch (kind) {
    case RustModule.WalletV3.DelegationKind.NonDelegated: return { pools: [], };
    case RustModule.WalletV3.DelegationKind.Full: {
      const poolId = type.get_full();
      if (poolId == null) {
        throw new Error(`${nameof(delegationTypeToResponse)} Should never happen`);
      }
      return {
        pools: [[poolId.to_string(), 1]]
      };
    }
    case RustModule.WalletV3.DelegationKind.Ratio: {
      const ratios = type.get_ratios();
      if (ratios == null) {
        throw new Error(`${nameof(delegationTypeToResponse)} Should never happen`);
      }
      const poolTuples: Array<PoolTuples> = [];
      const pools = ratios.pools();
      for (let i = 0; i < pools.size(); i++) {
        const pool = pools.get(i);
        poolTuples.push([pool.pool().to_string(), pool.parts()]);
      }
      return {
        pools: poolTuples,
      };
    }
    default: throw new Error(`${nameof(delegationTypeToResponse)} unexpected kind ${kind}`);
  }
}
