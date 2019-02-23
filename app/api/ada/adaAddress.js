// @flow

// Handles "Addresses" as defined in the bip44 specification
// Also handles interfacing with the LovefieldDB for everything related purely to addresses.

import { Wallet } from 'rust-cardano-crypto';
import _ from 'lodash';
import config from '../../config';
import {
  toAdaAddress
} from './lib/cardanoCrypto/cryptoToModel';
import { getResultOrFail } from './lib/cardanoCrypto/cryptoUtils';
import {
  saveAddresses,
  getAddresses,
  getAddressesList,
  getAddressesListByType,
  deleteAddress
} from './lib/lovefieldDatabase';
import type {
  AddressesTableRow
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
    const result: boolean = getResultOrFail(Wallet.checkAddress(getAddressInHex(address)));
    return Promise.resolve(result);
  } catch (validateAddressError) {
    Logger.error('adaAddress::isValidAdaAddress error: ' +
      stringifyError(validateAddressError));

    // This error means the address is not valid
    return Promise.resolve(false);
  }
}

export type AdaAddressMap = {[key: string]:AdaAddress}

/** Get a mapping of address hash to AdaAddress */
export function getAdaAddressesMap(): Promise<AdaAddressMap> {
  // Just return all existing addresses because we are using a SINGLE account
  // TODO: make this work for multiple accounts in case we add multiple accounts eventually
  return getAddresses().then(
    addresses => addressesToAddressMap(addresses.map(r => r.value))
  );
}

export function addressesToAddressMap(addresses: Array<AdaAddress>): AdaAddressMap {
  return _.keyBy(addresses, a => a.cadId);
}

/** Wrapper function for LovefieldDB call to get all AdaAddresses */
export function getAdaAddressesList(): Promise<Array<AdaAddress>> {
  return getAddressesList();
}

/** Wrapper function for LovefieldDB call to get all AdaAddresses by type */
export function getAdaAddressesByType(addressType: AddressType): Promise<AdaAddresses> {
  return getAddressesListByType(addressType);
}

export async function newExternalAdaAddress(
  cryptoAccount: CryptoAccount
): Promise<AdaAddress> {
  return await newAdaAddress(cryptoAccount, 'External', addresses => {
    // We use the isUsed status to now find the next unused address
    const lastUsedAddressIndex = _.findLastIndex(addresses, address => address.cadIsUsed) + 1;
    // TODO Move this to a config file
    const unusedSpan = addresses.length - lastUsedAddressIndex;
    if (unusedSpan >= MAX_ALLOWED_UNUSED_ADDRESSES) {
      throw new UnusedAddressesError();
    }
  });
}

/** Create and save the next address for the given account */
export async function newAdaAddress(
  cryptoAccount: CryptoAccount,
  addressType: AddressType,
  addrValidation?: (AdaAddresses => void)
): Promise<AdaAddress> {
  const address: AdaAddress = await createAdaAddress(cryptoAccount, addressType, addrValidation);
  await saveAdaAddress(address, addressType);
  return address;
}

/** Create new wallet address based off bip44 and then convert it to an AdaAddress */
export async function createAdaAddress(
  cryptoAccount: CryptoAccount,
  addressType: AddressType,
  addrValidation?: (AdaAddresses => void)
): Promise<AdaAddress> {
  // Note this function doesn't just get the addresses but also calculates their isUsed status
  const filteredAddresses = await getAdaAddressesByType(addressType);
  if (addrValidation) {
    addrValidation(filteredAddresses);
  }
  const addressIndex = filteredAddresses.length;
  const [address]: Array<string> = getResultOrFail(
    Wallet.generateAddresses(cryptoAccount, addressType, [addressIndex])
  );
  return toAdaAddress(cryptoAccount.account, addressType, addressIndex, address);
}

/** Wrapper function to save addresses to LovefieldDB */
export function saveAdaAddress(
  address: AdaAddress,
  addressType: AddressType
): Promise<Array<AddressesTableRow>> {
  return saveAddresses([address], addressType);
}

/** Wrapper function to remove an addresse from LovefieldDB */
export function removeAdaAddress(
  address: AdaAddress
): Promise<Array<void>> {
  return deleteAddress(address.cadId);
}

/** Save list of addresses from lovefieldDB */
export async function saveAsAdaAddresses(
  cryptoAccount: CryptoAccount,
  addresses: Array<string>,
  addressType: AddressType
): Promise<Array<AddressesTableRow>> {
  const mappedAddresses: Array<AdaAddress> = addresses.map((hash, index) => (
    toAdaAddress(cryptoAccount.account, addressType, index, hash)
  ));
  return saveAddresses(mappedAddresses, addressType);
}

/** Follow heuristic to pick which address to send Daedalus transfer to */
export async function getReceiverAddress(): Promise<string> {
  // Note: Current heuristic is to pick the first address in the wallet
  // rationale & better heuristic described at https://github.com/Emurgo/yoroi-frontend/issues/96
  const addresses = await getAdaAddressesByType('External');
  return addresses[0].cadId;
}
