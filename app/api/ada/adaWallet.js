// @flow

// Wrapper to generate/edit wallet information in localstorage

import _ from 'lodash';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import {
  generateWalletMasterKey,
  generateAdaMnemonic,
  isValidEnglishAdaMnemonic,
  isValidEnglishAdaPaperMnemonic,
  unscramblePaperAdaMnemonic,
  updateWalletMasterKeyPassword,
  scramblePaperAdaMnemonic,
  mnemonicsToAddresses
} from './lib/cardanoCrypto/cryptoWallet';
import { toAdaWallet, toAdaHardwareWallet } from './lib/cardanoCrypto/cryptoToModel';
import {
  getAdaAddressesList,
} from './adaAddress';
import { createCryptoAccount } from './adaAccount';
import type {
  AdaWallet,
  AdaWalletParams,
  AdaWalletMetaParams,
  AdaHardwareWalletParams,
} from './adaTypes';
import {
  getUTXOsSumsForAddresses
} from './lib/yoroi-backend-api';
import type {
  UtxoSumForAddressesResponse
} from './lib/yoroi-backend-api';
import { UpdateAdaWalletError, GetBalanceError } from './errors';
import {
  getAdaWallet,
  getWalletMasterKey,
  saveAdaWallet,
  saveWalletMasterKey
} from './adaLocalStorage';
import type { ConfigType } from '../../../config/config-types';
import { restoreTransactionsAndSave } from './restoreAdaWallet';
import type { WalletAccountNumberPlate } from '../../domain/Wallet';

declare var CONFIG : ConfigType;
const addressesLimit = CONFIG.app.addressRequestSize;

/* Create and save a wallet with your master key, and a SINGLE account with one address */
export async function newAdaWallet(
  { walletPassword, walletInitData }: AdaWalletParams
): Promise<AdaWallet> {
  const [adaWallet, masterKey] = createAdaWallet({ walletPassword, walletInitData });
  // always restore the 0th account
  const cryptoAccount = createCryptoAccount(masterKey, walletPassword, 0);

  // creating an account same as restoring an account plus some initial setup
  await restoreTransactionsAndSave(cryptoAccount, adaWallet, masterKey);
  return Promise.resolve(adaWallet);
}

/** Update wallet metadata cached in localstorage */
export const updateAdaWalletMetaParams = async (
  walletMeta : AdaWalletMetaParams
): Promise<?AdaWallet> => {
  // Get existing wallet or return if non exists
  const persistentWallet = getAdaWallet();
  if (!persistentWallet) return Promise.resolve();

  try {
    // Swap out meta parameters
    const updatedWallet = Object.assign({}, persistentWallet, { cwMeta: walletMeta });

    // Update the meta params cached in localstorage
    saveAdaWallet(updatedWallet);
    return updatedWallet;
  } catch (error) {
    Logger.error('adaWallet::updateAdaWalletMetaParams error: ' + stringifyError(error));
    throw new UpdateAdaWalletError();
  }
};

/** Calculate balance and update wallet balance cached in localstorage */
export const updateAdaWalletBalance = async (): Promise<?BigNumber> => {
  // Get existing wallet or return if non exists
  const persistentWallet = getAdaWallet();
  if (!persistentWallet) return Promise.resolve();

  // get all wallet's addresses
  const adaAddresses = await getAdaAddressesList();
  const addresses = adaAddresses.map(address => address.cadId);

  try {
    // Calculate and set new user balance
    const updatedWallet = Object.assign({}, persistentWallet, {
      cwAmount: {
        getCCoin: await getBalance(addresses)
      }
    });

    // Update the balance cached in localstorage
    saveAdaWallet(updatedWallet);
    return updatedWallet.cwAmount.getCCoin;
  } catch (error) {
    Logger.error('adaWallet::updateAdaWalletBalance error: ' + stringifyError(error));
    throw new UpdateAdaWalletError();
  }
};

/** Wrapper function to generate wallet+cache based on user-inputted  */
export function createAdaWallet(
  { walletPassword, walletInitData }: AdaWalletParams
): [AdaWallet, string] {
  const adaWallet = toAdaWallet(walletInitData);

  const mnemonic = walletInitData.cwBackupPhrase.bpToList;
  const masterKey = generateWalletMasterKey(mnemonic, walletPassword);

  return [adaWallet, masterKey];
}

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

/** Wrapper function to create new Trezor ADA hardware wallet object */
export function createAdaHardwareWallet({
  walletInitData
}: AdaHardwareWalletParams) {
  const adaWallet = toAdaHardwareWallet(walletInitData);
  return [adaWallet];
}

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
  count?: number
): {
  addresses: Array<string>,
  accountPlate: WalletAccountNumberPlate
} => (
  mnemonicsToAddresses(mnemonics, count)
);

/** Call backend-service to get the balances of addresses and then sum them */
export async function getBalance(
  addresses: Array<string>
): Promise<BigNumber> {
  try {
    // batch all addresses into chunks for API
    const groupsOfAddresses = _.chunk(addresses, addressesLimit);
    const promises =
      groupsOfAddresses.map(groupOfAddresses => getUTXOsSumsForAddresses(
        { addresses: groupOfAddresses }
      ));
    const partialAmounts: Array<UtxoSumForAddressesResponse> = await Promise.all(promises);

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

/** Update spending password and password last update time */
export const changeAdaWalletSpendingPassword = (
  { oldPassword, newPassword }: {
    oldPassword: string,
    newPassword: string,
  }
): Promise<AdaWallet> => {
  // update spending password
  {
    const walletMasterKey = getWalletMasterKey();
    const updatedWalletMasterKey = updateWalletMasterKeyPassword(
      walletMasterKey,
      oldPassword,
      newPassword
    );
    saveWalletMasterKey(updatedWalletMasterKey);
  }

  // update password last update time
  const wallet = getAdaWallet();
  const updatedWallet = Object.assign(
    {},
    wallet ? wallet : {},
    { cwPassphraseLU: moment().format() }
  );

  // save result in cache
  saveAdaWallet(updatedWallet);

  return Promise.resolve(updatedWallet);
};
