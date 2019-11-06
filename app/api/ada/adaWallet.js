// @flow

// Wrapper to generate/edit wallet information in localstorage

import BigNumber from 'bignumber.js';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import {
  generateAdaMnemonic,
  isValidEnglishAdaMnemonic,
  isValidEnglishAdaPaperMnemonic,
  unscramblePaperAdaMnemonic,
  scramblePaperAdaMnemonic,
  mnemonicsToAddresses
} from './lib/cardanoCrypto/cryptoWallet';
import type {
  UtxoSumFunc,
} from './lib/state-fetch/types';
import { GetBalanceError } from './errors';
import type { WalletAccountNumberPlate } from '../../domain/Wallet';

/** Wrapper function to check mnemonic validity according to bip39 */
export const isValidMnemonic = (
  phrase: string,
  numberOfWords: ?number
): boolean => (
  isValidEnglishAdaMnemonic(phrase, numberOfWords)
);

/** Wrapper function to check paper mnemonic validity according to bip39 */
export const isValidPaperMnemonic = (
  phrase: string,
  numberOfWords: ?number
): boolean => (
  isValidEnglishAdaPaperMnemonic(phrase, numberOfWords)
);

/** Wrapper function to check paper mnemonic validity according to bip39 */
export const unscramblePaperMnemonic = (
  phrase: string,
  numberOfWords: ?number,
  password?: string,
): [?string, number] => (
  unscramblePaperAdaMnemonic(phrase, numberOfWords, password)
);

/** Wrapper function to create new mnemonic according to bip39 */
export const generateAdaAccountRecoveryPhrase: void => Array<string> = () => (
  generateAdaMnemonic()
);

/**
 * This type represents the very secret part of a paper wallet.
 * Should be handled with care and never exposed.
 */
export type PaperWalletSecret = {
  words: Array<string>,
  scrambledWords: Array<string>,
};

export const generatePaperWalletSecret = (password: string): PaperWalletSecret => {
  const words = generateAdaMnemonic();
  const scrambledWords = scramblePaperAdaMnemonic(words.join(' '), password).split(' ');
  return { words, scrambledWords };
};

export const mnemonicsToExternalAddresses = (
  mnemonics: string,
  accountIndex: number,
  count: number
): {
  addresses: Array<string>,
  accountPlate: WalletAccountNumberPlate
} => (
  mnemonicsToAddresses(mnemonics, accountIndex, count, 'External')
);

export async function getBalance(
  addresses: Array<string>,
  getUTXOsSumsForAddresses: UtxoSumFunc,
): Promise<BigNumber> {
  try {
    const { sum } = await getUTXOsSumsForAddresses({ addresses });
    if (sum != null) {
      return new BigNumber(sum);
    }
    return new BigNumber(0);
  } catch (error) {
    Logger.error('adaWallet::getBalance error: ' + stringifyError(error));
    throw new GetBalanceError();
  }
}
