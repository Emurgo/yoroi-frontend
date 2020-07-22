
// @flow

import { RustModule } from '../../../../ada/lib/cardanoCrypto/rustLoader';
import type {
  AccountStateDelegation,
  PoolTuples,
} from '../../state-fetch/types';

export function groupToSingle(
  groupAddress: string
): string {
  const wasmAddr = RustModule.WalletV3.Address.from_bytes(
    Buffer.from(groupAddress, 'hex')
  );
  const wasmGroupAddr = wasmAddr.to_group_address();
  if (wasmGroupAddr == null) {
    throw new Error(`${nameof(groupToSingle)} not a group address ` + groupAddress);
  }
  const singleWasm = RustModule.WalletV3.Address.single_from_public_key(
    wasmGroupAddr.get_spending_key(),
    wasmAddr.get_discrimination()
  );
  const asString = Buffer.from(singleWasm.as_bytes()).toString('hex');

  return asString;
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

export function filterAddressesByStakingKey<T: { +address: string, ... }>(
  stakingKey: RustModule.WalletV3.PublicKey,
  utxos: $ReadOnlyArray<$ReadOnly<T>>,
  acceptTypeMismatch: boolean,
): $ReadOnlyArray<$ReadOnly<T>> {
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
