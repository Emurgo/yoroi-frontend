// @flow
import { Wallet } from 'rust-cardano-crypto';
import _ from 'lodash';
import config from '../../config';
import {
  toAdaAddress
} from './lib/cardanoCrypto/cryptoToModel';
import { getOrFail } from './lib/cardanoCrypto/cryptoUtils';
import {
  saveAddresses,
  getAddresses,
  getAddressesList,
  getAddressesListByType,
  deleteAddress
} from './lib/lovefieldDatabase';
import {
  UnusedAddressesError,
} from '../common';
import {
  getAddressInHex
} from './lib/utils';
import type {
  AdaAddresses,
  AdaAddress
} from './adaTypes';
import {
  Logger,
  stringifyError
} from '../../utils/logging';

const { MAX_ALLOWED_UNUSED_ADDRESSES } = config.wallets;

export function isValidAdaAddress(address: string): Promise<boolean> {
  try {
    const result = getOrFail(Wallet.checkAddress(getAddressInHex(address)));
    return Promise.resolve(result);
  } catch (validateAddressError) {
    Logger.error('adaAddress::isValidAdaAddress error: ' +
      stringifyError(validateAddressError));

    // This error means the address is not valid
    return Promise.resolve(false);
  }
}

/* Just return all existing addresses because we are using a SINGLE account */
export function getAdaAddressesMap() {
  return getAddresses().then(addresses => {
    const addressesMap = {};
    addresses.forEach(address => {
      addressesMap[address.id] = address.value;
    });
    return addressesMap;
  });
}

export function getAdaAddressesList() {
  return getAddressesList();
}

export function getAdaAddressesByType(addressType: AddressType): Promise<AdaAddresses> {
  return getAddressesListByType(addressType);
}

export async function newExternalAdaAddress(
  cryptoAccount: CryptoAccount
): Promise<AdaAddress> {
  const addresses: AdaAddresses = await getAdaAddressesByType('External');
  const lastUsedAddressIndex = _.findLastIndex(addresses, address => address.cadIsUsed) + 1;
  // TODO Move this to a config file
  const unusedSpan = addresses.length - lastUsedAddressIndex;
  if (unusedSpan >= MAX_ALLOWED_UNUSED_ADDRESSES) {
    throw new UnusedAddressesError();
  }
  const newAddress: AdaAddress = await newAdaAddress(cryptoAccount, addresses, 'External');
  return newAddress;
}

/* Create and save the next address for the given account */
export async function newAdaAddress(
  cryptoAccount: CryptoAccount,
  addresses: AdaAddresses,
  addressType: AddressType
): Promise<AdaAddress> {
  const address: AdaAddress = await createAdaAddress(cryptoAccount, addresses, addressType);
  await saveAdaAddress(address, addressType);
  return address;
}

export async function createAdaAddress(
  cryptoAccount: CryptoAccount,
  addresses: AdaAddresses,
  addressType: AddressType
): Promise<AdaAddress> {
  const filteredAddresses = await getAdaAddressesByType(addressType);
  const addressIndex = filteredAddresses.length;
  const [address] = getOrFail(Wallet.generateAddresses(cryptoAccount, addressType, [addressIndex]));
  return toAdaAddress(cryptoAccount.account, addressType, addressIndex, address);
}

export function saveAdaAddress(address: AdaAddress, addressType: AddressType): Promise<void> {
  return saveAddresses([address], addressType);
}

export function removeAdaAddress(address: AdaAddress): void {
  deleteAddress(address.cadId);
}

export function saveAsAdaAddresses(
  cryptoAccount: CryptoAccount,
  addresses: Array<string>,
  addressType: AddressType
): void {
  const mappedAddresses: Array<AdaAddress> = addresses.map((hash, index) =>
    toAdaAddress(cryptoAccount.account, addressType, index, hash)
  );
  saveAddresses(mappedAddresses, addressType);
}
