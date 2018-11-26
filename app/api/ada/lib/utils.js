// @flow
import _ from 'lodash';
import bs58 from 'bs58';
import BigNumber from 'bignumber.js';
import { Wallet } from 'rust-cardano-crypto';

import {
  getResultOrFail
} from './cardanoCrypto/cryptoUtils';
import {
  checkAddressesInUse,
} from './yoroi-backend-api';
import type {
  AdaTransactionInputOutput,
  Transaction,
  AdaTransaction,
  AdaTransactionCondition
} from '../adaTypes';

type AddressInfo = { address: string, isUsed: boolean, index: number };

export const localeDateToUnixTimestamp =
  (localeDate: string) => new Date(localeDate).getTime();

export function mapToList(map: any): Array<any> {
  return Object.values(map);
}

export function getAddressInHex(address: string): string {
  const bytes = bs58.decode(address);
  return bytes.toString('hex');
}

export const toAdaTx = function (
  amount: BigNumber,
  tx: Transaction,
  inputs: Array<AdaTransactionInputOutput>,
  isOutgoing: boolean,
  outputs: Array<AdaTransactionInputOutput>,
  time: string
): AdaTransaction {
  return {
    ctAmount: {
      getCCoin: amount.toString()
    },
    ctBlockNumber: Number(tx.block_num || ''),
    ctId: tx.hash,
    ctInputs: inputs,
    ctIsOutgoing: isOutgoing,
    ctMeta: {
      ctmDate: new Date(time),
      ctmDescription: undefined,
      ctmTitle: undefined,
      ctmUpdate: new Date(tx.last_update)
    },
    ctOutputs: outputs,
    ctCondition: _getTxCondition(tx.tx_state)
  };
};

/** Convert TxState from icarus-importer to AdaTransactionCondition */
const _getTxCondition = (state: string): AdaTransactionCondition => {
  if (state === 'Successful') return 'CPtxInBlocks';
  if (state === 'Pending') return 'CPtxApplying';
  return 'CPtxWontApply';
};

/** Repeatedly scan addresses until there is a contiguous block of `scanSize` addresses unused
 * @returns all scanned addresses
 */
export async function discoverAllAddressesFrom(
  cryptoAccount: CryptoAccount,
  addressType: AddressType,
  initialHighestUsedIndex: number,
  scanSize: number,
  requestSize: number,
): Promise<Array<string>> {
  let fetchedAddressesInfo = [];
  let highestUsedIndex = initialHighestUsedIndex;

  // keep scanning until no new unused addresses are found in batch
  let shouldScanNewBatch = true;
  while (shouldScanNewBatch) {
    const newFetchedAddressesInfo =
      // eslint-disable-next-line no-await-in-loop
      await _scanNextBatch(
        fetchedAddressesInfo,
        cryptoAccount,
        addressType,
        highestUsedIndex + 1,
        scanSize,
        requestSize
      );

    const newHighestUsedIndex = _findNewHighestIndex(
      newFetchedAddressesInfo,
      highestUsedIndex,
      scanSize
    );

    shouldScanNewBatch = highestUsedIndex !== newHighestUsedIndex;
    highestUsedIndex = newHighestUsedIndex;
    fetchedAddressesInfo = newFetchedAddressesInfo;
  }

  // cutoff all the excess from `requestSize`
  return fetchedAddressesInfo
    .slice(0, highestUsedIndex + 1)
    .map((addressInfo) => addressInfo.address);
}

/** Scan a set of addresses and find the largest index that is used */
function _findNewHighestIndex(
  newFetchedAddressesInfo: Array<AddressInfo>,
  highestUsedIndex: number,
  scanSize: number,
): number {
  // get all addresses added in this scan
  const newlyAddedAddresses = newFetchedAddressesInfo.slice(
    highestUsedIndex + 1,
    highestUsedIndex + 1 + scanSize // note: not `requestSize`
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
  cryptoAccount: CryptoAccount,
  addressType: AddressType,
  fromIndex: number,
  scanSize: number,
  requestSize: number,
): Promise<Array<AddressInfo>> {
  let newFetchedAddressesInfo = fetchedAddressesInfo;

  /* Optimization: use `requestSize` to batch calls to crypto backend and to backend-service api
   * Allows us to make more than `scanSize` calls at a time
   *
   * Note: requestSize doesn't have to be a multiple of scanSize
   * since we batch based off total fetched and not total scanned
   */

  // check if already scanned in a previous batch
  if (fetchedAddressesInfo.length >= fromIndex + scanSize) {
    return fetchedAddressesInfo;
  }

  // create batch
  const addressesIndex = _.range(
    fetchedAddressesInfo.length,
    fetchedAddressesInfo.length + requestSize
  );

  // batch to cryptography backend
  const newAddresses = getResultOrFail(
    Wallet.generateAddresses(cryptoAccount, addressType, addressesIndex)
  );

  // batch to backend API
  const usedAddresses = await checkAddressesInUse(newAddresses);

  // Update metadata for new addresses
  newFetchedAddressesInfo = _addFetchedAddressesInfo(
    fetchedAddressesInfo,
    newAddresses,
    usedAddresses,
    addressesIndex
  );

  return newFetchedAddressesInfo;
}

/** Add in the metadata for new addresses that depend on existing wallet state */
function _addFetchedAddressesInfo(
  fetchedAddressesInfo: Array<AddressInfo>,
  newAddresses: Array<string>,
  usedAddresses: Array<string>,
  addressesIndex: Array<number>
): Array<AddressInfo> {
  const isUsedSet = new Set(usedAddresses);

  const newAddressesInfo = newAddresses.map((address, position) => ({
    address,
    isUsed: isUsedSet.has(address),
    index: addressesIndex[position]
  }));

  return fetchedAddressesInfo.concat(newAddressesInfo);
}
