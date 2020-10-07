// @flow

import type {
  RemoteErgoTransaction,
} from '../../app/api/ergo/lib/state-fetch/types';
import { Address as ErgoAddress } from '@coinbarn/ergo-ts';
import { getErgoAddress } from '../../app/api/ergo/lib/state-fetch/mockNetwork';
import { testWallets } from './TestWallets';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
} from '../../app/config/numbersConfig';

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
          address,
          assets: [],
          creationHeight: height,
          ergoTree: ErgoAddress.fromBytes(
            Buffer.from(genesisTxReceiver, 'hex')
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

