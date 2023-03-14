// @flow
import { AsyncAction, } from '../lib/Action';

// ======= WALLET ACTIONS =======

export default class AdaWalletsActions {
  startWalletCreation: AsyncAction<{| name: string, password: string |}> = new AsyncAction();
  createWallet: AsyncAction<{|
    name: string,
    password: string,
    recoveryPhrase: Array<string>,
  |}> = new AsyncAction();
}
