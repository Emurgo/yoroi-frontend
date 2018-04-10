import type NewAdaWalletParams from '../ada-methods';
import type {
  AdaWallet,
  AdaWallets,
  AdaWalletInitData,
  AdaWalletRecoveryPhraseResponse
} from '../types';

export type PersistentWallet = {
  wallet: AdaWallet,
  mnemonic: []
};

export function toWallet(walletInitData: AdaWalletInitData): PersistentWallet {
  const wallet = {
    cwAccountsNumber: 1,
    cwAmount: {
      getCCoin: 0
    },
    cwHasPassphrase: true,
    cwId: '1111111111111111',
    cwMeta: {
      cwAssurance: walletInitData.cwAssurance,
      cwName: walletInitData.cwName,
      csUnit: walletInitData.cwUnit
    },
    cwPassphraseLU: new Date()
  };

  return {
    wallet,
    mnemonic: walletInitData.cwBackupPhrase.bpToList
  };
}
