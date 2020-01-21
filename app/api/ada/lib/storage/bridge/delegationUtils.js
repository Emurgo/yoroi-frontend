// @flow

import BigNumber from 'bignumber.js';
import {
  getAllSchemaTables,
  raii,
} from '../database/utils';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import { GetCertificates } from '../database/primitives/api/read';
import {
  asGetAllUtxos,
} from '../models/PublicDeriver/traits';
import {
  PublicDeriver,
} from '../models/PublicDeriver/index';
import type {
  IGetStakingKey,
} from '../models/PublicDeriver/interfaces';
import {
  filterAddressesByStakingKey,
  delegationTypeToResponse,
} from './utils';
import type {
  AccountStateDelegation,
  AccountStateSuccess,
} from '../../state-fetch/types';
import { TxStatusCodes } from '../database/primitives/enums';
import type { CertificateForKey } from '../database/primitives/api/read';
import type { ToRelativeSlotNumberFunc } from './timeUtils';
import type { CertificateKindType } from '@emurgo/js-chain-libs/js_chain_libs';

export type GetDelegatedBalanceRequest = {|
  publicDeriver: PublicDeriver<> & IGetStakingKey,
  accountState: AccountStateSuccess,
  stakingPubKey: string,
|};
export type GetDelegatedBalanceResponse = {|
  utxoPart: BigNumber,
  accountPart: BigNumber,
|};
export type GetDelegatedBalanceFunc = (
  request: GetDelegatedBalanceRequest
) => Promise<GetDelegatedBalanceResponse>;

export async function getDelegatedBalance(
  request: GetDelegatedBalanceRequest,
): Promise<GetDelegatedBalanceResponse> {
  const utxoPart = await getUtxoDelegatedBalance(
    request.publicDeriver,
    request.stakingPubKey,
  );

  return {
    utxoPart,
    accountPart: new BigNumber(request.accountState.value),
  };
}

async function getUtxoDelegatedBalance(
  publicDeriver: PublicDeriver<>,
  stakingPubKey: string,
): Promise<BigNumber> {
  const withUtxos = asGetAllUtxos(publicDeriver);
  if (withUtxos == null) {
    return new BigNumber(0);
  }
  const basePubDeriver = withUtxos;

  let stakingKey;
  {
    const accountAddress = RustModule.WalletV3.Address.from_bytes(
      Buffer.from(stakingPubKey, 'hex')
    ).to_account_address();
    if (accountAddress == null) {
      throw new Error(`${nameof(getUtxoDelegatedBalance)} staking key invalid`);
    }
    stakingKey = accountAddress.get_account_key();
  }

  const allUtxo = await basePubDeriver.getAllUtxos();
  const allUtxosForKey = filterAddressesByStakingKey(
    stakingKey,
    allUtxo
  );
  const utxoSum = allUtxosForKey.reduce(
    (sum, utxo) => sum.plus(new BigNumber(utxo.output.UtxoTransactionOutput.Amount)),
    new BigNumber(0)
  );

  return utxoSum;
}

export type GetCurrentDelegationRequest = {|
  publicDeriver: PublicDeriver<> & IGetStakingKey,
  stakingKeyAddressId: number,
  currentEpoch: number,
  toRelativeSlotNumber: ToRelativeSlotNumberFunc,
|};
export type CertificateForEpoch = {|
  ...CertificateForKey,
  ...AccountStateDelegation,
|};
export type GetCurrentDelegationResponse = {|
  currEpoch: void| CertificateForEpoch,
  prevEpoch: void| CertificateForEpoch,
  prevPrevEpoch: void| CertificateForEpoch,
|};
export type GetCurrentDelegationFunc = (
  request: GetCurrentDelegationRequest
) => Promise<GetCurrentDelegationResponse>;

export async function getCurrentDelegation(
  request: GetCurrentDelegationRequest,
): Promise<GetCurrentDelegationResponse> {
  const deps = Object.freeze({
    GetCertificates
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.publicDeriver.getDb(), table));
  const allDelegations = await raii(
    request.publicDeriver.getDb(),
    depTables,
    async tx => deps.GetCertificates.forAddress(
      request.publicDeriver.getDb(),
      tx,
      {
        addressIds: [request.stakingKeyAddressId]
      }
    )
  );
  // recall: results are sorted by block order
  const result = {
    currEpoch: undefined,
    prevEpoch: undefined,
    prevPrevEpoch: undefined,
  };
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
    const { pools } = certificateToPoolList(delegation.certificate.Payload, kind);
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
  return result;
}

export function certificateToPoolList(
  certificateHex: string,
  kind: CertificateKindType,
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
