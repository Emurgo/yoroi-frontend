// @flow
import { AsyncAction, Action } from './lib/Action';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver/index';
import type { ISignRequest } from '../api/common/lib/transactions/ISignRequest';

// ======= WALLET ACTIONS =======

export default class WalletsActions {
  unselectWallet: Action<void> = new Action();
  setActiveWallet: Action<{| wallet: PublicDeriver<> |}> = new Action();
  sendMoney: AsyncAction<{|
    signRequest: ISignRequest<any>,
    password: string,
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
}
