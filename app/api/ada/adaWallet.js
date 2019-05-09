// @flow

// Wrapper to generate/edit wallet information in localstorage

import _ from 'lodash';
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
  UtxoSumResponse
} from './lib/state-fetch/types';
import { GetBalanceError } from './errors';
import type { ConfigType } from '../../../config/config-types';
import type { WalletAccountNumberPlate } from '../../domain/Wallet';

declare var CONFIG : ConfigType;
const addressesLimit = CONFIG.app.addressRequestSize;

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

/** Call backend-service to get the balances of addresses and then sum them */
export async function getBalance(
  addresses: Array<string>,
  getUTXOsSumsForAddresses: UtxoSumFunc,
): Promise<BigNumber> {
  try {
    // batch all addresses into chunks for API
    const groupsOfAddresses = _.chunk(addresses, addressesLimit);
    const promises =
      groupsOfAddresses.map(groupOfAddresses => getUTXOsSumsForAddresses(
        { addresses: groupOfAddresses }
      ));
    const partialAmounts: Array<UtxoSumResponse> = await Promise.all(promises);

    // sum all chunks together
    return partialAmounts.reduce(
      (acc: BigNumber, partialAmount) => (
        acc.plus(
          partialAmount.sum // undefined if no addresses in the batch has any balance in them
            ? new BigNumber(partialAmount.sum)
            : new BigNumber(0)
        )
      ),
      new BigNumber(0)
    );
  } catch (error) {
    Logger.error('adaWallet::getBalance error: ' + stringifyError(error));
    throw new GetBalanceError();
  }
}
