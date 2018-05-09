import bip39 from 'bip39';
import { Blake2b, Wallet } from 'cardano-crypto';
import {
  encryptWithPassword,
  decryptWithPassword
} from '../../../utils/crypto/cryptoUtils';
import type { AdaWallet } from '../types';
import type { AdaWalletParams } from '../ada-methods';

export const generateAdaMnemonic = () => bip39.generateMnemonic(128).split(' ');

export const isValidAdaMnemonic = (
  phrase: string,
  numberOfWords: number = 12
) =>
  phrase.split(' ').length === numberOfWords && bip39.validateMnemonic(phrase);

export function toWallet({ walletPassword, walletInitData }: AdaWalletParams): AdaWallet {
  const { cwAssurance, cwName, cwUnit } = walletInitData.cwInitMeta;
  return {
    cwAccountsNumber: 1,
    cwAmount: {
      getCCoin: 0
    },
    cwHasPassphrase: !!walletPassword,
    cwId: '1111111111111111',
    cwMeta: {
      cwAssurance,
      cwName,
      cwUnit
    },
    cwPassphraseLU: new Date()
  };
}

export function generateAccount(secretWords, password) {
  const entropy = bip39.mnemonicToEntropy(secretWords);
  const seed = Blake2b.blake2b_256(entropy);
  return {
    seed: password ? encryptWithPassword(password, seed) : seed
  };
}

// FIXME: Currently in all the places where the method is use, we need a way to know
export function getWalletFromAccount(account, password) {
  const seed = password ? decryptWithPassword(password, account.seed) : account.seed;
  const seedAsArray = Object.values(seed);
  return Wallet.fromSeed(seedAsArray).result;
}
