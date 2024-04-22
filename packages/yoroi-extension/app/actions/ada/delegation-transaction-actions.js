// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { WalletState } from '../../../chrome/extension/background/types';

export default class DelegationTransactionActions {
  setPools: AsyncAction<Array<string>> = new AsyncAction();
  createTransaction: AsyncAction<{|
    wallet: WalletState,
    poolRequest: string | void,
  |}> = new AsyncAction();
  createWithdrawalTxForWallet: AsyncAction<{|
    wallet: WalletState,
  |}> = new AsyncAction();
  signTransaction: AsyncAction<{|
    password?: string,
    wallet: WalletState,
    dialog?: any,
  |}> = new AsyncAction();
  setShouldDeregister: Action<boolean> = new Action();
  complete: Action<void> = new Action();
  reset: Action<{| justTransaction: boolean |}> = new Action();
}
