// @flow
import _ from 'lodash';
import { Wallet } from 'rust-cardano-crypto';
import { getResultOrFail } from '../lib/cardanoCrypto/cryptoUtils';
import {
  saveAsAdaAddresses,
  newAdaAddress
} from '../adaAddress';
import {
  checkAddressesInUse,
} from '../lib/yoroi-backend-api';
import type {
  AdaWallet,
  AdaHardwareWalletParams
} from '../adaTypes';
import {
  Logger,
  stringifyError
} from '../../../utils/logging';
import { saveCryptoAccount, saveAdaWallet } from '../adaLocalStorage';
import { createAdaHardwareWallet } from '../adaWallet';
import { createHardwareWalletAccount } from '../adaAccount';
import type { ConfigType } from '../../../../config/config-types';

type AddressInfo = { address: string, isUsed: boolean, index: number };

declare var CONFIG: ConfigType;
const addressScanSize = CONFIG.app.addressScanSize;
const addressRequestSize = CONFIG.app.addressRequestSize;

export async function connectTrezorAdaWallet({
  walletInitData
}: AdaHardwareWalletParams): Promise<AdaWallet> {
  try {
    Logger.debug('connectTrezorAdaWallet::connectTrezorAdaWallet called');

    // create ada wallet object for hardware wallet
    const [adaWallet] = createAdaHardwareWallet({ walletInitData });
    // create crypto account object for hardware wallet
    // eslint-disable-next-line max-len
    const cryptoAccount = createHardwareWalletAccount(walletInitData.cwHardwareInfo.publicMasterKey);

    // fetch all External addresses
    const externalAddressesToSave =
      await _discoverAllAddressesFrom(cryptoAccount, 'External', -1, addressScanSize, addressRequestSize);

    // fetch all Internal addresses
    const internalAddressesToSave =
      await _discoverAllAddressesFrom(cryptoAccount, 'Internal', -1, addressScanSize, addressRequestSize);

    // store wallet related addresses to lovefieldDatabase
    if (externalAddressesToSave.length !== 0 || internalAddressesToSave.length !== 0) {
      await Promise.all([
        saveAsAdaAddresses(cryptoAccount, externalAddressesToSave, 'External'),
        saveAsAdaAddresses(cryptoAccount, internalAddressesToSave, 'Internal')
      ]);
    } else {
      // no related addresses found, give it a new address and save it to lovefieldDatabase
      await newAdaAddress(cryptoAccount, [], 'External');
    }

    // save crypto account to the local storage
    saveCryptoAccount(cryptoAccount);

    // save ada wallet to the local storage
    saveAdaWallet(adaWallet);

    // It's a success, we are done
    // 1. creating wallet and crypto account
    // 2. storing wallet and crypto account to the local storage
    // 3. storing wallet related addresses to lovefieldDatabase
    Logger.debug('connectTrezorAdaWallet::connectTrezorAdaWallet success');
    return adaWallet;
  } catch (error) {
    Logger.error(`connectTrezorAdaWallet::connectTrezorAdaWallet error: ${stringifyError(error)}`);
    throw error;
  }
}

// FIXME : repeated in all wallet creation, try to make it reusable

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

  return [newHighestUsedIndex, newFetchedAddressesInfo];
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
    const newAddresses = getResultOrFail(
      Wallet.generateAddresses(cryptoAccount, addressType, addressesIndex));
    const usedAddresses = await checkAddressesInUse(newAddresses);
    newFetchedAddressesInfo = _addFetchedAddressesInfo(fetchedAddressesInfo, newAddresses,
                                                       usedAddresses, addressesIndex);
  }

  return [
    newFetchedAddressesInfo,
    newFetchedAddressesInfo.slice(fromIndex, fromIndex + scanSize)
  ];
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

// FIXME : repeated in all wallet creation, try to make it reusable
