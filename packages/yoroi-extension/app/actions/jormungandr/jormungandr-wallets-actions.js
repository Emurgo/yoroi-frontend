// @flow
import { AsyncAction, } from '../lib/Action';

// ======= WALLET ACTIONS =======

export default class JormungandrWalletsActions {
  startWalletCreation: AsyncAction<{| name: string, password: string |}> = new AsyncAction();
}
