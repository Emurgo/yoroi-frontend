// @flow
import { AsyncAction, Action } from './lib/Action';
import type { ISignRequest } from '../api/common/lib/transactions/ISignRequest';

// ======= WALLET ACTIONS =======

export default class WalletsActions {
  unselectWallet: Action<void> = new Action();
  setActiveWallet: Action<{| publicDeriverId: number |}> = new Action();
  sendMoney: AsyncAction<{|
    signRequest: ISignRequest<any>,
    password: string,
    +wallet: {
      publicDeriverId: number,
      +plate: { TextPart: string, ... },
      ...
    },
    onSuccess?: void => void,
  |}> = new AsyncAction();
}
