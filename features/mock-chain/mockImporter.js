// @flow

import _ from 'lodash';
import BigNumber from 'bignumber.js';
import cryptoRandomString from 'crypto-random-string';
import type { AdaTxsState, Transaction, UTXO } from '../../app/api/ada/adaTypes';

// based on abandon x 14 + share
const genesisTransaction = '52929ce6f1ab83b439e65f6613bad9590bd264c0d6c4f910e36e2369bb987b35';
const genesisAddress = 'Ae2tdPwUPEZLs4HtbuNey7tK4hTKrwNwYtGqp7bDfCy2WdR3P6735W5Yfpe';
const genesisTxValue = 2000000000000000; // 2 billion ada

// based on abandon x14 + address
const genesisTxReceiver = 'Ae2tdPwUPEZ4YjgvykNpoFeYUxoyhNj2kg8KfKWN2FizsSpLUPv68MpTVDo';

type MockTx = {
  hash: string,
  ...$Exact<TransactionType>,
  block_num: ?string, // null if transaction pending/failed
  time: string, // timestamp with timezone
  last_update: string, // timestamp with timezone
  tx_state: AdaTxsState
}

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
    { id: genesisTransaction, index: 0 }
  ],
  outputs: [
    { address: genesisTxReceiver, value: genesisTxValue }
  ],
  block_num: '1',
  time: '2019-04-19T15:13:33.000Z',
  last_update: '2019-05-17T23:14:51.899Z',
  tx_state: 'Successful'
};
const distributorTx = {
  hash: cryptoRandomString({ length: 64 }),
  inputs: [
    { id: genesisTx.hash, index: 0 }
  ],
  outputs: [
    // small-single-tx
    { address: 'Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc', value: 20295 },
    // tx-big-input-wallet
    { address: 'Ae2tdPwUPEYx2dK1AMzRN1GqNd2eY7GCd7Z6aikMPJL3EkqqugoFQComQnV', value: 1234567898765 },
    // simple-pending-wallet
    { address: 'Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ', value: 1000000 },
    { address: 'Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ', value: 1000000 },
    // many-tx-wallet
    { address: 'Ae2tdPwUPEZ9uHfzhw3vXUrTFLowct5hMMHeNjfsrkQv5XSi5PhSs2yRNUb', value: 1000000 },
    { address: 'Ae2tdPwUPEZEXbmLnQ22Rxhv8a6hQ3C2673nkGsXKAgzqnuC1vqne9EtBkK', value: 1000000 },
    { address: 'Ae2tdPwUPEYwBZD5hPWCm3PUDYdMBfnLHsQmgUiexnkvDMTFCQ4gzRkgAEQ', value: 1000000 },
    { address: 'Ae2tdPwUPEYvzFpWJEGmSjLdz3DNY9WL5CbPjsouuM5M6YMsYWB1vsCS8j4', value: 1000000 },
    // failed-single-tx
    { address: 'Ae2tdPwUPEYw8ScZrAvKbxai1TzG7BGC4n8PoF9JzE1abgHc3gBfkkDNBNv', value: 1000000 },
  ],
  block_num: '1',
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
    { id: distributorTx.hash, index: 2 }
  ],
  outputs: [
    // simple-pending-wallet external
    { address: 'Ae2tdPwUPEYw3yJyPX1LWKXpuUjKAt57TLdR5fF61PRvUyswE3m7WrKNbrr', value: 1 },
  ],
  block_num: null,
  time: '2019-04-20T15:13:33.000Z',
  last_update: '2019-05-20T23:14:51.899Z',
  tx_state: 'Pending'
};
const pendingTx2 = {
  hash: 'fa6f2c82fb511d0cc9c12a540b5fac6e5a9b0f288f2d140f909f981279e16fbe',
  inputs: [
    { id: distributorTx.hash, index: 3 }
  ],
  outputs: [
    // simple-pending-wallet external
    { address: 'Ae2tdPwUPEYwEnNsuY9uMAphecEWipHKEy9g8yZCJTJm4zxV1sTrQfTxPVX', value: 1 },
  ],
  block_num: null,
  time: '2019-04-20T15:13:34.000Z',
  last_update: '2019-05-20T23:14:52.899Z',
  tx_state: 'Pending'
};

// ==================
//   many-tx-wallet
// ==================

const manyTx1 = {
  hash: cryptoRandomString({ length: 64 }),
  inputs: [
    { id: distributorTx.hash, index: 4 }
  ],
  outputs: [
    // many-tx-wallet external
    { address: 'Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr', value: 1 },
    // many-tx-wallet internal
    { address: 'Ae2tdPwUPEZ77uBBu8cMVxswVy1xfaMZR9wsUSwDNiB48MWqsVWfitHfUM9', value: 820000 },
  ],
  block_num: '100',
  time: '2019-04-20T15:15:33.000Z',
  last_update: '2019-05-20T23:16:51.899Z',
  tx_state: 'Successful'
};
const manyTx2 = {
  hash: '60493bf26e60b0b98f143647613be2ec1c6f50bd5fc15a14a2ff518f5fa36be0',
  inputs: [
    { id: distributorTx.hash, index: 5 }
  ],
  outputs: [
    // many-tx-wallet external
    { address: 'Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr', value: 1 },
    // many-tx-wallet internal
    { address: 'Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3', value: 820000 },
  ],
  block_num: '100',
  time: '2019-04-20T15:15:33.000Z',
  last_update: '2019-05-20T23:16:51.899Z',
  tx_state: 'Successful'
};
const manyTx3 = {
  hash: cryptoRandomString({ length: 64 }),
  inputs: [
    { id: distributorTx.hash, index: 6 }
  ],
  outputs: [
    // many-tx-wallet external
    { address: 'Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr', value: 1 },
    // many-tx-wallet internal
    { address: 'Ae2tdPwUPEZJZPsFg8w5bXA4brfu8peYy5prmrFiYPACb7DX64iiBY8WvHD', value: 820000 },
  ],
  block_num: '100',
  time: '2019-04-20T15:15:33.000Z',
  last_update: '2019-05-20T23:16:51.899Z',
  tx_state: 'Successful'
};
const manyTx4 = {
  hash: cryptoRandomString({ length: 64 }),
  inputs: [
    { id: distributorTx.hash, index: 7 }
  ],
  outputs: [
    // many-tx-wallet external
    { address: 'Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr', value: 1 },
    // many-tx-wallet internal
    { address: 'Ae2tdPwUPEZHG9AGUYWqFcM5zFn74qdEx2TqyZxuU68CQ33EBodWAVJ523w', value: 820000 },
  ],
  block_num: '100',
  time: '2019-04-20T15:15:33.000Z',
  last_update: '2019-05-20T23:16:51.899Z',
  tx_state: 'Successful'
};

const useChange = {
  hash: '0a073669845fea4ae83cd4418a0b4fd56610097a89601a816b5891f667e3496c',
  inputs: [
    { id: manyTx1.hash, index: 1 }
  ],
  outputs: [
    // many-tx-wallet external
    { address: 'Ae2tdPwUPEYzkKjrqPw1GHUty25Cj5fWrBVsWxiQYCxfoe2d9iLjTnt34Aj', value: 1 },
    // many-tx-wallet internal
    { address: 'Ae2tdPwUPEZ7VKG9jy6jJTxQCWNXoMeL2Airvzjv3dc3WCLhSBA7XbSMhKd', value: 650000 },
  ],
  block_num: '200',
  time: '2019-04-21T15:13:33.000Z',
  last_update: '2019-05-21T23:14:51.899Z',
  tx_state: 'Successful'
};

export const postLaunchSuccessfulTx = {
  hash: '350632adedd456cf607ed01a84f8c6c49d32f17e0e63447be7f7b69cb37ef446',
  inputs: [
    { id: manyTx2.hash, index: 1 }
  ],
  outputs: [
    // address not belonging to any wallet
    { address: 'Ae2tdPwUPEZCvDkc6R9oNE7Qh1yFLDyu4mpVbGhqUHkNsoVjd2UPiWGoVes', value: 500000 },
  ],
  block_num: '202',
  time: '2019-04-22T15:15:33.000Z',
  last_update: '2019-05-22T23:16:51.899Z',
  tx_state: 'Successful'
};

export const postLaunchPendingTx = {
  hash: '350632adedd456cf607ed01a84f8c6c49d32f17e0e63447be7f7b69cb37ef446',
  inputs: [
    { id: manyTx2.hash, index: 1 }
  ],
  outputs: [
    // address not belonging to any wallet
    { address: 'Ae2tdPwUPEZCvDkc6R9oNE7Qh1yFLDyu4mpVbGhqUHkNsoVjd2UPiWGoVes', value: 500000 },
  ],
  block_num: '202',
  time: '2019-04-22T15:15:33.000Z',
  last_update: '2019-05-22T23:16:51.899Z',
  tx_state: 'Pending'
};

// ====================
//   failed-single-tx
// ====================

const failedTx = {
  hash: 'fc6a5f086c0810de3048651ddd9075e6e5543bf59cdfe5e0c73bf1ed9dcec1ab',
  inputs: [
    { id: distributorTx.hash, index: 8 }
  ],
  outputs: [
    // address not belonging to any wallet
    { address: 'Ae2tdPwUPEZCvDkc6R9oNE7Qh1yFLDyu4mpVbGhqUHkNsoVjd2UPiWGoVes', value: 1 },
    // failed-single-tx internal
    { address: 'Ae2tdPwUPEZCqWsJkibw8BK2SgbmJ1rRG142Ru1CjSnRvKwDWbL4UYPN3eU', value: 820000 },
  ],
  block_num: null,
  time: '2019-04-21T15:13:33.000Z',
  last_update: '2019-05-21T23:14:51.899Z',
  tx_state: 'Failed'
};

// =================
//   Manage state
// =================

let transactions: Array<MockTx> = [];

export function addTransaction(tx: MockTx) {
  transactions.push(tx);
}

export function resetChain() {
  transactions = [];
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

// ====================
//   Helper functinos
// ====================

function nullifyIfZero(num: BigNumber) {
  if (num.isZero()) {
    return null;
  }
  return num;
}

function inputToAddress(input: TxoPointerType): string {
  if (input.id === genesisTransaction) {
    return genesisAddress;
  }

  const txHashMap = _.keyBy(transactions, transaction => transaction.hash);
  return txHashMap[input.id].outputs[input.index].address;
}

function inputoToValue(input: TxoPointerType): string {
  if (input.id === genesisTransaction) {
    return genesisTxValue.toString();
  }

  const txHashMap = _.keyBy(transactions, transaction => transaction.hash);
  return txHashMap[input.id].outputs[input.index].value.toString();
}

// =================
//   Special UTXOs
// =================

const redemptionUtxoForAddresses = {
  Ae2tdPwUPEZ2XP4BGUHeMDRohtbLMm8MgwwwW86a2Mozyh3oMhza2f1H6Lz: [{
    utxo_id: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b041',
    tx_hash: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b04',
    tx_index: 1,
    receiver: 'Ae2tdPwUPEZ2XP4BGUHeMDRohtbLMm8MgwwwW86a2Mozyh3oMhza2f1H6Lz',
    amount: '1000'
  }],
  Ae2tdPwUPEZ8dx9F8nGyRmLCQEHjSjbL8pBVwPsiL5tiCLqZiYD5poMCUwJ: [{
    utxo_id: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b041',
    tx_hash: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b04',
    tx_index: 1,
    receiver: 'Ae2tdPwUPEZ8dx9F8nGyRmLCQEHjSjbL8pBVwPsiL5tiCLqZiYD5poMCUwJ',
    amount: '1000'
  }],
  Ae2tdPwUPEZ2UnSp2Px3wqZGJs3AUn5vcRQCTpPrcxGBWkAnAvB9JNNEtAb: [{
    utxo_id: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b041',
    tx_hash: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b04',
    tx_index: 1,
    receiver: 'Ae2tdPwUPEZ2UnSp2Px3wqZGJs3AUn5vcRQCTpPrcxGBWkAnAvB9JNNEtAb',
    amount: '1000'
  }],
  Ae2tdPwUPEZFS38pQd5nbC5vqyicSHSgRkjr5p3mFxRrVgVn2fMKSxDR1qY: [{
    utxo_id: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b041',
    tx_hash: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b04',
    tx_index: 1,
    receiver: 'Ae2tdPwUPEZFS38pQd5nbC5vqyicSHSgRkjr5p3mFxRrVgVn2fMKSxDR1qY',
    amount: '1000'
  }],
};

const daedalusUtxoForAddresses = {
  // eslint-disable-next-line max-len
  DdzFFzCqrhstBgE23pfNLvukYhpTPUKgZsXWLN5GsawqFZd4Fq3aVuGEHk11LhfMfmfBCFCBGrdZHVExjiB4FY5Jkjj1EYcqfTTNcczb: [{
    utxo_id: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b041',
    tx_hash: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b04',
    tx_index: 1,
    receiver: 'DdzFFzCqrhstBgE23pfNLvukYhpTPUKgZsXWLN5GsawqFZd4Fq3aVuGEHk11LhfMfmfBCFCBGrdZHVExjiB4FY5Jkjj1EYcqfTTNcczb',
    amount: '500000'
  }],
  // eslint-disable-next-line max-len
  DdzFFzCqrht74dr7DYmiyCobGFQcfLCsHJCCM6nEBTztrsEk5kwv48EWKVMFU9pswAkLX9CUs4yVhVxqZ7xCVDX1TdatFwX5W39cohvm: [{
    utxo_id: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b041',
    tx_hash: 'd2f5bc49b3688bf11d09145583a1b337c288dd8384c7495b74fedb3aeb528b04',
    tx_index: 1,
    receiver: 'DdzFFzCqrht74dr7DYmiyCobGFQcfLCsHJCCM6nEBTztrsEk5kwv48EWKVMFU9pswAkLX9CUs4yVhVxqZ7xCVDX1TdatFwX5W39cohvm',
    amount: '500000'
  }],
};

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

// =====================
//   Recalculate state
// =====================

function calcUtxoMap(): { [key: string]: $Exact<UTXO> }  {
  const utxoMap = {};
  for (const tx of transactions) {
    for (let j = 0; j < tx.inputs.length; j++) {
      const input = tx.inputs[j];
      if (input.id === genesisTransaction) {
        continue;
      }

      const key = JSON.stringify(input);
      delete utxoMap[key];
    }
    for (let j = 0; j < tx.outputs.length; j++) {
      const key = JSON.stringify({
        id: tx.hash,
        index: j
      });
      utxoMap[key] = {
        utxo_id: tx.hash + j,
        tx_hash: tx.hash,
        tx_index: j,
        receiver: tx.outputs[j].address,
        amount: tx.outputs[j].value.toString(),
      };
    }
  }
  return utxoMap;
}

function history(): Array<Transaction> {
  const bestBlockNum = Math.max(...transactions.map(
    tx => (tx.block_num ? Number(tx.block_num) : 0)
  )).toString();

  return transactions.map(tx => ({
    hash: tx.hash,
    inputs_address: tx.inputs.map(input => inputToAddress(input)),
    inputs_amount: tx.inputs.map(input => inputoToValue(input)),
    outputs_address: tx.outputs.map(output => output.address),
    outputs_amount: tx.outputs.map(output => output.value.toString()),
    block_num: tx.block_num,
    time: tx.time,
    best_block_num: bestBlockNum,
    last_update: tx.last_update,
    tx_state: tx.tx_state
  }));
}


function utxoForAddresses(): { [key: string]: Array<UTXO> } {
  const utxoMap = calcUtxoMap();
  const utxos = Object.keys(utxoMap).map(key => utxoMap[key]);
  const regularUtxoMapping = _.groupBy(utxos, utxo => utxo.receiver);
  return Object.assign(
    regularUtxoMapping,
    redemptionUtxoForAddresses,
    daedalusUtxoForAddresses
  );
}
function utxoSumForAddresses(): { [key: string]: ?string } {
  const result = _.mapValues(
    utxoForAddresses(),
    arr => nullifyIfZero(arr
      .reduce(
        (sum, utxo) => sum.plus(new BigNumber(utxo.amount)),
        new BigNumber(0),
      ))
  );
  return result;
}

function usedAddresses(): Set<string> {
  const set = new Set<string>();
  const txHashMap = _.keyBy(transactions, transaction => transaction.hash);

  for (const tx of transactions) {
    for (const input of tx.inputs) {
      if (input.id === genesisTransaction) {
        continue;
      }
      set.add(txHashMap[input.id].outputs[input.index].address);
    }
  }
  return set;
}

function getApiStatus(): boolean {
  return apiStatuses.slice(-1)[0].status;
}

export default {
  utxoForAddresses,
  utxoSumForAddresses,
  usedAddresses,
  getApiStatus,
  history
};
