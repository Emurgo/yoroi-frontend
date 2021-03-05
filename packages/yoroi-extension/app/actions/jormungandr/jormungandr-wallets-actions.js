// @flow
import { AsyncAction, } from '../lib/Action';

// ======= WALLET ACTIONS =======

export default class JormungandrWalletsActions {
  createWallet: AsyncAction<{| name: string, password: string |}> = new AsyncAction();
}
