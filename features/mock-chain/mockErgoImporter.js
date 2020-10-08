// @flow

import type {
  RemoteErgoTransaction,
  SignedRequest, SignedResponse,
  UtxoSumFunc,
  AddressUtxoFunc,
  HistoryFunc,
  BestBlockFunc,
} from '../../app/api/ergo/lib/state-fetch/types';
import { Address as ErgoAddress } from '@coinbarn/ergo-ts';
import {
  getErgoAddress,
  genGetTransactionsHistoryForAddresses,
  genGetBestBlock,
  genCheckAddressesInUse,
  genUtxoForAddresses,
  genUtxoSumForAddresses,
  toRemoteErgoTx,
} from '../../app/api/ergo/lib/state-fetch/mockNetwork';
import { testWallets } from './TestWallets';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
} from '../../app/config/numbersConfig';
import type {
  FilterFunc,
} from '../../app/api/common/lib/state-fetch/currencySpecificTypes';
import { networks } from '../../app/api/ada/lib/storage/database/prepackaged/networks';

// based on abandon x 14 + share
const genesisTransaction = '7d4b41a1256f93989aa7e1782989dbbb9ec222c3f6b98e216b676c589b5ecece';
const genesisAddress = '9eXpzdMjPP9oNrhMB6na4LTZMWBJZNp71NVVefqdQ6kRwrqfZHe';
const genesisTxValue = 200000_000000000; // 200K ERG

// based on abandon x14 + address
const genesisTxReceiver = '9emv7LAtw7U6xMs4JrJP8NTPvwQjNRaSWpgSTGEM6947fFofBWd';

/**
 * To simplify, our genesis is a single address which gives all its ada to a "distributor"
 * The distributor gives ERGO to a bunch of addresses to setup the tests
 */
export const generateTransaction = (): {|
  genesisTx: RemoteErgoTransaction,
  distributorTx: RemoteErgoTransaction,
|} => {
  const genesisTx = (() => {
    const hash = genesisTransaction;
    const height = 1;

    const address = genesisTxReceiver;
    return {
      hash,
      inputs: [{
        address: genesisAddress,
        id: '33a35e15ae1a83fa188674a2bd53007b07e119a0eaaf40b890b2081c2864f12a',
        outputTransactionId: '', // no tx created this since it's the genesis
        index: 0,
        outputIndex: 0, // no tx created this since it's the genesis
        spendingProof: '', // no need just for tests I think
        transactionId: hash,
        value: genesisTxValue,
      }],
      dataInputs: [],
      outputs: [{
        additionalRegisters: Object.freeze({}),
        address,
        assets: [],
        creationHeight: height,
        ergoTree: ErgoAddress.fromBase58(address).ergoTree,
        id: '33a35e15ae1a83fa188673a2bd53007b07e119a0eaaf40b890b2081c2864f12a',
        txId: hash,
        index: 0,
        mainChain: true,
        spentTransactionId: null,
        value: genesisTxValue,
      }],
      block_num: height,
      tx_ordinal: 0,
      block_hash: '1',
      time: '2019-04-19T15:13:33.000Z',
      tx_state: 'Successful'
    };
  })();
  const distributorTx = (() => {
    const hash = 'b713cc0d63106c3806b5a7077cc37a294fcca0e479f26aac64e51e04ae808d75';
    const height = 1;
    // 9erND2FjDWVTgT2TWRZ9dCLueKAWjoskx6KqRmZbtvtRXEgCrja
    const address = getErgoAddress(
      testWallets['ergo-simple-wallet'].mnemonic,
      [
        WalletTypePurpose.BIP44,
        CoinTypes.ERGO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
        0
      ]
    );
    return {
      hash,
      inputs: [{
        address: genesisTxReceiver,
        id: '43a35e15ae2a83fa188674a2bd53007b07e119a0eaaf40b890b2081c2864f12a',
        outputTransactionId: genesisTx.hash,
        index: 0,
        outputIndex: 0,
        spendingProof: '', // no need just for tests I think
        transactionId: hash,
        value: genesisTxValue,
      }],
      dataInputs: [],
      outputs: [
        // ergo-simple-wallet
        {
          // index: 0
          additionalRegisters: Object.freeze({}),
          address: address.address,
          assets: [],
          creationHeight: height,
          ergoTree: ErgoAddress.fromBase58(
            genesisTxReceiver
          ).ergoTree,
          id: '33a35e15af1a83fa188673a2bd63007b07e119a0eaaf40b890b2081c2864f12a',
          txId: hash,
          index: 0,
          mainChain: true,
          spentTransactionId: null,
          value: 20_000000000,
        }
      ],
      block_num: height,
      tx_ordinal: 1,
      block_hash: '1',
      time: '2019-04-19T15:13:33.000Z',
      tx_state: 'Successful'
    };
  })();

  return {
    genesisTx,
    distributorTx,
  };
};

// =================
//   Manage state
// =================

const transactions: Array<RemoteErgoTransaction> = [];

export function addTransaction(tx: RemoteErgoTransaction): void {
  // need to insert txs in order they appear in the blockchain
  // note: pending transactions always go at the end
  if (tx.block_num == null || tx.tx_ordinal == null) {
    transactions.push(tx);
    return;
  }
  const newTxBlock = tx.block_num;
  const newTxOrdinal = tx.tx_ordinal;

  const insertionIndex = transactions.findIndex(mockChainTx => {
    const blockNum = mockChainTx.block_num;
    const txOrdinal = mockChainTx.tx_ordinal;

    if (blockNum == null) return true;
    if (blockNum > newTxBlock) return true;
    if (blockNum < newTxBlock) return false;
    if (txOrdinal == null) return true;
    if (txOrdinal > newTxOrdinal) return true;
    if (txOrdinal < newTxOrdinal) return false;
    throw new Error(`Transaction ${tx.hash} occurs at same position as an existing transactions`);
  });
  if (insertionIndex === -1) {
    transactions.push(tx);
    return;
  }
  transactions.splice(insertionIndex, 0, tx);
}

export const MockChain = Object.freeze({
  Standard: 0,
  TestAssurance: 1,
});
export function resetChain(): void {
  // want to keep reference the same
  while (transactions.length > 0) {
    transactions.pop();
  }

  const txs = generateTransaction();

  // test setup
  addTransaction(txs.genesisTx);
  addTransaction(txs.distributorTx);
}

const usedAddresses: FilterFunc = genCheckAddressesInUse(
  transactions,
  networks.ErgoMainnet,
);
const history: HistoryFunc = genGetTransactionsHistoryForAddresses(
  transactions,
  networks.ErgoMainnet
);
const getBestBlock: BestBlockFunc = genGetBestBlock(transactions);
const utxoForAddresses: AddressUtxoFunc = genUtxoForAddresses(
  history,
  getBestBlock,
  networks.ErgoMainnet
);
const utxoSumForAddresses: UtxoSumFunc = genUtxoSumForAddresses(utxoForAddresses);
const sendTx = (request: SignedRequest): SignedResponse => {
  const remoteTx = toRemoteErgoTx(transactions, request, networks.ErgoMainnet);

  addTransaction(remoteTx);
  return { txId: remoteTx.hash };
};

export default {
  utxoForAddresses,
  utxoSumForAddresses,
  usedAddresses,
  history,
  getBestBlock,
  sendTx,
};
