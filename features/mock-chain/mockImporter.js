// @flow

import type {
  AddressUtxoRequest,
  AddressUtxoResponse,
  AddressUtxoFunc,
} from '../../app/api/ada/lib/state-fetch/types';
import cryptoRandomString from 'crypto-random-string';
import type { RemoteTransaction } from '../../app/api/ada/adaTypes';
import {
  genGetTransactionsHistoryForAddresses,
  genGetBestBlock,
  genCheckAddressesInUse,
  genUtxoForAddresses,
  genUtxoSumForAddresses,
} from '../../app/api/ada/lib/storage/bridge/tests/mockNetwork';

// based on abandon x 14 + share
const genesisTransaction = '52929ce6f1ab83b439e65f6613bad9590bd264c0d6c4f910e36e2369bb987b35';
const genesisAddress = 'Ae2tdPwUPEZLs4HtbuNey7tK4hTKrwNwYtGqp7bDfCy2WdR3P6735W5Yfpe';
const genesisTxValue = 2000000000000000; // 2 billion ada

// based on abandon x14 + address
const genesisTxReceiver = 'Ae2tdPwUPEZ4YjgvykNpoFeYUxoyhNj2kg8KfKWN2FizsSpLUPv68MpTVDo';

type MockTx = RemoteTransaction;

type ServerStatus = {
  id: number,
  status: boolean,
  time: string // timestamp with timezone
}

/**
 * To simplify, our genesis is a single address which gives all its ada to a "distributor"
 * The distributor gives ADA to a bunch of addresses to setup the tests
 *
 * You can generate more data for these tests using the Cardano-Wallet WASM library
 */

const genesisTx = {
  hash: cryptoRandomString({ length: 64 }),
  inputs: [
    {
      address: genesisAddress,
      id: genesisTransaction + '0',
      amount: genesisTxValue.toString(),
      txHash: '',
      index: 0,
    }
  ],
  outputs: [
    { address: genesisTxReceiver, amount: genesisTxValue.toString() }
  ],
  height: 1,
  epoch: 0,
  slot: 1,
  tx_ordinal: 0,
  block_hash: '1',
  time: '2019-04-19T15:13:33.000Z',
  last_update: '2019-05-17T23:14:51.899Z',
  tx_state: 'Successful'
};
const distributorTx = {
  hash: cryptoRandomString({ length: 64 }),
  inputs: [
    {
      address: genesisTxReceiver,
      txHash: genesisTx.hash,
      id: genesisTx.hash + '0',
      index: 0,
      amount: genesisTxValue.toString()
    }
  ],
  outputs: [
    // small-single-tx
    { address: 'Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc', amount: '20295' },
    // tx-big-input-wallet
    { address: 'Ae2tdPwUPEYx2dK1AMzRN1GqNd2eY7GCd7Z6aikMPJL3EkqqugoFQComQnV', amount: '1234567898765' },
    // simple-pending-wallet
    { address: 'Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ', amount: '1000000' },
    { address: 'Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ', amount: '1000000' },
    // many-tx-wallet
    { address: 'Ae2tdPwUPEZ9uHfzhw3vXUrTFLowct5hMMHeNjfsrkQv5XSi5PhSs2yRNUb', amount: '1000000' },
    { address: 'Ae2tdPwUPEZEXbmLnQ22Rxhv8a6hQ3C2673nkGsXKAgzqnuC1vqne9EtBkK', amount: '1000000' },
    { address: 'Ae2tdPwUPEYwBZD5hPWCm3PUDYdMBfnLHsQmgUiexnkvDMTFCQ4gzRkgAEQ', amount: '1000000' },
    { address: 'Ae2tdPwUPEYvzFpWJEGmSjLdz3DNY9WL5CbPjsouuM5M6YMsYWB1vsCS8j4', amount: '1000000' },
    // failed-single-tx
    { address: 'Ae2tdPwUPEYw8ScZrAvKbxai1TzG7BGC4n8PoF9JzE1abgHc3gBfkkDNBNv', amount: '1000000' },
  ],
  height: 1,
  epoch: 0,
  slot: 1,
  tx_ordinal: 1,
  block_hash: '1',
  time: '2019-04-19T15:13:33.000Z',
  last_update: '2019-05-17T23:14:51.899Z',
  tx_state: 'Successful'
};

// =========================
//   simple-pending-wallet
// =========================

const pendingTx1 = {
  hash: cryptoRandomString({ length: 64 }),
  inputs: [
    {
      address: 'Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ',
      txHash: distributorTx.hash,
      id: distributorTx.hash + '2',
      index: 2,
      amount: '1000000'
    }
  ],
  outputs: [
    // simple-pending-wallet external
    { address: 'Ae2tdPwUPEYw3yJyPX1LWKXpuUjKAt57TLdR5fF61PRvUyswE3m7WrKNbrr', amount: '1' },
  ],
  height: null,
  block_hash: null,
  tx_ordinal: null,
  time: null,
  epoch: null,
  slot: null,
  last_update: '2019-05-20T23:14:51.899Z',
  tx_state: 'Pending'
};
const pendingTx2 = {
  hash: 'fa6f2c82fb511d0cc9c12a540b5fac6e5a9b0f288f2d140f909f981279e16fbe',
  inputs: [
    {
      // simple-pending-wallet external
      address: 'Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ',
      txHash: distributorTx.hash,
      id: distributorTx.hash + '3',
      index: 3,
      amount: '1000000'
    }
  ],
  outputs: [
    // simple-pending-wallet external
    { address: 'Ae2tdPwUPEYwEnNsuY9uMAphecEWipHKEy9g8yZCJTJm4zxV1sTrQfTxPVX', amount: '1' },
  ],
  height: null,
  block_hash: null,
  tx_ordinal: null,
  time: null,
  epoch: null,
  slot: null,
  last_update: '2019-05-20T23:14:52.899Z',
  tx_state: 'Pending'
};

// ==================
//   many-tx-wallet
// ==================

const manyTx1 = {
  hash: cryptoRandomString({ length: 64 }),
  inputs: [
    {
      address: 'Ae2tdPwUPEZ9uHfzhw3vXUrTFLowct5hMMHeNjfsrkQv5XSi5PhSs2yRNUb',
      txHash: distributorTx.hash,
      id: distributorTx.hash + '4',
      index: 4,
      amount: '1000000'
    }
  ],
  outputs: [
    // many-tx-wallet external
    { address: 'Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr', amount: '1' },
    // many-tx-wallet internal
    { address: 'Ae2tdPwUPEZ77uBBu8cMVxswVy1xfaMZR9wsUSwDNiB48MWqsVWfitHfUM9', amount: '820000' },
  ],
  height: 100,
  block_hash: '100',
  tx_ordinal: 0,
  time: '2019-04-20T15:15:33.000Z',
  epoch: 0,
  slot: 100,
  last_update: '2019-05-20T23:16:51.899Z',
  tx_state: 'Successful'
};
const manyTx2 = {
  hash: '60493bf26e60b0b98f143647613be2ec1c6f50bd5fc15a14a2ff518f5fa36be0',
  inputs: [
    {
      address: 'Ae2tdPwUPEZEXbmLnQ22Rxhv8a6hQ3C2673nkGsXKAgzqnuC1vqne9EtBkK',
      txHash: distributorTx.hash,
      id: distributorTx.hash + '5',
      index: 5,
      amount: '1000000'
    }
  ],
  outputs: [
    // many-tx-wallet external
    { address: 'Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr', amount: '1' },
    // many-tx-wallet internal
    { address: 'Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3', amount: '820000' },
  ],
  height: 100,
  block_hash: '100',
  tx_ordinal: 0,
  time: '2019-04-20T15:15:33.000Z',
  epoch: 0,
  slot: 100,
  last_update: '2019-05-20T23:16:51.899Z',
  tx_state: 'Successful'
};
const manyTx3 = {
  hash: cryptoRandomString({ length: 64 }),
  inputs: [
    {
      address: 'Ae2tdPwUPEYwBZD5hPWCm3PUDYdMBfnLHsQmgUiexnkvDMTFCQ4gzRkgAEQ',
      txHash: distributorTx.hash,
      id: distributorTx.hash + '6',
      index: 6,
      amount: '1000000'
    }
  ],
  outputs: [
    // many-tx-wallet external
    { address: 'Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr', amount: '1' },
    // many-tx-wallet internal
    { address: 'Ae2tdPwUPEZJZPsFg8w5bXA4brfu8peYy5prmrFiYPACb7DX64iiBY8WvHD', amount: '820000' },
  ],
  height: 100,
  block_hash: '100',
  tx_ordinal: 1,
  time: '2019-04-20T15:15:33.000Z',
  epoch: 0,
  slot: 100,
  last_update: '2019-05-20T23:16:51.899Z',
  tx_state: 'Successful'
};
const manyTx4 = {
  hash: cryptoRandomString({ length: 64 }),
  inputs: [
    {
      address: 'Ae2tdPwUPEYvzFpWJEGmSjLdz3DNY9WL5CbPjsouuM5M6YMsYWB1vsCS8j4',
      txHash: distributorTx.hash,
      id: distributorTx.hash + '7',
      index: 7,
      amount: '1000000'
    }
  ],
  outputs: [
    // many-tx-wallet external
    { address: 'Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr', amount: '1' },
    // many-tx-wallet internal
    { address: 'Ae2tdPwUPEZHG9AGUYWqFcM5zFn74qdEx2TqyZxuU68CQ33EBodWAVJ523w', amount: '820000' },
  ],
  height: 100,
  block_hash: '100',
  tx_ordinal: 2,
  time: '2019-04-20T15:15:33.000Z',
  epoch: 0,
  slot: 100,
  last_update: '2019-05-20T23:16:51.899Z',
  tx_state: 'Successful'
};

const useChange = {
  hash: '0a073669845fea4ae83cd4418a0b4fd56610097a89601a816b5891f667e3496c',
  inputs: [
    {
      address: 'Ae2tdPwUPEZ77uBBu8cMVxswVy1xfaMZR9wsUSwDNiB48MWqsVWfitHfUM9',
      txHash: manyTx1.hash,
      id: manyTx1.hash + '1',
      index: 1,
      amount: '820000'
    }
  ],
  outputs: [
    // many-tx-wallet external (index 30)
    { address: 'Ae2tdPwUPEYzkKjrqPw1GHUty25Cj5fWrBVsWxiQYCxfoe2d9iLjTnt34Aj', amount: '1' },
    // many-tx-wallet internal
    { address: 'Ae2tdPwUPEZ7VKG9jy6jJTxQCWNXoMeL2Airvzjv3dc3WCLhSBA7XbSMhKd', amount: '650000' },
  ],
  height: 200,
  block_hash: '200',
  tx_ordinal: 0,
  time: '2019-04-21T15:13:33.000Z',
  epoch: 0,
  slot: 200,
  last_update: '2019-05-21T23:14:51.899Z',
  tx_state: 'Successful'
};

export const postLaunchSuccessfulTx = {
  hash: '350632adedd456cf607ed01a84f8c6c49d32f17e0e63447be7f7b69cb37ef446',
  inputs: [
    {
      // many-tx-wallet internal
      address: 'Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3',
      txHash: manyTx2.hash,
      id: manyTx2.hash + '1',
      index: 1,
      amount: '820000'
    }
  ],
  outputs: [
    // address not belonging to any wallet
    { address: 'Ae2tdPwUPEZCvDkc6R9oNE7Qh1yFLDyu4mpVbGhqUHkNsoVjd2UPiWGoVes', amount: '500000' },
  ],
  height: 202,
  block_hash: '202',
  tx_ordinal: 0,
  time: '2019-04-22T15:15:33.000Z',
  epoch: 0,
  slot: 202,
  last_update: '2019-05-22T23:16:51.899Z',
  tx_state: 'Successful'
};

export const postLaunchPendingTx = {
  hash: '350632adedd456cf607ed01a84f8c6c49d32f17e0e63447be7f7b69cb37ef446',
  inputs: [
    {
      // many-tx-wallet internal
      address: 'Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3',
      txHash: manyTx2.hash,
      id: manyTx2.hash + '1',
      index: 1,
      amount: '820000'
    }
  ],
  outputs: [
    // address not belonging to any wallet
    { address: 'Ae2tdPwUPEZCvDkc6R9oNE7Qh1yFLDyu4mpVbGhqUHkNsoVjd2UPiWGoVes', amount: '500000' },
  ],
  height: 202,
  block_hash: '202',
  tx_ordinal: 1,
  time: '2019-04-22T15:15:33.000Z',
  epoch: 0,
  slot: 202,
  last_update: '2019-05-22T23:16:51.899Z',
  tx_state: 'Pending'
};

// ====================
//   failed-single-tx
// ====================

const failedTx = {
  hash: 'fc6a5f086c0810de3048651ddd9075e6e5543bf59cdfe5e0c73bf1ed9dcec1ab',
  inputs: [
    {
      address: 'Ae2tdPwUPEYw8ScZrAvKbxai1TzG7BGC4n8PoF9JzE1abgHc3gBfkkDNBNv',
      txHash: distributorTx.hash,
      id: distributorTx.hash + '8',
      index: 8,
      amount: '1000000'
    }
  ],
  outputs: [
    // address not belonging to any wallet
    { address: 'Ae2tdPwUPEZCvDkc6R9oNE7Qh1yFLDyu4mpVbGhqUHkNsoVjd2UPiWGoVes', amount: '1' },
    // failed-single-tx internal
    { address: 'Ae2tdPwUPEZCqWsJkibw8BK2SgbmJ1rRG142Ru1CjSnRvKwDWbL4UYPN3eU', amount: '820000' },
  ],
  height: null,
  block_hash: null,
  tx_ordinal: null,
  time: null,
  epoch: null,
  slot: null,
  last_update: '2019-05-21T23:14:51.899Z',
  tx_state: 'Failed'
};

// =================
//   Manage state
// =================

const transactions: Array<MockTx> = [];

export function addTransaction(tx: MockTx) {
  transactions.push(tx);
}

export function resetChain() {
  // want to keep reference the same
  while (transactions.length > 0) {
    transactions.pop();
  }

  // test setup
  addTransaction(genesisTx);
  addTransaction(distributorTx);
  // test setup
  addTransaction(genesisTx);
  addTransaction(distributorTx);
  // simple-pending-wallet
  addTransaction(pendingTx1);
  addTransaction(pendingTx2);
  // many-tx-wallet
  addTransaction(manyTx1);
  addTransaction(manyTx2);
  addTransaction(manyTx3);
  addTransaction(manyTx4);
  addTransaction(useChange);
  // failed-single-tx
  addTransaction(failedTx);
}

// =================
//   Special UTXOs
// =================

// TODO: this hack should probably be removed and replaced with proper trnansactions
export const utxoForAddressesHook = [
  {
    utxo_id: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b041',
    tx_hash: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b04',
    tx_index: 0,
    receiver: 'DdzFFzCqrhstBgE23pfNLvukYhpTPUKgZsXWLN5GsawqFZd4Fq3aVuGEHk11LhfMfmfBCFCBGrdZHVExjiB4FY5Jkjj1EYcqfTTNcczb',
    amount: '500000'
  },
  {
    utxo_id: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b041',
    tx_hash: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b04',
    tx_index: 1,
    receiver: 'DdzFFzCqrht74dr7DYmiyCobGFQcfLCsHJCCM6nEBTztrsEk5kwv48EWKVMFU9pswAkLX9CUs4yVhVxqZ7xCVDX1TdatFwX5W39cohvm',
    amount: '500000'
  },
];

// =========================
//   server-status
// =========================
const apiStatuses: Array<ServerStatus> = [];

const addServerStatus  = (serverStatus: ServerStatus) => apiStatuses.push(serverStatus);

const initialServerOk: ServerStatus = {
  id: 1,
  status: true,
  time: '2019-01-01T15:13:33.000Z'
};

addServerStatus(initialServerOk);

export function serverIssue() {
  addServerStatus({
    id: 2,
    status: false,
    time: '2019-01-02T15:13:33.000Z'
  });
}

export function serverFixed() {
  addServerStatus({
    id: 3,
    status: true,
    time: '2019-01-03T15:13:33.000Z'
  });
}

function getApiStatus(): boolean {
  return apiStatuses.slice(-1)[0].status;
}


const usedAddresses = genCheckAddressesInUse(transactions);
const history = genGetTransactionsHistoryForAddresses(transactions);
const getBestBlock = genGetBestBlock(transactions);
const baseUtxoForAddresses = genUtxoForAddresses(
  history,
  getBestBlock,
  genesisTransaction
);
// TODO
const genUtxoForAddressesWithHook = (): AddressUtxoFunc => {
  return async (request: AddressUtxoRequest): Promise<AddressUtxoResponse> => {
    const result = await baseUtxoForAddresses(request);
    // TODO: fails since these UTXO may not belong to you
    return result.concat(utxoForAddressesHook);
  };
};
const utxoForAddresses = baseUtxoForAddresses;
const utxoSumForAddresses = genUtxoSumForAddresses(utxoForAddresses);

export default {
  utxoForAddresses,
  utxoSumForAddresses,
  usedAddresses,
  getApiStatus,
  history,
  getBestBlock,
};
