// @flow
import _ from 'lodash';
import { Wallet } from 'rust-cardano-crypto';
import { getOrFail } from './lib/cardanoCrypto/cryptoUtils';
import {
  saveAsAdaAddresses,
  newAdaAddress
} from './adaAddress';
import {
  checkAddressesInUse,
} from './lib/icarus-backend-api';
import type {
  AdaWallet,
  AdaWalletParams
} from './adaTypes';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import {
  DiscoverAddressesError
} from './errors';
import { saveCryptoAccount, saveAdaWallet } from './adaLocalStorage';
import { createAdaWallet } from './adaWallet';
import { createCryptoAccount } from './adaAccount';
import type { ConfigType } from '../../../config/config-types';

declare var CONFIG: ConfigType;
const addressScanSize = CONFIG.app.addressScanSize;
const addressRequestSize = CONFIG.app.addressRequestSize;

export async function restoreAdaWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams): Promise<AdaWallet> {
  const [adaWallet, masterKey] = createAdaWallet({ walletPassword, walletInitData });
  const cryptoAccount = createCryptoAccount(masterKey, walletPassword);
  try {
    const externalAddressesToSave = await
      _discoverAllAddressesFrom(cryptoAccount, 'External', -1, addressScanSize, addressRequestSize);
    const internalAddressesToSave = await
      _discoverAllAddressesFrom(cryptoAccount, 'Internal', -1, addressScanSize, addressRequestSize);
    if (externalAddressesToSave.length !== 0 || internalAddressesToSave.length !== 0) {
      // TODO: Store all at once
      saveAsAdaAddresses(cryptoAccount, externalAddressesToSave, 'External');
      saveAsAdaAddresses(cryptoAccount, internalAddressesToSave, 'Internal');
    } else {
      newAdaAddress(cryptoAccount, [], 'External');
    }
  } catch (discoverAddressesError) {
    Logger.error('restoreAdaWallet::restoreAdaWallet error: ' +
      stringifyError(discoverAddressesError));
    throw new DiscoverAddressesError();
  }
  saveCryptoAccount(cryptoAccount);
  saveAdaWallet(adaWallet, masterKey);
  return Promise.resolve(adaWallet);
}

type AddressInfo = { address: string, isUsed: boolean, index: number };

async function _discoverAllAddressesFrom(
  cryptoAccount: CryptoAccount,
  addressType: AddressType,
  initialHighestUsedIndex: number,
  scanSize: number,
  requestSize: number,
) {
  let fetchedAddressesInfo = [];
  let highestUsedIndex = initialHighestUsedIndex;
  let shouldScanNewBatch = true;
  while (shouldScanNewBatch) {
    // Scans new batch (of size addressScanSize) to update the highestUsedIndex
    const [newHighestUsedIndex, newFetchedAddressesInfo] =
      await _scanAddressesBatchFrom(fetchedAddressesInfo, cryptoAccount, addressType,
                                    highestUsedIndex, scanSize, requestSize);

    shouldScanNewBatch = highestUsedIndex !== newHighestUsedIndex;
    highestUsedIndex = newHighestUsedIndex;
    fetchedAddressesInfo = newFetchedAddressesInfo;
  }
  return fetchedAddressesInfo.slice(0, highestUsedIndex + 1)
                             .map((addressInfo) => addressInfo.address);
}

async function _scanAddressesBatchFrom(
  fetchedAddressesInfo: Array<AddressInfo>,
  cryptoAccount: CryptoAccount,
  addressType: AddressType,
  highestUsedIndex: number,
  scanSize: number,
  requestSize: number,
) {
  const [newFetchedAddressesInfo, addressesToScan] =
      await _getAddressToScan(fetchedAddressesInfo, cryptoAccount,
                              addressType, highestUsedIndex + 1, scanSize, requestSize);

  const newHighestUsedIndex = addressesToScan.reduce((currentHighestIndex, addressInfo) => {
    if (addressInfo.index > currentHighestIndex && addressInfo.isUsed) {
      return addressInfo.index;
    }
    return currentHighestIndex;
  }, highestUsedIndex);

  return Promise.resolve([newHighestUsedIndex, newFetchedAddressesInfo]);
}

async function _getAddressToScan(
  fetchedAddressesInfo: Array<AddressInfo>,
  cryptoAccount: CryptoAccount,
  addressType: AddressType,
  fromIndex: number,
  scanSize: number,
  requestSize: number,
): Promise<Array<Array<AddressInfo>>> {
  let newFetchedAddressesInfo = fetchedAddressesInfo;

  // Requests new batch (of size addressRequestSize) to add to the currently fetched ones
  if (fetchedAddressesInfo.length < fromIndex + scanSize) {
    const addressesIndex = _.range(fetchedAddressesInfo.length,
                                   fetchedAddressesInfo.length + requestSize);
    const newAddresses = getOrFail(
      Wallet.generateAddresses(cryptoAccount, addressType, addressesIndex));
    const usedAddresses = await checkAddressesInUse(newAddresses);
    newFetchedAddressesInfo = _addFetchedAddressesInfo(fetchedAddressesInfo, newAddresses,
                                                       usedAddresses, addressesIndex);
  }

  return Promise.resolve([
    newFetchedAddressesInfo,
    newFetchedAddressesInfo.slice(fromIndex, fromIndex + scanSize)
  ]);
}

function _addFetchedAddressesInfo(
  fetchedAddressesInfo: Array<AddressInfo>,
  newAddresses: Array<string>,
  usedAddresses: Array<string>,
  addressesIndex: Array<number>
) {
  const isUsedSet = new Set(usedAddresses);

  const newAddressesInfo = newAddresses.map((address, position) => ({
    address,
    isUsed: isUsedSet.has(address),
    index: addressesIndex[position]
  }));

  return fetchedAddressesInfo.concat(newAddressesInfo);
}
