// @flow

import BigNumber from 'bignumber.js';
import type {
  AddressUtxoRequest, AddressUtxoResponse,
  TxBodiesRequest, TxBodiesResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  SignedRequest, SignedResponse,
  FilterUsedRequest, FilterUsedResponse,
  ServerStatusResponse,
  AddressUtxoFunc,
  FilterFunc,
  HistoryFunc,
  TxBodiesFunc,
  UtxoSumFunc,
} from './types';

import type {
  Transaction
} from '../../adaTypes';

import type { IFetcher } from './IFetcher';

import _ from 'lodash';
import {
  CheckAdressesInUseApiError,
  GetAllUTXOsForAddressesError,
  GetTxsBodiesForUTXOsError,
  GetUtxosSumsForAddressesApiError,
  GetTxHistoryForAddressesApiError,
} from '../../errors';
import {
  Logger,
  stringifyError
} from '../../../../utils/logging';

import type { ConfigType } from '../../../../../config/config-types';
import config from '../../../../config';

declare var CONFIG: ConfigType;
const addressesLimit = CONFIG.app.addressRequestSize;
const transactionsLimit: number = config.wallets.TRANSACTION_REQUEST_SIZE;

/**
 * Makes calls to Yoroi backend service
 * https://github.com/Emurgo/yoroi-backend-service/
 */
export class BatchedFetcher implements IFetcher {

  baseFetcher: IFetcher;

  constructor(baseFetcher: IFetcher) {
    this.baseFetcher = baseFetcher;
  }

  getUTXOsForAddresses = (body: AddressUtxoRequest): Promise<AddressUtxoResponse> => (
    batchUTXOsForAddresses(this.baseFetcher.getUTXOsForAddresses)(body)
  )

  getTxsBodiesForUTXOs = (body: TxBodiesRequest): Promise<TxBodiesResponse> => (
    batchTxsBodiesForInputs(this.baseFetcher.getTxsBodiesForUTXOs)(body)
  )

  getUTXOsSumsForAddresses = (body: UtxoSumRequest): Promise<UtxoSumResponse> => (
    batchGetUTXOsSumsForAddresses(this.baseFetcher.getUTXOsSumsForAddresses)(body)
  )

  getTransactionsHistoryForAddresses = (body: HistoryRequest): Promise<HistoryResponse> => (
    batchGetTransactionsHistoryForAddresses(
      this.baseFetcher.getTransactionsHistoryForAddresses
    )(body)
  )

  sendTx = (body: SignedRequest): Promise<SignedResponse> => (
    // We don't batch transaction sending (it's just a single requeset)
    // TODO: Should we support batching a list of transactions?
    this.baseFetcher.sendTx(body)
  )

  checkAddressesInUse = (body: FilterUsedRequest): Promise<FilterUsedResponse> => (
    batchCheckAddressesInUse(this.baseFetcher.checkAddressesInUse)(body)
  )

  checkServerStatus = (): Promise<ServerStatusResponse> => (
    this.baseFetcher.checkServerStatus()
  )

  getCoinPrice = (body: CoinPriceRequest): Promise<CoinPriceResponse> => (
    this.baseFetcher.getCoinPrice(body)
  )
}

/** Sum up the UTXO for a list of addresses by batching backend requests */
function batchUTXOsForAddresses(
  getUTXOsForAddresses: AddressUtxoFunc,
): AddressUtxoFunc {
  return async function (body) {
    try {
      // split up all addresses into chunks of equal size
      const groupsOfAddresses: Array<Array<string>>
        = _.chunk(body.addresses, CONFIG.app.addressRequestSize);

      // convert chunks into list of Promises that call the backend-service
      const promises = groupsOfAddresses
        .map(groupOfAddresses => getUTXOsForAddresses(
          { addresses: groupOfAddresses }
        ));

      // Sum up all the utxo
      return Promise.all(promises)
        .then(groupsOfUTXOs => (
          groupsOfUTXOs.reduce((acc, groupOfUTXOs) => acc.concat(groupOfUTXOs), [])
        ));
    } catch (getUtxosError) {
      Logger.error('batchedFetcher:::batchUTXOsForAddresses error: ' +
        stringifyError(getUtxosError));
      throw new GetAllUTXOsForAddressesError();
    }
  };
}

/** List of Body hashes for a list of utxos by batching backend requests */
function batchTxsBodiesForInputs(
  getTxsBodiesForUTXOs: TxBodiesFunc,
): TxBodiesFunc {
  return async function (body) {
    try {
      // split up all txs into chunks of equal size
      const groupsOfTxsHashes = _.chunk(body.txsHashes, CONFIG.app.txsBodiesRequestSize);

      // convert chunks into list of Promises that call the backend-service
      const promises = groupsOfTxsHashes
        .map(groupOfTxsHashes => getTxsBodiesForUTXOs({ txsHashes: groupOfTxsHashes }));

      // Sum up all the utxo
      return Promise.all(promises)
        .then(groupsOfTxBodies => {
          const bodies = groupsOfTxBodies
            .reduce((acc, groupOfTxBodies) => Object.assign(acc, groupOfTxBodies), {});
          if (body.txsHashes.length !== Object.keys(bodies).length) {
            throw new GetTxsBodiesForUTXOsError();
          }
          return bodies;
        });
    } catch (getTxBodiesError) {
      Logger.error('batchedFetcher::batchTxsBodiesForInputs error: ' +
        stringifyError(getTxBodiesError));
      throw new GetTxsBodiesForUTXOsError();
    }
  };
}

export function batchGetUTXOsSumsForAddresses(
  getUTXOsSumsForAddresses: UtxoSumFunc,
): UtxoSumFunc {
  return async function (body) {
    try {
      // batch all addresses into chunks for API
      const groupsOfAddresses = _.chunk(body.addresses, addressesLimit);
      const promises =
        groupsOfAddresses.map(groupOfAddresses => getUTXOsSumsForAddresses(
          { addresses: groupOfAddresses }
        ));
      const partialAmounts: Array<UtxoSumResponse> = await Promise.all(promises);

      // sum all chunks together
      const sum: BigNumber = partialAmounts.reduce(
        (acc: BigNumber, partialAmount) => (
          acc.plus(
            partialAmount.sum // undefined if no addresses in the batch has any balance in them
              ? new BigNumber(partialAmount.sum)
              : new BigNumber(0)
          )
        ),
        new BigNumber(0)
      );
      if (sum.isZero()) {
        return { sum: null };
      }
      return { sum: sum.toString() };
    } catch (error) {
      Logger.error('batchedFetcher::batchGetUTXOsSumsForAddresses error: ' + stringifyError(error));
      throw new GetUtxosSumsForAddressesApiError();
    }
  };
}

export function batchGetTransactionsHistoryForAddresses(
  getTransactionsHistoryForAddresses: HistoryFunc,
): HistoryFunc {
  return async function (body) {
    try {
      // we need two levels of batching: addresses and then transactions
      return await _batchHistoryByAddresses(
        body.addresses,
        async (adddresses) => (
          await _batchHistoryByTransactiona(
            [],
            adddresses,
            body.dateFrom,
            getTransactionsHistoryForAddresses,
          )
        )
      );
    } catch (error) {
      Logger.error('batchedFetcher::batchGetTransactionsHistoryForAddresses error: ' + stringifyError(error));
      throw new GetTxHistoryForAddressesApiError();
    }
  };
}

async function _batchHistoryByAddresses(
  addresses: Array<string>,
  apiCall: (Array<string>) => Promise<HistoryResponse>,
): Promise<Array<Transaction>> {
  const groupsOfAddresses = _.chunk(addresses, addressesLimit);
  const groupedTxsPromises = groupsOfAddresses.map(apiCall);
  const groupedTxs = await Promise.all(groupedTxsPromises);
  return groupedTxs.reduce((accum, chunkTxs) => accum.concat(chunkTxs), []);
}

async function _batchHistoryByTransactiona(
  previousTxs: Array<Transaction>,
  groupOfAddresses: Array<string>,
  dateFrom: Date,
  getTransactionsHistoryForAddresses: HistoryFunc,
): Promise<HistoryResponse> {

  // Move cutoff date forward to make progress on recursive calls
  const updatedDateFrom = previousTxs.length > 0
    ? new Date(previousTxs[previousTxs.length - 1].last_update)
    : dateFrom;

  // Get historic transactions from backend API
  const history = await getTransactionsHistoryForAddresses({
    addresses: groupOfAddresses,
    dateFrom: updatedDateFrom
  });

  // No more history left to fetch
  if (history.length === 0) {
    return previousTxs;
  }
  // map database format for historic transactions to actual AdaTransaction format
  const transactions = previousTxs.concat(history);

  // If we reached the API limit, call API again to get more results
  if (history.length === transactionsLimit) {
    return await _batchHistoryByTransactiona(
      transactions,
      groupOfAddresses,
      dateFrom,
      getTransactionsHistoryForAddresses,
    );
  }

  return transactions;
}

export function batchCheckAddressesInUse(
  checkAddressesInUse: FilterFunc,
): FilterFunc {
  return async function (body) {
    try {
      const groupsOfAddresses = _.chunk(body.addresses, addressesLimit);
      const groupedAddrPromises = groupsOfAddresses.map(
        addr => checkAddressesInUse({ addresses: addr })
      );
      const groupedAddresses = await Promise.all(groupedAddrPromises);
      return groupedAddresses.reduce((accum, chunkAddrs) => accum.concat(chunkAddrs), []);
    } catch (error) {
      Logger.error('batchedFetcher::batchCheckAddressesInUse error: ' + stringifyError(error));
      throw new CheckAdressesInUseApiError();
    }
  };
}
