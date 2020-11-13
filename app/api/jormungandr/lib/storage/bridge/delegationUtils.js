// @flow

import BigNumber from 'bignumber.js';
import {
  getCertificates,
} from '../../../../ada/lib/storage/models/utils';
import { RustModule } from '../../../../ada/lib/cardanoCrypto/rustLoader';
import {
  asGetAllUtxos,
} from '../../../../ada/lib/storage/models/PublicDeriver/traits';
import {
  PublicDeriver,
} from '../../../../ada/lib/storage/models/PublicDeriver/index';
import {
  filterAddressesByStakingKey,
  delegationTypeToResponse,
  unwrapStakingKey,
} from './utils';
import type {
  AccountStateDelegation,
} from '../../state-fetch/types';
import { TxStatusCodes } from '../../../../ada/lib/storage/database/primitives/enums';
import type { CertificateInsert } from '../../../../ada/lib/storage/database/primitives/tables';
import type {
  GetDelegatedBalanceRequest,
  GetDelegatedBalanceResponse,
  GetCurrentDelegationRequest,
  GetCurrentDelegationResponse,
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

export async function getUtxoDelegatedBalance(
  publicDeriver: PublicDeriver<>,
  stakingAddress: string,
): Promise<BigNumber> {
  const withUtxos = asGetAllUtxos(publicDeriver);
  if (withUtxos == null) {
    return new BigNumber(0);
  }
  const basePubDeriver = withUtxos;

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
    prevPrevPrevEpoch: undefined,
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
      kind !== RustModule.WalletV3.CertificateKind.StakeDelegation &&
      kind !== RustModule.WalletV3.CertificateKind.OwnerStakeDelegation
    ) {
      continue;
    }

    // recall: undelegation is a type of delegation to an empty list of pool
    // so this code handles undelegation as well
    const { pools } = certificateToPoolList(delegation.certificate.Payload, kind);
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
    }
    if (result.prevPrevPrevEpoch == null && relativeSlot.epoch <= request.currentEpoch - 3) {
      result.prevPrevPrevEpoch = {
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
): AccountStateDelegation {
  switch (kind) {
    case RustModule.WalletV3.CertificateKind.StakeDelegation: {
      const cert = RustModule.WalletV3.StakeDelegation.from_bytes(Buffer.from(certificateHex, 'hex'));
      const typeInfo = cert.delegation_type();
      return delegationTypeToResponse(typeInfo);
    }
    case RustModule.WalletV3.CertificateKind.OwnerStakeDelegation: {
      const cert = RustModule.WalletV3.StakeDelegation.from_bytes(Buffer.from(certificateHex, 'hex'));
      const typeInfo = cert.delegation_type();
      return delegationTypeToResponse(typeInfo);
    }
    default: {
      throw new Error(`${nameof(certificateToPoolList)} unexpected certificate kind ${kind}`);
    }
  }
}

export type PoolRequest =
  void |
  {| id: string |} |
  Array<{|
    id: string,
    part: number,
  |}>;
export function createCertificate(
  stakingKey: RustModule.WalletV3.PublicKey,
  poolRequest: PoolRequest,
): RustModule.WalletV3.StakeDelegation {
  if (poolRequest == null) {
    return RustModule.WalletV3.StakeDelegation.new(
      RustModule.WalletV3.DelegationType.non_delegated(),
      stakingKey
    );
  }
  if (Array.isArray(poolRequest)) {
    const partsTotal = poolRequest.reduce((sum, pool) => sum + pool.part, 0);
    const ratios = RustModule.WalletV3.PoolDelegationRatios.new();
    for (const pool of poolRequest) {
      ratios.add(RustModule.WalletV3.PoolDelegationRatio.new(
        RustModule.WalletV3.PoolId.from_hex(pool.id),
        pool.part
      ));
    }
    const delegationRatio = RustModule.WalletV3.DelegationRatio.new(
      partsTotal,
      ratios,
    );
    if (delegationRatio == null) {
      throw new Error(`${nameof(createCertificate)} invalid ratio`);
    }
    return RustModule.WalletV3.StakeDelegation.new(
      RustModule.WalletV3.DelegationType.ratio(delegationRatio),
      stakingKey
    );
  }
  return RustModule.WalletV3.StakeDelegation.new(
    RustModule.WalletV3.DelegationType.full(
      RustModule.WalletV3.PoolId.from_hex(poolRequest.id)
    ),
    stakingKey
  );
}
