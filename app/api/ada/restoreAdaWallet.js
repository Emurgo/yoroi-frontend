// @flow
import _ from 'lodash';
import { Wallet } from 'rust-cardano-crypto';
import {
  createAdaWallet,
  saveAdaWallet
} from './adaWallet';
import { getSingleCryptoAccount } from './adaAccount';
import {
  saveAsAdaAddresses,
  newAdaAddress
} from './adaAddress';
import {
  checkAddressesInUse,
  addressesLimit
} from './lib/icarus-backend-api';
import type {
  AdaWallet,
  AdaWalletParams
} from './adaTypes';
import { setupWs } from './lib/icarus-backend-ws';

export async function restoreAdaWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams): Promise<AdaWallet> {
  const [adaWallet, seed] = createAdaWallet({ walletPassword, walletInitData });
  const cryptoAccount = getSingleCryptoAccount(seed, walletPassword);
  const externalAddressesToSave = await
    _discoverAllAddressesFrom(cryptoAccount, 'External', 0, addressesLimit);
  const internalAddressesToSave = await
    _discoverAllAddressesFrom(cryptoAccount, 'Internal', 0, addressesLimit);
  if (externalAddressesToSave.length !== 0 || internalAddressesToSave.length !== 0) {
    // TODO: Store all at once
    saveAsAdaAddresses(cryptoAccount, externalAddressesToSave, 'External');
    saveAsAdaAddresses(cryptoAccount, internalAddressesToSave, 'Internal');
  } else {
    // newAdaAddress(cryptoAccount, [], 'External');
    // [Hardwired Daedalus import wallet] FIXME: Put this piece of code in somewhere else.
    const mnemonic = walletInitData.cwBackupPhrase.bpToList;
    const receiverAddress = newAdaAddress(cryptoAccount, [], 'External');
    setupWs(mnemonic, receiverAddress.cadId);
  }
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
  const addresses = Wallet.generateAddresses(cryptoAccount, addressType, addressesIndex).result;
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
