// @flow

import BigNumber from 'bignumber.js';
import {
  getCertificates,
} from '../models/utils';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import {
  asGetAllUtxos,
} from '../models/PublicDeriver/traits';
import {
  PublicDeriver,
} from '../models/PublicDeriver/index';
import {
  normalizeToAddress,
  unwrapStakingKey,
} from './utils';
import { TxStatusCodes } from '../database/primitives/enums';
import type { CertificateInsert } from '../database/primitives/tables';
import type {
  GetDelegatedBalanceRequest,
  GetDelegatedBalanceResponse,
  GetCurrentDelegationRequest,
  GetCurrentDelegationResponse,
  PoolTuples,
} from '../../../../common/lib/storage/bridge/delegationUtils';

export async function getDelegatedBalance(
  request: GetDelegatedBalanceRequest,
): Promise<GetDelegatedBalanceResponse> {
  const utxoPart = await getUtxoDelegatedBalance(
    request.publicDeriver,
    request.stakingAddress,
  );

  return {
    utxoPart,
    accountPart: new BigNumber(request.rewardBalance),
  };
}

export function addrContainsAccountKey(
  address: string,
  targetAccountKey: RustModule.WalletV4.StakeCredential,
  acceptTypeMismatch: boolean,
): boolean {
  const wasmAddr = normalizeToAddress(address);
  if (wasmAddr == null) throw new Error(`${nameof(addrContainsAccountKey)} invalid address ${address}`);

  const accountKeyString = Buffer.from(targetAccountKey.to_bytes()).toString('hex');

  const asBase = RustModule.WalletV4.BaseAddress.from_address(wasmAddr);
  if (asBase != null) {
    if (Buffer.from(asBase.stake_cred().to_bytes()).toString('hex') === accountKeyString) {
      return true;
    }
  }
  const asPointer = RustModule.WalletV4.PointerAddress.from_address(wasmAddr);
  if (asPointer != null) {
    // TODO
  }
  return acceptTypeMismatch;
}

export function filterAddressesByStakingKey<T: { +address: string, ... }>(
  stakingKey: RustModule.WalletV4.StakeCredential,
  utxos: $ReadOnlyArray<$ReadOnly<T>>,
  acceptTypeMismatch: boolean,
): $ReadOnlyArray<$ReadOnly<T>> {
  const result = [];
  for (const utxo of utxos) {
    if (addrContainsAccountKey(utxo.address, stakingKey, acceptTypeMismatch)) {
      result.push(utxo);
    }
  }
  return result;
}

export async function getUtxoDelegatedBalance(
  publicDeriver: PublicDeriver<>,
  stakingAddress: string,
): Promise<BigNumber> {
  const withUtxos = asGetAllUtxos(publicDeriver);
  if (withUtxos == null) {
    return new BigNumber(0);
  }
  const basePubDeriver = withUtxos;

  // TODO: need to also deal with pointer address summing
  // can get most recent pointer from getCurrentDelegation result

  const stakingKey = unwrapStakingKey(stakingAddress);
  const allUtxo = await basePubDeriver.getAllUtxos();
  const allUtxosForKey = filterAddressesByStakingKey(
    stakingKey,
    allUtxo,
    false,
  );
  const utxoSum = allUtxosForKey.reduce(
    (sum, utxo) => sum.plus(new BigNumber(utxo.output.UtxoTransactionOutput.Amount)),
    new BigNumber(0)
  );

  return utxoSum;
}

export async function getCurrentDelegation(
  request: GetCurrentDelegationRequest,
): Promise<GetCurrentDelegationResponse> {
  const allDelegations = await getCertificates(
    request.publicDeriver.getDb(),
    [request.stakingKeyAddressId]
  );
  // recall: results are sorted by block order
  const result = {
    currEpoch: undefined,
    prevEpoch: undefined,
    prevPrevEpoch: undefined,
    fullHistory: allDelegations,
  };
  const seenPools = new Set<string>();
  for (const delegation of allDelegations) {
    const block = delegation.block;
    if (block == null) {
      continue;
    }
    const relativeSlot = request.toRelativeSlotNumber(block.SlotNum);

    // only look at successful txs
    if (delegation.transaction.Status !== TxStatusCodes.IN_BLOCK) {
      continue;
    }
    const kind = delegation.certificate.Kind;
    if (
      kind !== RustModule.WalletV4.CertificateKind.StakeDeregistration &&
      kind !== RustModule.WalletV4.CertificateKind.StakeDelegation
    ) {
      continue;
    }

    // recall: undelegation is an empty array
    // so this code handles undelegation as well
    const pools = certificateToPoolList(delegation.certificate.Payload, kind);
    pools.forEach(pool => seenPools.add(pool[0]));
    // calculate which certificate was active at the end of each epoch
    if (result.currEpoch == null && relativeSlot.epoch <= request.currentEpoch) {
      result.currEpoch = {
        ...delegation,
        pools,
      };
    }
    if (result.prevEpoch == null && relativeSlot.epoch <= request.currentEpoch - 1) {
      result.prevEpoch = {
        ...delegation,
        pools,
      };
    }
    if (result.prevPrevEpoch == null && relativeSlot.epoch <= request.currentEpoch - 2) {
      result.prevPrevEpoch = {
        ...delegation,
        pools,
      };
      break;
    }
  }
  return {
    ...result,
    allPoolIds: Array.from(seenPools)
  };
}

export function certificateToPoolList(
  certificateHex: string,
  kind: $PropertyType<CertificateInsert, 'Kind'>,
): Array<PoolTuples> {
  switch (kind) {
    case RustModule.WalletV4.CertificateKind.StakeDeregistration: {
      return [];
    }
    case RustModule.WalletV4.CertificateKind.StakeDelegation: {
      const cert = RustModule.WalletV4.StakeDelegation.from_bytes(Buffer.from(certificateHex, 'hex'));
      return [
        [Buffer.from(cert.pool_keyhash().to_bytes()).toString('hex'), 1]
      ];
    }
    default: {
      throw new Error(`${nameof(certificateToPoolList)} unexpected certificate kind ${kind}`);
    }
  }
}
