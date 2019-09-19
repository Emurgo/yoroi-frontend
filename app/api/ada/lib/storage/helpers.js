// @flow

import moment from 'moment';
import BigNumber from 'bignumber.js';
import {
  getAdaAddressesByType,
  getAdaAddressesList,
} from './adaAddress';
import {
  getAdaWallet,
  getLastBlockNumber,
  getLastReceiveAddressIndex,
  getWalletMasterKey,
  saveAdaWallet,
  saveLastBlockNumber,
  saveLastReceiveAddressIndex,
  saveWalletMasterKey,
} from './adaLocalStorage';
import {
  updateWalletMasterKeyPassword,
} from '../cardanoCrypto/cryptoWallet';
import type {
  AdaWallet,
  AdaWalletMetaParams,
  AddressType,
  Transaction,
} from '../../adaTypes';
import type {
  GetAddressListResponse,
  UpdateBestBlockNumberRequest,
} from './types';
import {
  mapToAdaTxs,
} from '../utils';
import {
  saveTxs,
} from './lovefieldDatabase';

/**
 * Note: returns -1 if no used addresses exist
 */
export async function getLatestUsedIndex(type: AddressType): Promise<number> {
  const adaAddresses = await getAdaAddressesByType(type);
  const usedAddresses = adaAddresses.filter(address => address.cadIsUsed);
  if (usedAddresses.length === 0) {
    return -1;
  }

  return Math.max(
    ...usedAddresses
      .map(address => address.index)
  );
}


export async function updateLastReceiveAddressIndex(): Promise<void> {
  const latest = await getLatestUsedIndex('External');

  const prevLastInStorage = await getLastReceiveAddressIndex();
  if (latest > prevLastInStorage) {
    await saveLastReceiveAddressIndex(latest);
  }
}

/** Update wallet metadata cached in localstorage */
export const updateAdaWalletMetaParams = async (
  walletMeta : AdaWalletMetaParams
): Promise<?AdaWallet> => {
  // Get existing wallet or return if non exists
  const persistentWallet = await getAdaWallet();
  if (!persistentWallet) return Promise.resolve();

  // Swap out meta parameters
  const updatedWallet = Object.assign({}, persistentWallet, { cwMeta: walletMeta });

  // Update the meta params cached in localstorage
  await saveAdaWallet(updatedWallet);
  return updatedWallet;
};

/** Update spending password and password last update time */
export const changeAdaWalletSpendingPassword = async (
  { oldPassword, newPassword }: {
    oldPassword: string,
    newPassword: string,
  }
): Promise<?AdaWallet> => {
  // update spending password
  {
    const walletMasterKey = await getWalletMasterKey();
    if (walletMasterKey == null) {
      throw new Error('No master key stored');
    }
    const updatedWalletMasterKey = updateWalletMasterKeyPassword(
      walletMasterKey,
      oldPassword,
      newPassword
    );
    await saveWalletMasterKey(updatedWalletMasterKey);
  }

  // update password last update time
  const wallet = await getAdaWallet();
  if (!wallet) {
    return Promise.resolve(null);
  }
  const updatedWallet = Object.assign(
    {},
    wallet,
    { cwPassphraseLU: moment().format() }
  );

  // save result in cache
  await saveAdaWallet(updatedWallet);

  return Promise.resolve(updatedWallet);
};

export const updateBestBlockNumber = async (
  request: UpdateBestBlockNumberRequest
): Promise<void> => {
  const lastKnownBlockNumber = await getLastBlockNumber();
  if (request.bestBlockNum > lastKnownBlockNumber) {
    await saveLastBlockNumber(request.bestBlockNum);
  }
};

export const updateTransactionList = async (
  newTxs: Array<Transaction>
): Promise<void> => {
  const adaAddresses = await getAdaAddressesList();
  const rawAddresses: Array<string> = adaAddresses.map(addr => addr.cadId);

  const adaTransactions = mapToAdaTxs(newTxs, rawAddresses);
  await saveTxs(adaTransactions);
  await updateLastReceiveAddressIndex();
};

export const getAddressList = async (
): Promise<GetAddressListResponse> => {
  const adaAddresses = await getAdaAddressesList();
  const rawAddresses = adaAddresses.map(addr => addr.cadId);
  return rawAddresses;
};

/** Calculate balance and update wallet balance cached in localstorage */
export const updateAdaWalletBalance = async (
  balance: BigNumber,
): Promise<void> => {
  // Get existing wallet or return if non exists
  const persistentWallet = await getAdaWallet();
  if (!persistentWallet) return Promise.resolve();

  // Calculate and set new user balance
  const updatedWallet = Object.assign({}, persistentWallet, {
    cwAmount: {
      getCCoin: balance.toString()
    }
  });

  // Update the balance cached in localstorage
  await saveAdaWallet(updatedWallet);
};
