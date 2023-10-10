// @flow
import { AsyncAction, Action } from '../lib/Action';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export default class DelegationTransactionActions {
  setPools: AsyncAction<Array<string>> = new AsyncAction();
  createTransaction: AsyncAction<{|
    publicDeriver: PublicDeriver<>,
    poolRequest: string | void,
  |}> = new AsyncAction();
  createWithdrawalTxForWallet: AsyncAction<{|
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
  signTransaction: AsyncAction<{|
    password?: string,
    publicDeriver: PublicDeriver<>,
    dialog?: any,
  |}> = new AsyncAction();
  setShouldDeregister: Action<boolean> = new Action();
  complete: Action<void> = new Action();
  reset: Action<{| justTransaction: boolean |}> = new Action();
}
