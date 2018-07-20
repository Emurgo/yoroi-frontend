// @flow
import _ from 'lodash';
import { Wallet } from 'rust-cardano-crypto';
import config from '../../config';
import { getOrFail } from './lib/cardanoCrypto/cryptoUtils';
import {
  createAdaWallet,
  saveAdaWallet
} from './adaWallet';
import {
  createCryptoAccount,
  saveCryptoAccount
} from './adaAccount';
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

const { ADDRESS_REQUEST_SIZE } = config.wallets;

export async function restoreAdaWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams): Promise<AdaWallet> {
  const [adaWallet, seed] = createAdaWallet({ walletPassword, walletInitData });
  const cryptoAccount = createCryptoAccount(seed, walletPassword);
  try {
    const externalAddressesToSave = await
      _discoverAllAddressesFrom(cryptoAccount, 'External', 0, ADDRESS_REQUEST_SIZE);
    const internalAddressesToSave = await
      _discoverAllAddressesFrom(cryptoAccount, 'Internal', 0, ADDRESS_REQUEST_SIZE);
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

async function _discoverAllAddressesFrom(
  cryptoAccount: CryptoAccount,
  addressType: AddressType,
  initialIndex: number,
  offset: number
) {
  let addressesDiscovered = [];
  let fromIndex = initialIndex;
  while (fromIndex >= 0) {
    const [newIndex, addressesRecovered] =
      await _discoverAddressesFrom(cryptoAccount, addressType, fromIndex, offset);
    fromIndex = newIndex;
    addressesDiscovered = addressesDiscovered.concat(addressesRecovered);
  }
  return addressesDiscovered;
}

async function _discoverAddressesFrom(
  cryptoAccount: CryptoAccount,
  addressType: AddressType,
  fromIndex: number,
  offset: number
) {
  const addressesIndex = _.range(fromIndex, fromIndex + offset);
  const addresses = getOrFail(Wallet.generateAddresses(cryptoAccount, addressType, addressesIndex));
  const addressIndexesMap = _generateAddressIndexesMap(addresses, addressesIndex);
  const usedAddresses = await checkAddressesInUse(addresses);
  const highestIndex = usedAddresses.reduce((currentHighestIndex, address) => {
    const index = addressIndexesMap[address];
    if (index > currentHighestIndex) {
      return index;
    }
    return currentHighestIndex;
  }, -1);
  if (highestIndex >= 0) {
    const nextIndex = highestIndex + 1;
    return Promise.resolve([nextIndex, addresses.slice(0, nextIndex - fromIndex)]);
  }
  return Promise.resolve([highestIndex, []]);
}

function _generateAddressIndexesMap(
  addresses: Array<string>,
  addressesIndex: Array<number>
) {
  const map = {};
  addresses.forEach((address, position) => {
    map[address] = addressesIndex[position];
  });
  return map;
}
