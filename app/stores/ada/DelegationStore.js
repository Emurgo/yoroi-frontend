// @flow

import { observable, action, reaction, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';
import environment from '../../environment';
import type {
  CreateDelegationTxFunc,
  SignAndBroadcastDelegationTxFunc,
} from '../../api/ada';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import {
  asGetAllUtxos, asHasUtxoChains, asGetAllAccounting,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type {
  IGetAllUtxosResponse, IGetStakingKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { PoolRequest } from '../../actions/ada/delegation-transaction-actions';
import {
  filterAddressesByStakingKey,
  groupAddrContainsAccountKey,
} from '../../api/ada/lib/storage/bridge/utils';
import type { V3UnsignedTxAddressedUtxoResponse } from '../../api/ada/transactions/types';

export default class DelegationStore extends Store {

  @observable getDelegatedBalance: LocalizedRequest<GetDelegatedBalanceFunc>
    = new LocalizedRequest<GetDelegatedBalanceFunc>(getDelegatedBalance);

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
        await getDelegatedBalance({
          publicDeriver: publicDeriver.self,
        });
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
  publicDeriver: PublicDeriver<>
|};
type GetDelegatedBalanceResponse = {|
  utxoPart: BigNumber,
  accountPart: BigNumber,
|};
type GetDelegatedBalanceFunc = (
  request: GetDelegatedBalanceRequest
) => Promise<GetDelegatedBalanceResponse>;

async function getDelegatedBalance(
  request: GetDelegatedBalanceRequest,
): Promise<GetDelegatedBalanceResponse> {
  // TODO: return 0 if not delegated to any pool

  const withStakingKey = asGetAllAccounting(request.publicDeriver);
  if (withStakingKey == null) {
    throw new Error(`${nameof(getDelegatedBalance)} missing staking key functionality`);
  }

  const utxoPart = await getUtxoDelegatedBalance(withStakingKey);

  return {
    utxoPart,
    accountPart: new BigNumber(0), // TODO
  };
}

async function getUtxoDelegatedBalance(
  publicDeriver: PublicDeriver<> & IGetStakingKey
): Promise<BigNumber> {
  const withUtxos = asGetAllUtxos(publicDeriver);
  if (withUtxos == null) {
    return new BigNumber(0);
  }
  const basePubDeriver = withUtxos;

  let stakingKey;
  {
    const stakingKeyResp = await basePubDeriver.getStakingKey();
    const accountAddress = RustModule.WalletV3.Address.from_bytes(
      Buffer.from(stakingKeyResp.addr.Hash, 'hex')
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
