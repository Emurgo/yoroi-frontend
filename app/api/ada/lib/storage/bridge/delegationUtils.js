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
} from './utils';
import type {
  AccountStateSuccess,
} from '../../state-fetch/types';
import { TxStatusCodes } from '../database/primitives/enums';
import type { CertificateForKey } from '../database/primitives/api/read';

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
  if (request.accountState.delegation.pools.length === 0) {
    return {
      utxoPart: new BigNumber(0),
      accountPart: new BigNumber(0),
    };
  }
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
|};
export type GetCurrentDelegationResponse = void | CertificateForKey;
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
  for (const delegation of allDelegations) {
    if (delegation.block == null) {
      continue;
    }
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
    return delegation;
  }
  return undefined;
}
