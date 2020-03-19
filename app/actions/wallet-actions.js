// @flow
import { Action } from './lib/Action';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver/index';

// ======= WALLET ACTIONS =======

export default class WalletsActions {
  unselectWallet: Action<void> = new Action();
  setActiveWallet: Action<{| wallet: PublicDeriver<> |}> = new Action();
}
