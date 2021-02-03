// @flow

import type {
  RemoteErgoTransaction,
  SignedRequest, SignedResponse,
  UtxoSumFunc,
  AddressUtxoFunc,
  HistoryFunc,
  BestBlockFunc,
  AssetInfoFunc,
  ErgoTxOutput,
} from '../../app/api/ergo/lib/state-fetch/types';
import {
  getErgoAddress,
  genGetTransactionsHistoryForAddresses,
  genGetBestBlock,
  genGetAssetInfo,
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
import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { replaceMockBoxId } from '../../app/api/ergo/lib/transactions/utils';

// based on abandon x 14 + share
const genesisAddress = '9eXpzdMjPP9oNrhMB6na4LTZMWBJZNp71NVVefqdQ6kRwrqfZHe';
const genesisTxValue = 200000_000000000; // 200K ERG

// based on abandon x14 + address
const genesisTxReceiver = '9emv7LAtw7U6xMs4JrJP8NTPvwQjNRaSWpgSTGEM6947fFofBWd';

export function replaceMockOutputBoxId(
  output: ErgoTxOutput
): ErgoTxOutput {
  const box = replaceMockBoxId({
    amount: output.value.toString(),
    receiver: Buffer.from(
      RustModule.SigmaRust.NetworkAddress.from_base58(output.address).to_bytes()
    ).toString('hex'),
    tx_hash: output.txId,
    tx_index: output.index,
    creationHeight: output.creationHeight,
    boxId: '', // this will get calculated and updated to the correct value
    assets: output.assets,
    additionalRegisters: output.additionalRegisters,
    ergoTree: output.ergoTree,
  });

  return {
    ...output,
    id: box.boxId,
  };
}

/**
 * we need to generate a chain of transactions
 * since only one token type can be created per tx
*/
export const generateGenesisChain = (): Array<RemoteErgoTransaction> => {
  const height = 1;
  let txOrdinal = 0;

  const result = [];
  result.push((() => {
    const hash = '7d4b41a1256f93989aa7e1782989dbbb9ec222c3f6b98e216b676c589b5ecece';

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
        assets: [],
      }],
      dataInputs: [],
      outputs: [replaceMockOutputBoxId({
        additionalRegisters: Object.freeze({
          'R4': '0e03555344',
          'R5': '0e184e6f7468696e67206261636b65642055534420746f6b656e',
          'R6': '0e0132',
        }),
        address,
        assets: [{
          amount: 12340,
          tokenId: '33a35e15ae1a83fa188674a2bd53007b07e119a0eaaf40b890b2081c2864f12a',
        }],
        creationHeight: height,
        ergoTree: Buffer.from(RustModule.SigmaRust.Address.from_base58(address).to_ergo_tree().to_bytes()).toString('hex'),
        id: '',
        txId: hash,
        index: 0,
        mainChain: true,
        spentTransactionId: null,
        value: genesisTxValue,
      })],
      block_num: height,
      tx_ordinal: txOrdinal++,
      block_hash: '1',
      time: '2019-04-19T15:13:33.000Z',
      tx_state: 'Successful'
    };
  })());
  result.push((() => {
    const hash = '8d4b41a1256f93989aa7e1782989dbbb9ec222c3f6b98e216b676c589b5ecece';

    const address = genesisTxReceiver;
    return {
      hash,
      inputs: [{
        address,
        id: '13a35e15ae1a83fa188674a2bd53007b07e119a0eaaf40b890b2081c2864f12a',
        outputTransactionId: result[result.length - 1].hash,
        index: 0,
        outputIndex: 0,
        spendingProof: '', // no need just for tests I think
        transactionId: hash,
        value: result[result.length - 1].outputs[0].value,
        assets: result[result.length - 1].outputs[0].assets,
      }],
      dataInputs: [],
      outputs: [replaceMockOutputBoxId({
        additionalRegisters: Object.freeze({
          'R4': '0e034a5059',
          'R5': '0e184e6f7468696e67206261636b65642055534420746f6b656e',
          'R6': '0e0132',
        }),
        address,
        assets: [
          {
            amount: 6140,
            tokenId: '13a35e15ae1a83fa188674a2bd53007b07e119a0eaaf40b890b2081c2864f12a',
          },
          ...result[result.length - 1].outputs[0].assets
        ],
        creationHeight: height,
        ergoTree: Buffer.from(RustModule.SigmaRust.Address.from_base58(address).to_ergo_tree().to_bytes()).toString('hex'),
        id: '',
        txId: hash,
        index: 0,
        mainChain: true,
        spentTransactionId: null,
        value: result[result.length - 1].outputs[0].value,
      })],
      block_num: height,
      tx_ordinal: txOrdinal++,
      block_hash: '1',
      time: '2019-04-19T15:13:33.000Z',
      tx_state: 'Successful'
    };
  })());

  return result;
}

/**
 * To simplify, our genesis is a single address which gives all its ada to a "distributor"
 * The distributor gives ERGO to a bunch of addresses to setup the tests
 */
export const generateTransaction = (): {|
  genesisChain: Array<RemoteErgoTransaction>,
  distributorTx: RemoteErgoTransaction,
|} => {
  const genesisChain = generateGenesisChain();
  const distributorTx = (() => {
    const hash = 'b713cc0d63106c3806b5a7077cc37a294fcca0e479f26aac64e51e04ae808d75';
    const height = 1;
    // 9erND2FjDWVTgT2TWRZ9dCLueKAWjoskx6KqRmZbtvtRXEgCrja
    const simpleAddress = getErgoAddress(
      testWallets['ergo-simple-wallet'].mnemonic,
      [
        WalletTypePurpose.BIP44,
        CoinTypes.ERGO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
        0
      ]
    );
    // 9iFo22w5LoHJcvKn6oK9Br7dw3bUqeXkRddeiKAEEFUr95zv1bY
    const tokenAddress = getErgoAddress(
      testWallets['ergo-token-wallet'].mnemonic,
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
        outputTransactionId: genesisChain[genesisChain.length - 1].hash,
        index: 0,
        outputIndex: 0,
        spendingProof: '', // no need just for tests I think
        transactionId: hash,
        value: genesisChain[genesisChain.length - 1].outputs[0].value,
        assets: genesisChain[genesisChain.length - 1].outputs[0].assets,
      }],
      dataInputs: [],
      outputs: [
        // ergo-simple-wallet
        replaceMockOutputBoxId({
          additionalRegisters: Object.freeze({}),
          address: simpleAddress.to_base58(),
          assets: [],
          creationHeight: height,
          ergoTree: Buffer.from(simpleAddress.address().to_ergo_tree().to_bytes()).toString('hex'),
          id: '',
          txId: hash,
          index: 0,
          mainChain: true,
          spentTransactionId: null,
          value: 20_000000000,
        }),
        // ergo-simple-wallet
        replaceMockOutputBoxId({
          additionalRegisters: Object.freeze({}),
          address: tokenAddress.to_base58(),
          assets: [],
          creationHeight: height,
          ergoTree: Buffer.from(tokenAddress.address().to_ergo_tree().to_bytes()).toString('hex'),
          id: '',
          txId: hash,
          index: 1,
          mainChain: true,
          spentTransactionId: null,
          value: 10_000000000,
        }),
        // ergo-token-wallet
        replaceMockOutputBoxId({
          additionalRegisters: Object.freeze({}),
          address: tokenAddress.to_base58(),
          assets: [
            {
              amount: 12340,
              tokenId: '33a35e15ae1a83fa188674a2bd53007b07e119a0eaaf40b890b2081c2864f12a',
            },
            {
              amount: 6140,
              tokenId: '13a35e15ae1a83fa188674a2bd53007b07e119a0eaaf40b890b2081c2864f12a',
            },
          ],
          creationHeight: height,
          ergoTree: Buffer.from(tokenAddress.address().to_ergo_tree().to_bytes()).toString('hex'),
          id: '',
          txId: hash,
          index: 2,
          mainChain: true,
          spentTransactionId: null,
          value: 1_000000000,
        }),
      ],
      block_num: height,
      tx_ordinal: (genesisChain[genesisChain.length - 1].tx_ordinal ?? 0) + 1,
      block_hash: '1',
      time: '2019-04-19T15:13:33.000Z',
      tx_state: 'Successful'
    };
  })();

  return {
    genesisChain,
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
  txs.genesisChain.forEach(tx => addTransaction(tx));
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

const getAssetInfo: AssetInfoFunc = genGetAssetInfo(transactions);

export default {
  utxoForAddresses,
  utxoSumForAddresses,
  usedAddresses,
  history,
  getBestBlock,
  getAssetInfo,
  sendTx,
};
