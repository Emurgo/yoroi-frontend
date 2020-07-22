// @flow

import { lf$Database } from 'lovefield';
import BigNumber from 'bignumber.js';
import {
  PublicDeriver,
} from '../ada/lib/storage/models/PublicDeriver/index';
import type { NetworkRow } from '../ada/lib/storage/database/primitives/tables';

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
  network: $ReadOnly<NetworkRow>,
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
  accountIndex: number,
|};
export type RestoreWalletResponse = {|
  publicDerivers: Array<PublicDeriver<>>,
|};
export type RestoreWalletFunc = (
  request: RestoreWalletRequest
) => Promise<RestoreWalletResponse>;

// createWallet

export type CreateWalletRequest = RestoreWalletRequest;
export type CreateWalletResponse = RestoreWalletResponse;
export type CreateWalletFunc = (
  request: CreateWalletRequest
) => Promise<CreateWalletResponse>;
