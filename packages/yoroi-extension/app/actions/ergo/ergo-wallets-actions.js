// @flow
import { AsyncAction, } from '../lib/Action';

// ======= WALLET ACTIONS =======

export default class ErgoWalletsActions {
  startWalletCreation: AsyncAction<{| name: string, password: string |}> = new AsyncAction();
}
