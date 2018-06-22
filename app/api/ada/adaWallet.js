// @flow
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import {
  saveInStorage,
  getFromStorage,
  mapToList
} from './lib/utils';
import {
  generateWalletSeed,
  generateAdaMnemonic,
  isValidAdaMnemonic
} from './lib/crypto-wallet';
import { toAdaWallet } from './lib/crypto-to-cardano';
import {
  getAdaAddressesMap,
  newAdaAddress
} from './adaAddress';
import { newCryptoAccount } from './adaAccount';
import {
  getAdaConfirmedTxs,
  updateAdaTxsHistory,
  updateAdaPendingTxs
} from './adaTransactions/adaTransactionsHistory';
import type {
  AdaWallet,
  AdaWalletParams,
  AdaAddresses,
  AdaWalletRecoveryPhraseResponse
} from './adaTypes';
import type { WalletSeed } from './lib/crypto-wallet';
import {
  getUTXOsSumsForAddresses,
  addressesLimit
} from './lib/icarus-backend-api';
import { UpdateAdaWalletError, GetBalanceError } from './errors';

const WALLET_KEY = 'WALLET'; // single wallet atm
const WALLET_SEED_KEY = 'SEED';

// FIXME: Extract to another file
const Logger = console;
const stringifyError = o => o.toString();

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

export const updateAdaWallet = async (): Promise<?AdaWallet> => {
  const persistentWallet = getAdaWallet();
  if (!persistentWallet) return Promise.resolve();
  const persistentAddresses: AdaAddresses = mapToList(getAdaAddressesMap());
  const addresses: Array<string> = persistentAddresses.map(addr => addr.cadId);
  // Update wallet balance
  try {
    const updatedWallet = Object.assign({}, persistentWallet, {
      cwAmount: {
        getCCoin: await _getBalance(addresses)
      }
    });
    saveInStorage(WALLET_KEY, updatedWallet);
    await updateAdaPendingTxs(addresses);
    await updateAdaTxsHistory(await getAdaConfirmedTxs(), addresses);
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
  saveInStorage(WALLET_KEY, adaWallet);
  saveInStorage(WALLET_SEED_KEY, seed);
}

export function getAdaWallet(): AdaWallet {
  return getFromStorage(WALLET_KEY);
}

export function getWalletSeed() {
  return getFromStorage(WALLET_SEED_KEY);
}

export const isValidMnemonic = (phrase: string, numberOfWords: number = 12) =>
  isValidAdaMnemonic(phrase, numberOfWords);

export const getAdaAccountRecoveryPhrase = (): AdaWalletRecoveryPhraseResponse =>
  generateAdaMnemonic();

async function _getBalance(
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
