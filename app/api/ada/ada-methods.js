// @flow
// FIXME: Implement the API using Rust + LocalStorage
import bip39 from 'bip39';
import type {
  AdaWallet,
  AdaWallets,
  RestoreAdaWalletParams,
  AdaWalletRecoveryPhraseResponse
} from './types';

export async function newAdaWallet(): Promise<AdaWallet> {
  return Promise.resolve({
    cwAccountsNumber: 1,
    cwAmount: {
      getCCoin: 100000
    },
    cwHasPassphrase: true,
    cwId: '1111111111111111',
    cwMeta: {
      cwAssurance: 'CWANormal',
      cwName: 'Test Wallet',
      csUnit: 10
    },
    cwPassphraseLU: new Date()
  });
}

export const getAdaWallets = (): Promise<AdaWallets> => Promise.resolve([]);

export const getAdaAccountRecoveryPhrase = (): AdaWalletRecoveryPhraseResponse =>
  bip39.generateMnemonic(128).split(' ');

export const restoreAdaWallet = ({
  walletPassword,
  walletInitData
}: RestoreAdaWalletParams): Promise<AdaWallet> => newAdaWallet();
