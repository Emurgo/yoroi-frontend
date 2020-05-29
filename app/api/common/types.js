// @flow

import { lf$Database } from 'lovefield';
import BigNumber from 'bignumber.js';
import {
  PublicDeriver,
} from '../ada/lib/storage/models/PublicDeriver/index';

// isValidMnemonic

export type IsValidMnemonicRequest = {|
  mnemonic: string,
  numberOfWords: number,
|};
export type IsValidMnemonicResponse = boolean;
export type IsValidMnemonicFunc = (
  request: IsValidMnemonicRequest
) => IsValidMnemonicResponse;

// getBalance

export type GetBalanceRequest = {| getBalance: () => Promise<BigNumber>, |};
export type GetBalanceResponse = BigNumber;
export type GetBalanceFunc = (
  request: GetBalanceRequest
) => Promise<GetBalanceResponse>;

// restoreWallet

export type RestoreWalletRequest = {|
  db: lf$Database,
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
|};
export type RestoreWalletResponse = {|
  publicDerivers: Array<PublicDeriver<>>,
|};
export type RestoreWalletFunc = (
  request: RestoreWalletRequest
) => Promise<RestoreWalletResponse>;
