
// @flow

import { range } from 'lodash';
import type { NetworkRow } from '../../../ada/lib/storage/database/primitives/tables';
import type { FilterFunc } from '../../../ada/lib/state-fetch/types';

type AddressInfo = {|
  address: string,
  isUsed: boolean,
  index: number,
|};

export type GenerateAddressFunc = (
  indices: Array<number>,
) => Array<string>;

/** Repeatedly scan addresses until there is a contiguous block of `scanSize` addresses unused
 * @returns all scanned addresses
 */
export async function discoverAllAddressesFrom(
  generateAddressFunc: GenerateAddressFunc,
  initialHighestUsedIndex: number,
  scanSize: number,
  requestSize: number,
  checkAddressesInUse: FilterFunc,
  network: $ReadOnly<NetworkRow>,
): Promise<Array<{| address: string, isUsed: boolean, index: number |}>> {
  let fetchedAddressesInfo: Array<AddressInfo> = [];
  let highestUsedIndex = initialHighestUsedIndex;

  // keep scanning until no new used addresses are found in batch
  let shouldScanNewBatch = true;
  while (shouldScanNewBatch) {
    const newFetchedAddressesInfo =
      // eslint-disable-next-line no-await-in-loop
      await _scanNextBatch(
        fetchedAddressesInfo,
        generateAddressFunc,
        initialHighestUsedIndex + 1,
        highestUsedIndex + 1,
        scanSize,
        requestSize,
        checkAddressesInUse,
        network,
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

  let highestInBatch = -1;
  for (let i = 0; i < fetchedAddressesInfo.length; i++) {
    if (i > highestInBatch && fetchedAddressesInfo[i].isUsed) {
      highestInBatch = i;
    }
  }
  return fetchedAddressesInfo
    // bip-44 requires scanSize buffer
    .slice(0, (highestInBatch + scanSize) + 1) // +1 since range is exclusive
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
  generateAddressFunc: GenerateAddressFunc,
  offset: number,
  fromIndex: number,
  scanSize: number,
  requestSize: number,
  checkAddressesInUse: FilterFunc,
  network: $ReadOnly<NetworkRow>,
): Promise<Array<AddressInfo>> {
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
  const addressesIndex = range(
    fetchedAddressesInfo.length + offset,
    fetchedAddressesInfo.length + offset + requestSize
  );

  // batch to cryptography backend
  const newAddresses = generateAddressFunc(
    addressesIndex,
  );

  // batch to backend API
  const usedAddresses = await checkAddressesInUse({
    network,
    addresses: newAddresses,
  });

  // Update metadata for new addresses
  const newFetchedAddressesInfo = _addFetchedAddressesInfo(
    fetchedAddressesInfo,
    newAddresses,
    usedAddresses,
    addressesIndex,
  );

  return newFetchedAddressesInfo;
}

/** Add in the metadata for new addresses that depend on existing wallet state */
function _addFetchedAddressesInfo(
  fetchedAddressesInfo: Array<AddressInfo>,
  newAddresses: Array<string>,
  usedAddresses: Array<string>,
  addressesIndex: Array<number>,
): Array<AddressInfo> {
  const isUsedSet = new Set(usedAddresses);

  const newAddressesInfo = newAddresses.map((address, position) => ({
    address,
    isUsed: isUsedSet.has(address),
    index: addressesIndex[position]
  }));

  return fetchedAddressesInfo.concat(newAddressesInfo);
}
