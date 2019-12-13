// @flow

import { observable, action, reaction, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import {
  asGetAllUtxos, asGetAllAccounting,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type {
  IGetStakingKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import {
  filterAddressesByStakingKey,
} from '../../api/ada/lib/storage/bridge/utils';
import environment from '../../environment';
import type {
  AccountStateSuccess,
} from '../../api/ada/lib/state-fetch/types';

export default class DelegationStore extends Store {

  @observable getDelegatedBalance: LocalizedRequest<GetDelegatedBalanceFunc>
    = new LocalizedRequest<GetDelegatedBalanceFunc>(_getDelegatedBalance);

  @observable stakingKeyState: void | AccountStateSuccess;

  _recalculateDelegationInfoDisposer: void => void = () => {};

  setup(): void {
    super.setup();
    this.reset();
    const a = this.actions.ada.delegation;
    a.startWatch.listen(this._startWatch);
    a.reset.listen(this.reset);
  }

  @action.bound
  _startWatch: void => Promise<void> = async () => {
    this._recalculateDelegationInfoDisposer = reaction(
      () => [
        this.stores.substores.ada.wallets.selected,
        // num tx sync changed => valid inputs may have changed
        this.stores.substores.ada.transactions.totalAvailable,
        // need to recalculate when there are no more pending transactions
        this.stores.substores.ada.transactions.hasAnyPending,
      ],
      // $FlowFixMe error in mobx types
      async () => {
        const publicDeriver = this.stores.substores.ada.wallets.selected;
        if (publicDeriver == null) {
          throw new Error(`${nameof(this._startWatch)} no public deriver selected`);
        }
        const withStakingKey = asGetAllAccounting(publicDeriver.self);
        if (withStakingKey == null) {
          throw new Error(`${nameof(this._startWatch)} missing staking key functionality`);
        }

        const stakingKeyResp = await withStakingKey.getStakingKey();

        const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
        const accountStateResp = await stateFetcher.getAccountState({
          addresses: [stakingKeyResp.addr.Hash],
        });
        const stateForStakingKey = accountStateResp[stakingKeyResp.addr.Hash];

        if (!stateForStakingKey.delegation) {
          runInAction(() => {
            this.stakingKeyState = undefined;
            throw new Error(`${stateForStakingKey.error} - ${stateForStakingKey.comment}`);
          });
        } else {
          runInAction(() => {
            this.stakingKeyState = stateForStakingKey;
          });

          const delegatedBalance = this.getDelegatedBalance.execute({
            publicDeriver: withStakingKey,
            accountState: stateForStakingKey,
            stakingPubKey: stakingKeyResp.addr.Hash,
          }).promise;
          if (delegatedBalance == null) throw new Error('Should never happen');
          await delegatedBalance;
        }
      },
      {
        fireImmediately: true,
      }
    );
  }

  @action.bound
  reset(): void {
    this._recalculateDelegationInfoDisposer();
    this._recalculateDelegationInfoDisposer = () => {};
    this.getDelegatedBalance.reset();
  }
}

type GetDelegatedBalanceRequest = {|
  publicDeriver: PublicDeriver<> & IGetStakingKey,
  accountState: AccountStateSuccess,
  stakingPubKey: string,
|};
type GetDelegatedBalanceResponse = {|
  utxoPart: BigNumber,
  accountPart: BigNumber,
|};
type GetDelegatedBalanceFunc = (
  request: GetDelegatedBalanceRequest
) => Promise<GetDelegatedBalanceResponse>;

async function _getDelegatedBalance(
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
