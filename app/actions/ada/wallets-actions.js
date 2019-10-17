// @flow
import BigNumber from 'bignumber.js';
import Action from '../lib/Action';
import type { BaseSignRequest } from '../../api/ada/adaTypes';

// ======= WALLET ACTIONS =======

export default class WalletsActions {
  createWallet: Action<{ name: string, password: string }> = new Action();
  // eslint-disable-next-line max-len
  restoreWallet: Action<{recoveryPhrase: string, walletName: string, walletPassword: string }> = new Action();
  sendMoney: Action<{
    signRequest: BaseSignRequest,
    password: string,
  }> = new Action();
  updateBalance: Action <BigNumber> = new Action();
}
