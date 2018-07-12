// @flow
import _ from 'lodash';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import {
  saveInStorage,
  getFromStorage
} from './lib/utils';
import {
  generateWalletSeed,
  generateAdaMnemonic,
  isValidAdaMnemonic,
  updateWalletSeedPassword,
} from './lib/cardanoCrypto/cryptoWallet';
import { toAdaWallet } from './lib/cardanoCrypto/cryptoToModel';
import {
  getAdaAddressesList,
  newAdaAddress,
  updateUsedAddresses
} from './adaAddress';
import { newCryptoAccount } from './adaAccount';
import type {
  AdaWallet,
  UpdateAdaWalletParams,
} from './adaTypes';
import type {
  AdaWalletParams,
  ChangeAdaWalletPassphraseParams,
  AdaWalletRecoveryPhraseResponse,
} from './index';

import type { WalletSeed } from './lib/cardanoCrypto/cryptoWallet';
import {
  getUTXOsSumsForAddresses,
  addressesLimit
} from './lib/icarus-backend-api';
import { UpdateAdaWalletError, GetBalanceError } from './errors';

const WALLET_KEY = 'WALLET'; // single wallet atm

/* Create and save a wallet with your seed, and a SINGLE account with one address */
export async function newAdaWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams): Promise<AdaWallet> {
  const [adaWallet, seed] = createAdaWallet({ walletPassword, walletInitData });
  const cryptoAccount = newCryptoAccount(seed, walletPassword);
  newAdaAddress(cryptoAccount, [], 'External');
  saveAdaWallet(adaWallet, seed);
  return Promise.resolve(adaWallet);
}

export const updateAdaWallet = async (
  { walletMeta }: UpdateAdaWalletParams
): Promise<?AdaWallet> => {
  const persistentWallet = getAdaWallet();
  if (!persistentWallet) return Promise.resolve();
  try {
    const updatedWallet = Object.assign({}, persistentWallet, { cwMeta: walletMeta });
    _saveAdaWalletKeepingSeed(updatedWallet);
    return updatedWallet;
  } catch (error) {
    Logger.error('adaWallet::updateAdaWallet error: ' + stringifyError(error));
    throw new UpdateAdaWalletError();
  }
};

export const refreshAdaWallet = async (): Promise<?AdaWallet> => {
  const persistentWallet = getAdaWallet();
  if (!persistentWallet) return Promise.resolve();
  const adaAddresses = await getAdaAddressesList();
  const addresses = adaAddresses.map(address => address.cadId);
  // Update wallet balance
  try {
    const updatedWallet = Object.assign({}, persistentWallet, {
      cwAmount: {
        getCCoin: await getBalance(addresses)
      }
    });
    _saveAdaWalletKeepingSeed(updatedWallet);
    await updateUsedAddresses();
    return updatedWallet;
  } catch (error) {
    Logger.error('adaWallet::updateAdaWallet error: ' + stringifyError(error));
    throw new UpdateAdaWalletError();
  }
};

export function createAdaWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams) {
  const adaWallet = toAdaWallet(walletInitData);
  const mnemonic = walletInitData.cwBackupPhrase.bpToList;
  const seed = generateWalletSeed(mnemonic, walletPassword);
  return [adaWallet, seed];
}

export function saveAdaWallet(
  adaWallet: AdaWallet,
  seed: WalletSeed
): void {
  saveInStorage(WALLET_KEY, { adaWallet, seed });
}

export function getAdaWallet(): ?AdaWallet {
  const stored = getFromStorage(WALLET_KEY);
  return stored ? stored.adaWallet : null;
}

export function getWalletSeed(): WalletSeed {
  const stored = getFromStorage(WALLET_KEY);
  return stored.seed;
}

export const isValidMnemonic = (phrase: string, numberOfWords: ?number) =>
  isValidAdaMnemonic(phrase, numberOfWords);

export const getAdaAccountRecoveryPhrase = (): AdaWalletRecoveryPhraseResponse =>
  generateAdaMnemonic();

export async function getBalance(
  addresses: Array<string>
): Promise<BigNumber> {
  try {
    const groupsOfAddresses = _.chunk(addresses, addressesLimit);
    const promises =
      groupsOfAddresses.map(groupOfAddresses => getUTXOsSumsForAddresses(groupOfAddresses));
    const partialAmounts = await Promise.all(promises);
    return partialAmounts.reduce((acc, partialAmount) =>
      acc.plus(partialAmount.sum ? new BigNumber(partialAmount.sum) : new BigNumber(0)),
      new BigNumber(0)
    );
  } catch (error) {
    Logger.error('adaWallet::getBalance error: ' + stringifyError(error));
    throw new GetBalanceError();
  }
}

export const changeAdaWalletPassphrase = (
  { oldPassword, newPassword }: ChangeAdaWalletPassphraseParams
): Promise<AdaWallet> => {
  try {
    const walletSeed = getWalletSeed();
    const updatedWalletSeed = updateWalletSeedPassword(walletSeed, oldPassword, newPassword);
    const updatedWallet = Object.assign({}, getAdaWallet(), { cwPassphraseLU: moment().format() });
    saveAdaWallet(updatedWallet, updatedWalletSeed);
    return Promise.resolve(updatedWallet);
  } catch (err) {
    if (err.message.includes('Passphrase doesn\'t match')) {
      throw new Error('Invalid old passphrase given');
    }
    throw err;
  }
};

function _saveAdaWalletKeepingSeed(adaWallet: AdaWallet): void {
  const seed = getWalletSeed();
  saveAdaWallet(adaWallet, seed);
}
