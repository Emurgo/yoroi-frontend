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
  updateWalletMasterKeyPassword,
} from './lib/cardanoCrypto/cryptoWallet';
import { toAdaWallet, toAdaHardwareWallet } from './lib/cardanoCrypto/cryptoToModel';
import {
  getAdaAddressesList,
  newAdaAddress
} from './adaAddress';
import { newCryptoAccount } from './adaAccount';
import type {
  AdaWallet,
  AdaWalletParams,
  AdaWalletMetaParams,
  AdaHardwareWalletParams,
} from './adaTypes';
import type {
  ChangeAdaWalletSpendingPasswordParams,
  AdaWalletRecoveryPhraseResponse,
} from './index';
import {
  getUTXOsSumsForAddresses
} from './lib/yoroi-backend-api';
import type {
  UtxoSumForAddressesResponse
} from './lib/yoroi-backend-api';
import { UpdateAdaWalletError, GetBalanceError } from './errors';
import { saveAdaWallet, getAdaWallet, getWalletMasterKey } from './adaLocalStorage';
import type { ConfigType } from '../../../config/config-types';

declare var CONFIG : ConfigType;
const addressesLimit = CONFIG.app.addressRequestSize;

/* Create and save a wallet with your master key, and a SINGLE account with one address */
export async function newAdaWallet(
  { walletPassword, walletInitData }: AdaWalletParams
): Promise<AdaWallet> {
  const [adaWallet, masterKey] = createAdaWallet({ walletPassword, walletInitData });
  const cryptoAccount = newCryptoAccount(masterKey, walletPassword);
  await newAdaAddress(cryptoAccount, 'External');
  saveAdaWallet(adaWallet, masterKey);
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
    _saveAdaWalletKeepingMasterKey(updatedWallet);
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
    _saveAdaWalletKeepingMasterKey(updatedWallet);
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

/** Wrapper function to create new Trezor ADA hardware wallet object */
export function createAdaHardwareWallet({
  walletInitData
}: AdaHardwareWalletParams) {
  const adaWallet = toAdaHardwareWallet(walletInitData);
  return [adaWallet];
}

/** Wrapper function to create new mnemonic according to bip39 */
export const generateAdaAccountRecoveryPhrase = (): AdaWalletRecoveryPhraseResponse => (
  generateAdaMnemonic()
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
  { oldPassword, newPassword }: ChangeAdaWalletSpendingPasswordParams
): Promise<AdaWallet> => {
  // update spending password
  const walletMasterKey = getWalletMasterKey();
  const updatedWalletMasterKey =
    updateWalletMasterKeyPassword(walletMasterKey, oldPassword, newPassword);

  // update password last update time
  const wallet = getAdaWallet();
  const updatedWallet = Object.assign(
    {},
    wallet ? wallet : {},
    { cwPassphraseLU: moment().format() }
  );

  // save result in cache
  saveAdaWallet(updatedWallet, updatedWalletMasterKey);
  return Promise.resolve(updatedWallet);
};

/** Swap the cached wallet information in localstorage but keep the wallet itself the same */
function _saveAdaWalletKeepingMasterKey(
  adaWallet: AdaWallet
): void {
  const masterKey = getWalletMasterKey();
  saveAdaWallet(adaWallet, masterKey);
}
