// @flow
import _ from 'lodash';
import { Wallet } from 'rust-cardano-crypto';
import {
  toAdaAddress
} from './lib/cardanoCrypto/cryptoToModel';
import { getOrFail } from './lib/cardanoCrypto/cryptoUtils';
import {
  saveAddresses,
  getAddresses,
  getAddressesList,
  getAddressesListByType,
  deleteAddress,
  getUnusedExternalAddresses
} from './lib/lovefieldDatabase';
import {
  checkAddressesInUse,
  addressesLimit
} from './lib/icarus-backend-api';
import {
  getAddressInHex
} from './lib/utils';
import type {
  AdaAddresses,
  AdaAddress
} from './adaTypes';

export const ADDRESSES_KEY = 'ADDRESSES'; // we store a single Map<Address, AdaAddress>

export function isValidAdaAddress(address: string): Promise<boolean> {
  try {
    const result = getOrFail(Wallet.checkAddress(getAddressInHex(address)));
    return Promise.resolve(result);
  } catch (error) {
    // This error means the address is not valid
    if (error.message.includes('Expected(Array, UnsignedInteger)')) return Promise.resolve(false);
    throw error;
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
  addressType: AddressType,
  used: ?boolean
): void {
  const mappedAddresses: Array<AdaAddress> = addresses.map((hash, index) =>
    toAdaAddress(cryptoAccount.account, addressType, index, hash, used)
  );
  saveAddresses(mappedAddresses, addressType);
}

export async function updateUsedAddresses() {
  const adaAddresses = await getUnusedExternalAddresses();
  const usedAddressesPromises = _.chunk(adaAddresses, addressesLimit).map(_getUsedAddresses);
  const usedAddressesChunks = await Promise.all(usedAddressesPromises);
  const usedAddresses = usedAddressesChunks.reduce((accum, chunk) => accum.concat(chunk), []);
  await saveAddresses(usedAddresses, 'External');
}

async function _getUsedAddresses(adaAddresses) {
  const addresses = adaAddresses.map(address => address.cadId);
  const usedAddresses = await checkAddressesInUse(addresses);
  const usedAdaAddresses = adaAddresses.filter(adaAddress =>
    usedAddresses.includes(adaAddress.cadId));
  return usedAdaAddresses.map(adaAddress => Object.assign({}, adaAddress, { cadIsUsed: true }));
}
