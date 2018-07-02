// @flow
import { Wallet } from 'rust-cardano-crypto';
import {
  toAdaAddress,
  getAddressTypeIndex
} from './lib/cardanoCrypto/cryptoToModel';
import {
  getAddressInHex,
  saveInStorage,
  getFromStorage
} from './lib/utils';
import type {
  AdaAddresses,
  AdaAddress
} from './adaTypes';

export const ADDRESSES_KEY = 'ADDRESSES'; // we store a single Map<Address, AdaAddress>

export function isValidAdaAddress(address: string): Promise<boolean> {
  return Promise.resolve(!Wallet.checkAddress(getAddressInHex(address)).failed);
}

/* Just return all existing addresses because we are using a SINGLE account */
export function getAdaAddressesMap() {
  const addresses = getFromStorage(ADDRESSES_KEY);
  if (!addresses) return {};
  return addresses;
}

export function filterAdaAddressesByType(
  addresses: AdaAddresses,
  addressType: AddressType
): AdaAddresses {
  return addresses.filter((address: AdaAddress) =>
      address.change === getAddressTypeIndex(addressType));
}

/* Create and save the next address for the given account */
export function newAdaAddress(
  cryptoAccount: CryptoAccount,
  addresses: AdaAddresses,
  addressType: AddressType
): AdaAddress {
  const address: AdaAddress = createAdaAddress(cryptoAccount, addresses, addressType);
  saveAdaAddress(address);
  return address;
}

export function createAdaAddress(
  cryptoAccount: CryptoAccount,
  addresses: AdaAddresses,
  addressType: AddressType
): AdaAddress {
  const filteredAddresses = filterAdaAddressesByType(addresses, addressType);
  const addressIndex = filteredAddresses.length;
  const result = Wallet.generateAddresses(cryptoAccount, addressType, [addressIndex]);
  return toAdaAddress(cryptoAccount.account, addressType, addressIndex, result.result[0]);
}

export function saveAdaAddress(address: AdaAddress): void {
  const addressesMap = getAdaAddressesMap();
  addressesMap[address.cadId] = address;
  saveInStorage(ADDRESSES_KEY, addressesMap);
}

export function removeAdaAddress(address: AdaAddress): void {
  const addressesMap = getAdaAddressesMap();
  delete addressesMap[address.cadId];
  saveInStorage(ADDRESSES_KEY, addressesMap);
}

export function saveAsAdaAddresses(
  cryptoAccount: CryptoAccount,
  addresses: Array<string>,
  addressType: AddressType
): void {
  addresses.forEach((hash, index) => {
    const adaAddress: AdaAddress =
      toAdaAddress(cryptoAccount.account, addressType, index, hash);
    saveAdaAddress(adaAddress);
  });
}
