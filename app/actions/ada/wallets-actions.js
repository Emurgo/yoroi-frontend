// @flow
import BigNumber from 'bignumber.js';
import Action from '../lib/Action';

export type WalletImportFromFileParams = {
  filePath: string,
  walletName: ?string,
  walletPassword: ?string,
};

// ======= WALLET ACTIONS =======

export default class WalletsActions {
  createWallet: Action<{ name: string, password: string }> = new Action();
  // eslint-disable-next-line max-len
  restoreWallet: Action<{recoveryPhrase: string, walletName: string, walletPassword: string }> = new Action();
  importWalletFromFile: Action<WalletImportFromFileParams> = new Action();
  deleteWallet: Action<{ walletId: string }> = new Action();
  sendMoney: Action<{ receiver: string, amount: string, password: ?string }> = new Action();
  updateBalance: Action <{ amount: BigNumber }> = new Action();
}
