
// @flow

// TODO: this file is not a library so it shouldn't be in the "lib" folder

import _ from 'lodash';
import type {
  FilterFunc,
} from './state-fetch/types';
import type {
  AddressType
} from '../adaTypes';

import { RustModule } from './cardanoCrypto/rustLoader';
import type { ConfigType } from '../../../../config/config-types';

declare var CONFIG: ConfigType;
const protocolMagic = CONFIG.network.protocolMagic;

type AddressInfo = { address: string, isUsed: boolean, index: number };

/** Repeatedly scan addresses until there is a contiguous block of `scanSize` addresses unused
 * @returns all scanned addresses
 */
export async function discoverAllAddressesFrom(
  cryptoAccount: RustModule.Wallet.Bip44AccountPublic,
  addressType: AddressType,
  initialHighestUsedIndex: number,
  scanSize: number,
  requestSize: number,
  checkAddressesInUse: FilterFunc,
): Promise<Array<string>> {
  let fetchedAddressesInfo = [];
  let highestUsedIndex = initialHighestUsedIndex;

  // keep scanning until no new used addresses are found in batch
  let shouldScanNewBatch = true;
  while (shouldScanNewBatch) {
    const newFetchedAddressesInfo =
      // eslint-disable-next-line no-await-in-loop
      await _scanNextBatch(
        fetchedAddressesInfo,
        cryptoAccount,
        addressType,
        initialHighestUsedIndex + 1,
        highestUsedIndex + 1,
        scanSize,
        requestSize,
        checkAddressesInUse,
      );

    const newHighestUsedIndex = _findNewHighestIndex(
      newFetchedAddressesInfo,
      initialHighestUsedIndex + 1,
      highestUsedIndex,
      scanSize
    );

    shouldScanNewBatch = highestUsedIndex !== newHighestUsedIndex;
    highestUsedIndex = newHighestUsedIndex;
    fetchedAddressesInfo = newFetchedAddressesInfo;
  }

  return fetchedAddressesInfo
    // bip-44 requires scanSize buffer
    .slice(0, highestUsedIndex - initialHighestUsedIndex + scanSize)
    .map((addressInfo) => addressInfo.address);
}

/** Scan a set of addresses and find the largest index that is used */
function _findNewHighestIndex(
  newFetchedAddressesInfo: Array<AddressInfo>,
  offset: number,
  highestUsedIndex: number,
  scanSize: number,
): number {
  // get all addresses added in this scan
  const newlyAddedAddresses = newFetchedAddressesInfo.slice(
    highestUsedIndex - offset + 1,
    highestUsedIndex - offset + 1 + scanSize // note: not `requestSize`
  );

  // find new highest used
  const newHighestUsedIndex = newlyAddedAddresses.reduce(
    (currentHighestIndex, addressInfo) => {
      if (addressInfo.index > currentHighestIndex && addressInfo.isUsed) {
        return addressInfo.index;
      }
      return currentHighestIndex;
    },
    highestUsedIndex
  );

  return newHighestUsedIndex;
}

/** If there are any addresses to scan,
 * batch `requestSize` calls to cryptographic primitives to restore addresses
 * @returns all scanned addresses to date including the new ones
 */
async function _scanNextBatch(
  fetchedAddressesInfo: Array<AddressInfo>,
  cryptoAccount: RustModule.Wallet.Bip44AccountPublic,
  addressType: AddressType,
  offset: number,
  fromIndex: number,
  scanSize: number,
  requestSize: number,
  checkAddressesInUse: FilterFunc,
): Promise<Array<AddressInfo>> {
  let newFetchedAddressesInfo = fetchedAddressesInfo;

  /* Optimization: use `requestSize` to batch calls to crypto backend and to backend-service api
   * Allows us to make more than `scanSize` calls at a time
   *
   * Note: requestSize doesn't have to be a multiple of scanSize
   * since we batch based off total fetched and not total scanned
   */

  // check if already scanned in a previous batch
  if (fetchedAddressesInfo.length + offset >= fromIndex + scanSize) {
    return fetchedAddressesInfo;
  }

  // create batch
  const addressesIndex = _.range(
    fetchedAddressesInfo.length + offset,
    fetchedAddressesInfo.length + offset + requestSize
  );

  // batch to cryptography backend
  const newAddresses = generateAddressBatch(
    addressesIndex,
    cryptoAccount,
    addressType
  );

  // batch to backend API
  const usedAddresses = await checkAddressesInUse({ addresses: newAddresses });

  // Update metadata for new addresses
  newFetchedAddressesInfo = _addFetchedAddressesInfo(
    fetchedAddressesInfo,
    newAddresses,
    usedAddresses,
    addressesIndex,
    offset
  );

  return newFetchedAddressesInfo;
}

/** Add in the metadata for new addresses that depend on existing wallet state */
function _addFetchedAddressesInfo(
  fetchedAddressesInfo: Array<AddressInfo>,
  newAddresses: Array<string>,
  usedAddresses: Array<string>,
  addressesIndex: Array<number>,
  offset: number,
): Array<AddressInfo> {
  const isUsedSet = new Set(usedAddresses);

  const newAddressesInfo = newAddresses.map((address, position) => ({
    address,
    isUsed: isUsedSet.has(address),
    index: addressesIndex[position] - offset
  }));

  return fetchedAddressesInfo.concat(newAddressesInfo);
}

export function generateAddressBatch(
  indices: Array<number>,
  cryptoAccount: RustModule.Wallet.Bip44AccountPublic,
  type: AddressType,
): Array<string> {
  const setting = RustModule.Wallet.BlockchainSettings.from_json({
    protocol_magic: protocolMagic
  });
  return indices.map(i => {
    const pubKey = cryptoAccount.address_key(
      type === 'Internal',
      RustModule.Wallet.AddressKeyIndex.new(i)
    );
    const addr = pubKey.bootstrap_era_address(setting);
    return addr.to_base58();
  });
}
