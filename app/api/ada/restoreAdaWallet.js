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
  const [adaWallet, seed] = createAdaWallet({ walletPassword, walletInitData });
  const cryptoAccount = createCryptoAccount(seed, walletPassword);
  try {
    const externalAddressesToSave = await
      _discoverAllAddressesFrom(cryptoAccount, 'External', 0, addressScanSize, addressRequestSize);
    const internalAddressesToSave = await
      _discoverAllAddressesFrom(cryptoAccount, 'Internal', 0, addressScanSize, addressRequestSize);
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
  saveAdaWallet(adaWallet, seed);
  return Promise.resolve(adaWallet);
}

type AddressInfo = { address: string, isUsed: boolean, index: number };

async function _discoverAllAddressesFrom(
  cryptoAccount: CryptoAccount,
  addressType: AddressType,
  initialIndex: number,
  scanSize: number,
  requestSize: number,
) {
  let addressesDiscovered = [];
  const fetchedAddressesInfo = [];
  let fromIndex = initialIndex;
  while (fromIndex >= 0) {
    const [newIndex, addressesRecovered] =
      await _discoverAddressesFrom(fetchedAddressesInfo, cryptoAccount, addressType,
                                   fromIndex, scanSize, requestSize);
    fromIndex = newIndex;
    addressesDiscovered = addressesDiscovered.concat(addressesRecovered);
  }
  return addressesDiscovered;
}

async function _discoverAddressesFrom(
  fetchedAddressesInfo: Array<AddressInfo>,
  cryptoAccount: CryptoAccount,
  addressType: AddressType,
  fromIndex: number,
  scanSize: number,
  requestSize: number,
) {
  const addressesInfo = await _getAddressToScan(fetchedAddressesInfo, cryptoAccount,
                                                addressType, fromIndex, scanSize, requestSize);
  const highestIndex = addressesInfo.reduce((currentHighestIndex, addressInfo) => {
    if (addressInfo.index > currentHighestIndex && addressInfo.isUsed) {
      return addressInfo.index;
    }
    return currentHighestIndex;
  }, -1);
  if (highestIndex >= 0) {
    const nextIndex = highestIndex + 1;
    return Promise.resolve([
      nextIndex,
      addressesInfo.slice(0, nextIndex - fromIndex).map((addressInfo) => addressInfo.address)
    ]);
  }
  return Promise.resolve([highestIndex, []]);
}

async function _getAddressToScan(
  fetchedAddressesInfo: Array<AddressInfo>,
  cryptoAccount: CryptoAccount,
  addressType: AddressType,
  fromIndex: number,
  scanSize: number,
  requestSize: number,
): Promise<Array<AddressInfo>> {
  if (fetchedAddressesInfo.length < fromIndex + scanSize) {
    const addressesIndex = _.range(fetchedAddressesInfo.length,
                                   fetchedAddressesInfo.length + requestSize);
    const newAddresses = getOrFail(
      Wallet.generateAddresses(cryptoAccount, addressType, addressesIndex));
    const usedAddresses = await checkAddressesInUse(newAddresses);
    _addFetchedAddressesInfo(fetchedAddressesInfo, newAddresses, usedAddresses, addressesIndex);
  }

  return Promise.resolve(fetchedAddressesInfo.slice(fromIndex, fromIndex + scanSize));
}

function _addFetchedAddressesInfo(
  fetchedAddressesInfo: Array<AddressInfo>,
  newAddresses: Array<string>,
  usedAddresses: Array<string>,
  addressesIndex: Array<number>
) {
  const isUsedSet = new Set(usedAddresses);

  newAddresses.forEach((address, position) => {
    const addressInfo = {
      address,
      isUsed: isUsedSet.has(address),
      index: addressesIndex[position]
    };
    fetchedAddressesInfo.push(addressInfo);
  });
}
