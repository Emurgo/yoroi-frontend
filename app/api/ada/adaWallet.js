// @flow
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
  newAdaAddress,
  getBalance
} from './adaAddress';
import { getSingleCryptoAccount } from './adaAccount';
import {
  getAdaTransactions
} from './adaTransactions/adaTransactions';
import {
  updateAdaTxsHistory
} from './adaTransactions/adaTransactionsHistory';
import type {
  AdaWallet,
  AdaWalletParams,
  AdaAddresses,
  AdaWalletRecoveryPhraseResponse
} from './adaTypes';
import type { WalletSeed } from './lib/crypto-wallet';

const WALLET_KEY = 'WALLET'; // single wallet atm
const WALLET_SEED_KEY = 'SEED';

/* Create and save a wallet with your seed, and a SINGLE account with one address */
export async function newAdaWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams): Promise<AdaWallet> {
  const [adaWallet, seed] = createAdaWallet({ walletPassword, walletInitData });
  const cryptoAccount = getSingleCryptoAccount(seed, walletPassword);

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
  const updatedWallet = Object.assign({}, persistentWallet, {
    cwAmount: {
      getCCoin: await getBalance(addresses)
    }
  });
  saveInStorage(WALLET_KEY, updatedWallet);
  await updateAdaTxsHistory(getAdaTransactions(), addresses);
  return updatedWallet;
};

export function createAdaWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams) {
  const adaWallet = toAdaWallet({ walletPassword, walletInitData });
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
