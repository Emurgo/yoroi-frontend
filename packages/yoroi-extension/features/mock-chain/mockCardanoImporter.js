// @flow

import type {
  SignedRequestInternal,
  SignedResponse,
  RemoteTransaction,
  UtxoSumFunc,
  PoolInfoFunc,
  AddressUtxoFunc,
  RewardHistoryRequest,
  RewardHistoryResponse,
  RewardHistoryFunc,
  AccountStateFunc,
  RemoteAccountState,
  HistoryFunc,
  BestBlockFunc,
  UtxoData,
} from '../../app/api/ada/lib/state-fetch/types';
import { ShelleyCertificateTypes } from '../../app/api/ada/lib/state-fetch/types';
import type { FilterFunc } from '../../app/api/common/lib/state-fetch/currencySpecificTypes';
import type { ServerStatusResponse } from '../../app/api/common/lib/state-fetch/types';
import BigNumber from 'bignumber.js';
import {
  genGetTransactionsHistoryForAddresses,
  genGetPoolInfo,
  genGetBestBlock,
  genCheckAddressesInUse,
  genUtxoForAddresses,
  genUtxoSumForAddresses,
  getSingleAddressString,
  getAddressForType,
  getMangledAddressString,
  toRemoteByronTx,
} from '../../app/api/ada/lib/state-fetch/mockNetwork';
import { networks } from '../../app/api/ada/lib/storage/database/prepackaged/networks';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
} from '../../app/config/numbersConfig';
import { testWallets } from './TestWallets';
import { CoreAddressTypes } from '../../app/api/ada/lib/storage/database/primitives/enums';

// based on abandon x 14 + share
const genesisTransaction = '52929ce6f1ab83b439e65f6613bad9590bd264c0d6c4f910e36e2369bb987b35';
const genesisAddress = 'Ae2tdPwUPEZLs4HtbuNey7tK4hTKrwNwYtGqp7bDfCy2WdR3P6735W5Yfpe';
const genesisTxValue = 2000000000000000; // 2 billion ada
const testAssetId = 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26.6e69636f696e';
const genesisAssets = [
  {
    amount: '1234',
    assetId: testAssetId,
    policyId: testAssetId.split('.')[0],
    name: testAssetId.split('.')[1],
  },
];

// based on abandon x14 + address
const genesisTxReceiver = 'Ae2tdPwUPEZ4YjgvykNpoFeYUxoyhNj2kg8KfKWN2FizsSpLUPv68MpTVDo';

type MockTx = RemoteTransaction;

export const generateTransaction = (): {|
  genesisTx: RemoteTransaction,
  distributorTx: RemoteTransaction,
  pendingTx1: RemoteTransaction,
  pendingTx2: RemoteTransaction,
  manyTx1: RemoteTransaction,
  manyTx2: RemoteTransaction,
  manyTx3: RemoteTransaction,
  manyTx4: RemoteTransaction,
  useChange: RemoteTransaction,
  postLaunchSuccessfulTx: RemoteTransaction,
  postLaunchPendingTx: RemoteTransaction,
  failedTx: RemoteTransaction,
  ledgerTx1: RemoteTransaction,
  cip1852LedgerTx1: RemoteTransaction,
  bip44TrezorTx1: RemoteTransaction,
  bip44TrezorTx2: RemoteTransaction,
  bip44TrezorTx3: RemoteTransaction,
  cip1852TrezorTx1: RemoteTransaction,
  cip1852TrezorTx2: RemoteTransaction,
  shelleySimple15: RemoteTransaction,
  shelleyDelegatedTx1: RemoteTransaction,
  shelleyDelegatedTx2: RemoteTransaction,
  shelleyLedgerDelegatedTx1: RemoteTransaction,
  shelleyLedgerDelegatedTx2: RemoteTransaction,
  shelleyOnlyRegisteredTx1: RemoteTransaction,
  shelleyOnlyRegisteredTx2: RemoteTransaction,
  delegateMangledWallet: RemoteTransaction,
|} => {
  /**
   * To simplify, our genesis is a single address which gives all its ada to a "distributor"
   * The distributor gives ADA to a bunch of addresses to setup the tests
   *
   * You can generate more data for these tests using the Cardano-Wallet WASM library
   */
  const genesisTx = {
    hash: genesisTransaction,
    inputs: [
      {
        address: genesisAddress,
        id: genesisTransaction + '0',
        amount: genesisTxValue.toString(),
        txHash: '',
        index: 0,
        assets: genesisAssets,
      },
    ],
    outputs: [
      {
        address: genesisTxReceiver,
        amount: genesisTxValue.toString(),
        assets: genesisAssets,
      },
    ],
    height: 1,
    epoch: 0,
    slot: 1,
    tx_ordinal: 0,
    block_hash: '1',
    time: '2019-04-19T15:13:33.000Z',
    last_update: '2019-05-17T23:14:51.899Z',
    tx_state: 'Successful',
  };
  const distributorTx = {
    hash: 'b713cc0d63106c3806b5a7077cc37a294fcca0e479f26aac64e51e04ae808d75',
    inputs: [
      {
        address: genesisTxReceiver,
        txHash: genesisTx.hash,
        id: genesisTx.hash + '0',
        index: 0,
        amount: genesisTxValue.toString(),
        assets: genesisAssets,
      },
    ],
    outputs: [
      // small-single-tx
      {
        // index: 0
        // Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc
        address: getSingleAddressString(testWallets['small-single-tx'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0,
        ]),
        amount: '20295',
        assets: [],
      },
      // tx-big-input-wallet
      {
        // index: 1
        // Ae2tdPwUPEYx2dK1AMzRN1GqNd2eY7GCd7Z6aikMPJL3EkqqugoFQComQnV
        address: getSingleAddressString(testWallets['tx-big-input-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0,
        ]),
        amount: '1234567898765',
        assets: [],
      },
      // simple-pending-wallet
      {
        // index: 2
        // Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ
        address: getSingleAddressString(testWallets['simple-pending-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0,
        ]),
        amount: '1000000',
        assets: [],
      },
      {
        // index: 3
        // Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ
        address: getSingleAddressString(testWallets['simple-pending-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0,
        ]),
        amount: '1000000',
        assets: [],
      },
      {
        // index: 4
        // Ae2tdPwUPEZ9uHfzhw3vXUrTFLowct5hMMHeNjfsrkQv5XSi5PhSs2yRNUb
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0,
        ]),
        amount: '1000000',
        assets: [],
      },
      {
        // index: 5
        // Ae2tdPwUPEZEXbmLnQ22Rxhv8a6hQ3C2673nkGsXKAgzqnuC1vqne9EtBkK
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '1000000',
        assets: [],
      },
      {
        // index: 6
        // Ae2tdPwUPEYwBZD5hPWCm3PUDYdMBfnLHsQmgUiexnkvDMTFCQ4gzRkgAEQ
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          2,
        ]),
        amount: '1000000',
        assets: [],
      },
      {
        // index: 7
        // Ae2tdPwUPEYvzFpWJEGmSjLdz3DNY9WL5CbPjsouuM5M6YMsYWB1vsCS8j4
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          3,
        ]),
        amount: '1000000',
        assets: [],
      },
      // failed-single-tx
      {
        // index: 8
        // Ae2tdPwUPEYw8ScZrAvKbxai1TzG7BGC4n8PoF9JzE1abgHc3gBfkkDNBNv
        address: getSingleAddressString(testWallets['failed-single-tx'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0,
        ]),
        amount: '1000000',
        assets: [],
      },
      // daedalus addresses
      // index: 9
      {
        address:
          'DdzFFzCqrhstBgE23pfNLvukYhpTPUKgZsXWLN5GsawqFZd4Fq3aVuGEHk11LhfMfmfBCFCBGrdZHVExjiB4FY5Jkjj1EYcqfTTNcczb',
        amount: '2000000',
        assets: [],
      },
      // index: 10
      {
        address:
          'DdzFFzCqrht74dr7DYmiyCobGFQcfLCsHJCCM6nEBTztrsEk5kwv48EWKVMFU9pswAkLX9CUs4yVhVxqZ7xCVDX1TdatFwX5W39cohvm',
        amount: '2000000',
        assets: [],
      },
      // paper wallet
      // index: 11
      {
        address: 'Ae2tdPwUPEZ7TQpzbJZCbA5BjW4zWYFn47jKo43ouvfe4EABoCfvEjwYvJr',
        amount: '2000000',
        assets: [],
      },
      // dump-wallet
      {
        // index: 12
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '2000000',
        assets: [],
      },
      {
        // index: 13
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '3000000',
        assets: [],
      },
      {
        // index: 14
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '2000000',
        assets: [],
      },
      {
        // index: 15
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '2000000',
        assets: [],
      },
      {
        // index: 16
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '7000000',
        assets: [],
      },
      {
        // index: 17
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '10000000',
        assets: [],
      },
      {
        // index: 18
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '10000000',
        assets: [],
      },
      {
        // index: 19
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '10000000',
        assets: [],
      },
      {
        // index: 20
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '10000000',
        assets: [],
      },
      {
        // index: 21
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '10000000',
        assets: [],
      },
      {
        // index: 22
        // addr1vxmlzg3gg6tc9fgkqw2ymj09axadhjkc0kkk7whuu9fkrvqpdrama
        address: getSingleAddressString(testWallets['shelley-enterprise'].mnemonic, [
          WalletTypePurpose.CIP1852,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0,
        ]),
        amount: '10000000',
        assets: [],
      },
      {
        // index: 23
        // eslint-disable-next-line max-len
        // addr1q8sm64ehfue7m7xrlh2zfu4uj9tn3z3yrzfdaly52gs667qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqhzdk70
        address: getMangledAddressString(
          testWallets['shelley-mangled'].mnemonic,
          [
            WalletTypePurpose.CIP1852,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0,
          ],
          Buffer.from('00000000000000000000000000000000000000000000000000000000', 'hex')
        ),
        amount: '10000000', // enough that it can be unmangled
        assets: [],
      },
      {
        // index: 24
        // eslint-disable-next-line max-len
        // addr1q8sm64ehfue7m7xrlh2zfu4uj9tn3z3yrzfdaly52gs667qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqhzdk70
        address: getMangledAddressString(
          testWallets['shelley-mangled'].mnemonic,
          [
            WalletTypePurpose.CIP1852,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0,
          ],
          Buffer.from('00000000000000000000000000000000000000000000000000000000', 'hex')
        ),
        amount: '1', // too little to unmangle
        assets: [],
      },
      {
        // index: 25
        // eslint-disable-next-line max-len
        // TODO
        address: getAddressForType(
          testWallets['shelley-mangled'].mnemonic,
          [
            WalletTypePurpose.CIP1852,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0,
          ],
          CoreAddressTypes.CARDANO_BASE
        ),
        amount: '3500000',
        assets: [],
      },
      {
        // index: 26
        // eslint-disable-next-line max-len
        // addr1qxwfqlp5q96ac8rc9gu4eyxr7m9cgspnsp2dzwj46ayjadhxc02hs60yavkwdt7xrzjkes9m3dhs3zu8808mcps8j3qqjmspqv
        address: getAddressForType(
          testWallets['cardano-token-wallet'].mnemonic,
          [
            WalletTypePurpose.CIP1852,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0,
          ],
          CoreAddressTypes.CARDANO_BASE
        ),
        amount: '4000000',
        assets: [
          {
            amount: '100',
            assetId: testAssetId,
            policyId: testAssetId.split('.')[0],
            name: testAssetId.split('.')[1],
          },
        ],
      },
    ],
    height: 1,
    epoch: 0,
    slot: 1,
    tx_ordinal: 1,
    block_hash: '1',
    time: '2019-04-19T15:13:33.000Z',
    last_update: '2019-05-17T23:14:51.899Z',
    tx_state: 'Successful',
  };

  // =========================
  //   simple-pending-wallet
  // =========================

  const pendingTx1 = {
    hash: 'a713cc0d63106c3806b5a7077cc37a294fcca0e479f26aac64e51e09ae808d79',
    inputs: [
      {
        // Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ
        address: getSingleAddressString(testWallets['simple-pending-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '2',
        index: 2,
        amount: '1000000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEYw3yJyPX1LWKXpuUjKAt57TLdR5fF61PRvUyswE3m7WrKNbrr
        address: getSingleAddressString(testWallets['simple-pending-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '1',
        assets: [],
      },
    ],
    height: null,
    block_hash: null,
    tx_ordinal: null,
    time: null,
    epoch: null,
    slot: null,
    last_update: '2019-05-20T23:14:51.899Z',
    tx_state: 'Pending',
  };
  const pendingTx2 = {
    hash: 'fa6f2c82fb511d0cc9c12a540b5fac6e5a9b0f288f2d140f909f981279e16fbe',
    inputs: [
      {
        // Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ
        address: getSingleAddressString(testWallets['simple-pending-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '3',
        index: 3,
        amount: '1000000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEYwEnNsuY9uMAphecEWipHKEy9g8yZCJTJm4zxV1sTrQfTxPVX
        address: getSingleAddressString(testWallets['simple-pending-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          2,
        ]),
        amount: '1',
        assets: [],
      },
    ],
    height: null,
    block_hash: null,
    tx_ordinal: null,
    time: null,
    epoch: null,
    slot: null,
    last_update: '2019-05-20T23:14:52.899Z',
    tx_state: 'Pending',
  };

  // ==================
  //   many-tx-wallet
  // ==================

  const manyTx1 = {
    hash: 'b713cc0d63106c3806b1a7077cc37a294fcca0e479f26aac64e51e09ae808d75',
    inputs: [
      {
        // Ae2tdPwUPEZ9uHfzhw3vXUrTFLowct5hMMHeNjfsrkQv5XSi5PhSs2yRNUb
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '4',
        index: 4,
        amount: '1000000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          9,
        ]),
        amount: '1',
        assets: [],
      },
      {
        // Ae2tdPwUPEZ77uBBu8cMVxswVy1xfaMZR9wsUSwDNiB48MWqsVWfitHfUM9
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          0,
        ]),
        amount: '820000',
        assets: [],
      },
    ],
    height: 100,
    block_hash: '100',
    tx_ordinal: 0,
    time: '2019-04-20T15:15:33.000Z',
    epoch: 0,
    slot: 100,
    last_update: '2019-05-20T23:16:51.899Z',
    tx_state: 'Successful',
  };
  const manyTx2 = {
    hash: '60493bf26e60b0b98f143647613be2ec1c6f50bd5fc15a14a2ff518f5fa36be0',
    inputs: [
      {
        // Ae2tdPwUPEZEXbmLnQ22Rxhv8a6hQ3C2673nkGsXKAgzqnuC1vqne9EtBkK
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '5',
        index: 5,
        amount: '1000000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          9,
        ]),
        amount: '1',
        assets: [],
      },
      {
        // Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          1,
        ]),
        amount: '820000',
        assets: [],
      },
    ],
    height: 100,
    block_hash: '100',
    tx_ordinal: 1,
    time: '2019-04-20T15:15:33.000Z',
    epoch: 0,
    slot: 100,
    last_update: '2019-05-20T23:16:51.899Z',
    tx_state: 'Successful',
  };
  const manyTx3 = {
    hash: 'b713cc0d63106c3806b5a7077cc37a294fcca0e479f26aac64e51e09ae808d71',
    inputs: [
      {
        // Ae2tdPwUPEYwBZD5hPWCm3PUDYdMBfnLHsQmgUiexnkvDMTFCQ4gzRkgAEQ
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          2,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '6',
        index: 6,
        amount: '1000000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          9,
        ]),
        amount: '1',
        assets: [],
      },
      {
        // Ae2tdPwUPEZJZPsFg8w5bXA4brfu8peYy5prmrFiYPACb7DX64iiBY8WvHD
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          2,
        ]),
        amount: '820000',
        assets: [],
      },
    ],
    height: 100,
    block_hash: '100',
    tx_ordinal: 2,
    time: '2019-04-20T15:15:33.000Z',
    epoch: 0,
    slot: 100,
    last_update: '2019-05-20T23:16:51.899Z',
    tx_state: 'Successful',
  };
  const manyTx4 = {
    hash: 'b713cc0d63106c3806b5a7077cc37a294fcca0e479f26aac64e51e09ae808d75',
    inputs: [
      {
        // Ae2tdPwUPEYvzFpWJEGmSjLdz3DNY9WL5CbPjsouuM5M6YMsYWB1vsCS8j4
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          3,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '7',
        index: 7,
        amount: '1000000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          9,
        ]),
        amount: '1',
        assets: [],
      },
      {
        // Ae2tdPwUPEZHG9AGUYWqFcM5zFn74qdEx2TqyZxuU68CQ33EBodWAVJ523w
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          3,
        ]),
        amount: '820000',
        assets: [],
      },
    ],
    height: 100,
    block_hash: '100',
    tx_ordinal: 3,
    time: '2019-04-20T15:15:33.000Z',
    epoch: 0,
    slot: 100,
    last_update: '2019-05-20T23:16:51.899Z',
    tx_state: 'Successful',
  };

  const useChange = {
    hash: '0a073669845fea4ae83cd4418a0b4fd56610097a89601a816b5891f667e3496c',
    inputs: [
      {
        // Ae2tdPwUPEZ77uBBu8cMVxswVy1xfaMZR9wsUSwDNiB48MWqsVWfitHfUM9
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          0,
        ]),
        txHash: manyTx1.hash,
        id: manyTx1.hash + '1',
        index: 1,
        amount: '820000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEYzkKjrqPw1GHUty25Cj5fWrBVsWxiQYCxfoe2d9iLjTnt34Aj
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          30,
        ]),
        amount: '1',
        assets: [],
      },
      {
        // Ae2tdPwUPEZ7VKG9jy6jJTxQCWNXoMeL2Airvzjv3dc3WCLhSBA7XbSMhKd
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          4,
        ]),
        amount: '650000',
        assets: [],
      },
    ],
    height: 200,
    block_hash: '200',
    tx_ordinal: 0,
    time: '2019-04-21T15:13:33.000Z',
    epoch: 0,
    slot: 200,
    last_update: '2019-05-21T23:14:51.899Z',
    tx_state: 'Successful',
  };

  const postLaunchSuccessfulTx = {
    hash: '350632adedd456cf607ed01a84f8c6c49d32f17e0e63447be7f7b69cb37ef446',
    inputs: [
      {
        // Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          1,
        ]),
        txHash: manyTx2.hash,
        id: manyTx2.hash + '1',
        index: 1,
        amount: '820000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZCdSLM7bHhoC6xptW9SRW155PFFf4WYCKnpX4JrxJPmFzi6G2
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0,
        ]),
        amount: '500000',
        assets: [],
      },
    ],
    height: 202,
    block_hash: '202',
    tx_ordinal: 0,
    time: '2019-04-22T15:15:33.000Z',
    epoch: 0,
    slot: 202,
    last_update: '2019-05-22T23:16:51.899Z',
    tx_state: 'Successful',
  };

  const postLaunchPendingTx = {
    hash: '350632adedd456cf607ed01a84f8c6c49d32f17e0e63447be7f7b69cb37ef446',
    inputs: [
      {
        // Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3
        address: getSingleAddressString(testWallets['many-tx-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          1,
        ]),
        txHash: manyTx2.hash,
        id: manyTx2.hash + '1',
        index: 1,
        amount: '820000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZCdSLM7bHhoC6xptW9SRW155PFFf4WYCKnpX4JrxJPmFzi6G2
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0,
        ]),
        amount: '500000',
        assets: [],
      },
    ],
    height: 202,
    block_hash: '202',
    tx_ordinal: 1,
    time: '2019-04-22T15:15:33.000Z',
    epoch: 0,
    slot: 202,
    last_update: '2019-05-22T23:16:51.899Z',
    tx_state: 'Pending',
  };

  // ====================
  //   failed-single-tx
  // ====================

  const failedTx = {
    hash: 'fc6a5f086c0810de3048651ddd9075e6e5543bf59cdfe5e0c73bf1ed9dcec1ab',
    inputs: [
      {
        // Ae2tdPwUPEYw8ScZrAvKbxai1TzG7BGC4n8PoF9JzE1abgHc3gBfkkDNBNv
        address: getSingleAddressString(testWallets['failed-single-tx'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '8',
        index: 8,
        amount: '1000000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZCdSLM7bHhoC6xptW9SRW155PFFf4WYCKnpX4JrxJPmFzi6G2
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0,
        ]),
        amount: '1',
        assets: [],
      },
      {
        // Ae2tdPwUPEZCqWsJkibw8BK2SgbmJ1rRG142Ru1CjSnRvKwDWbL4UYPN3eU
        address: getSingleAddressString(testWallets['failed-single-tx'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          0,
        ]),
        amount: '820000',
        assets: [],
      },
    ],
    height: null,
    block_hash: null,
    tx_ordinal: null,
    time: null,
    epoch: null,
    slot: null,
    last_update: '2019-05-21T23:14:51.899Z',
    tx_state: 'Failed',
  };

  // =================
  //   ledger-wallet
  // =================

  const ledgerTx1 = {
    hash: '166dfde5b183b7e09483afbbfce7b41e7d6fed34b405cc1041b45f27e8b05d47',
    inputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '13',
        index: 13,
        amount: '2000000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEYyHfxoQYGPhyHuAfLHKfLubzo4kxyw2XDnLsLmACtjufaBs33
        address: getSingleAddressString(
          testWallets['ledger-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0,
          ],
          true
        ),
        amount: '1638497',
        assets: [],
      },
    ],
    height: 300,
    block_hash: '300',
    tx_ordinal: 0,
    time: '2019-04-20T15:15:33.000Z',
    epoch: 0,
    slot: 300,
    last_update: '2019-05-20T23:16:51.899Z',
    tx_state: 'Successful',
  };

  const cip1852LedgerTx1 = {
    hash: '3677e75c7ba699afdc6cd57d42f246f86f69aefd76025006ac78313fad2bba21',
    inputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '18',
        index: 18,
        amount: '8500000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '1',
        assets: [],
      },
      {
        // ledger-wallet base address index 0'/0/0
        // eslint-disable-next-line max-len
        // addr1q9mvu42dtppagyyy3l0m36vr7qvefgt9ka2nyt8efzeewpc0vckke6cmv4en56dpa4e0smct43dpv5z6q2yf0tcmudzs8tsuf0
        address:
          '0176ce554d5843d410848fdfb8e983f01994a165b755322cf948b397070f662d6ceb1b65733a69a1ed72f86f0bac5a16505a028897af1be345',
        amount: '5500000',
        assets: [],
      },
    ],
    height: 301,
    block_hash: '301',
    tx_ordinal: 3,
    time: '2019-04-20T15:15:53.000Z',
    epoch: 0,
    slot: 301,
    last_update: '2019-05-20T23:17:11.899Z',
    tx_state: 'Successful',
  };

  // =================
  //   trezor-wallet
  // =================

  const bip44TrezorTx1 = {
    hash: '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba20',
    inputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '14',
        index: 14,
        amount: '3000000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '1',
        assets: [],
      },
      {
        // Ae2tdPwUPEZ9qgUrkrTqqTa5iKkaURYNFqM1gSbPXicn21LYyF184ZXnQ5R
        address: getSingleAddressString(testWallets['trezor-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          2,
        ]),
        amount: '2832006',
        assets: [],
      },
    ],
    height: 301,
    block_hash: '301',
    tx_ordinal: 1,
    time: '2019-04-20T15:15:53.000Z',
    epoch: 0,
    slot: 301,
    last_update: '2019-05-20T23:17:11.899Z',
    tx_state: 'Successful',
  };
  const bip44TrezorTx2 = {
    hash: '058405892f66075d83abd1b7fe341d2d5bfd2f6122b2f874700039e5078e0dd5',
    inputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '15',
        index: 15,
        amount: '2000000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '1',
        assets: [],
      },
      {
        // Ae2tdPwUPEZLmqiKtMQ4kKL38emRfkyPqBsHqL64pf8uRz6uzsQCd7GAu9R
        address: getSingleAddressString(testWallets['trezor-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          1,
        ]),
        amount: '1494128',
        assets: [],
      },
    ],
    height: 302,
    block_hash: '302',
    tx_ordinal: 1,
    time: '2019-04-20T15:16:13.000Z',
    epoch: 0,
    slot: 302,
    last_update: '2019-05-20T23:17:31.899Z',
    tx_state: 'Successful',
  };
  const bip44TrezorTx3 = {
    hash: '1029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3657',
    inputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '16',
        index: 16,
        amount: '2000000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEYw66yGJJfbzNxTerpKV3zQRcd746cUtNSFgAGSYx1YLHnQW6c
        address: getSingleAddressString(testWallets['trezor-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          7,
        ]),
        amount: '1000000',
        assets: [],
      },
    ],
    height: 303,
    block_hash: '303',
    tx_ordinal: 0,
    time: '2019-04-20T15:16:33.000Z',
    epoch: 0,
    slot: 303,
    last_update: '2019-05-20T23:17:51.899Z',
    tx_state: 'Successful',
  };
  const cip1852TrezorTx1 = {
    hash: '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba21',
    inputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '15',
        index: 15,
        amount: '7000000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '1',
        assets: [],
      },
      {
        // trezor-wallet base address index 0'/0/2
        address:
          '0101ea7455b13eceade036aa02c2eecfeb0c2f5fd7398f08c573717d1764238bc39c962aa28156a45a461213770d88d808896785f92c3aa4d2',
        amount: '5500000',
        assets: [],
      },
    ],
    height: 301,
    block_hash: '301',
    tx_ordinal: 2,
    time: '2019-04-20T15:15:53.000Z',
    epoch: 0,
    slot: 301,
    last_update: '2019-05-20T23:17:11.899Z',
    tx_state: 'Successful',
  };

  const cip1852TrezorTx2 = {
    hash: '3677e86c7ba699afdc1cd57d42f246f86f69aefd76025006ac78313fad2bba21',
    type: 'shelley',
    inputs: [
      {
        // shelley-delegated base address index 0'/0/0
        // eslint-disable-next-line max-len
        // addr1qymwxh8y7pkdea6dyvrldnh6rtt5u9qxp0nd43dzn6c5y06kmdwdfzyussgs6n0fpsx4qw63hpzdk0n0mpuezgufjkas3clf5j
        address:
          '0136e35ce4f06cdcf74d2307f6cefa1ad74e14060be6dac5a29eb1423f56db5cd4889c84110d4de90c0d503b51b844db3e6fd87991238995bb',
        txHash: cip1852TrezorTx1.hash,
        id: cip1852TrezorTx1.hash + '1',
        index: 1,
        amount: '5500000',
        assets: [],
      },
    ],
    outputs: [
      {
        // trezor-wallet base address index 0'/0/2
        address:
          '0101ea7455b13eceade036aa02c2eecfeb0c2f5fd7398f08c573717d1764238bc39c962aa28156a45a461213770d88d808896785f92c3aa4d2',
        amount: '5500000',
        assets: [],
      },
    ],
    ttl: '500',
    fee: '500000',
    certificates: [
      {
        certIndex: 0,
        kind: (ShelleyCertificateTypes.StakeRegistration: 'StakeRegistration'),
        rewardAddress: 'e164238bc39c962aa28156a45a461213770d88d808896785f92c3aa4d2',
      },
      {
        certIndex: 1,
        kind: ShelleyCertificateTypes.StakeDelegation,
        rewardAddress: 'e164238bc39c962aa28156a45a461213770d88d808896785f92c3aa4d2',
        poolKeyHash: 'df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207', // YOROI
      },
    ],
    withdrawals: [],
    metadata: null,
    height: 200,
    block_hash: '200',
    tx_ordinal: 6,
    time: '2019-04-21T15:13:33.000Z',
    epoch: 0,
    slot: 200,
    last_update: '2019-05-21T23:14:51.899Z',
    tx_state: 'Successful',
  };

  // =====================
  //   shelley-simple-15
  // =====================

  const shelleySimple15 = {
    hash: '3677e75c7ba699bfdc6cd57d42f246f86f63aefd76025006ac78313fad2bba21',
    inputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '16',
        index: 16,
        amount: '10000000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '1',
        assets: [],
      },
      {
        // 0'/0/0
        // eslint-disable-next-line max-len
        // addr1qyv7qlaucathxkwkc503ujw0rv9lfj2rkj96feyst2rs9ey4tr5knj4fu4adelzqhxg8adu5xca4jra0gtllfrpcawyqzajfkn
        address:
          '0119e07fbcc7577359d6c51f1e49cf1b0bf4c943b48ba4e4905a8702e49558e969caa9e57adcfc40b9907eb794363b590faf42fff48c38eb88',
        amount: '5500000',
        assets: [],
      },
    ],
    height: 304,
    block_hash: '304',
    tx_ordinal: 0,
    time: '2019-04-20T15:16:53.000Z',
    epoch: 0,
    slot: 304,
    last_update: '2019-05-20T23:18:11.899Z',
    tx_state: 'Successful',
  };

  // =====================
  //   shelley-delegated
  // =====================

  const shelleyDelegatedTx1 = {
    hash: '3677e76c7ba699afdc6cd57d42f246f86f69aefd76025006ac78313fad2bba21',
    inputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '19',
        index: 19,
        amount: '8500000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '1',
        assets: [],
      },
      {
        // shelley-delegated base address index 0'/0/0
        // eslint-disable-next-line max-len
        // addr1qymwxh8y7pkdea6dyvrldnh6rtt5u9qxp0nd43dzn6c5y06kmdwdfzyussgs6n0fpsx4qw63hpzdk0n0mpuezgufjkas3clf5j
        address:
          '0136e35ce4f06cdcf74d2307f6cefa1ad74e14060be6dac5a29eb1423f56db5cd4889c84110d4de90c0d503b51b844db3e6fd87991238995bb',
        amount: '5500000',
        assets: [],
      },
    ],
    height: 100,
    block_hash: '100',
    tx_ordinal: 4,
    time: '2019-04-20T15:15:33.000Z',
    epoch: 0,
    slot: 100,
    last_update: '2019-05-20T23:16:51.899Z',
    tx_state: 'Successful',
  };
  const shelleyDelegatedTx2 = {
    hash: '3677e86c7ba699afdc1cd57d42f246f86f69aefd76025006ac78313fad2bba21',
    type: 'shelley',
    inputs: [
      {
        // shelley-delegated base address index 0'/0/0
        // eslint-disable-next-line max-len
        // addr1qymwxh8y7pkdea6dyvrldnh6rtt5u9qxp0nd43dzn6c5y06kmdwdfzyussgs6n0fpsx4qw63hpzdk0n0mpuezgufjkas3clf5j
        address:
          '0136e35ce4f06cdcf74d2307f6cefa1ad74e14060be6dac5a29eb1423f56db5cd4889c84110d4de90c0d503b51b844db3e6fd87991238995bb',
        txHash: shelleyDelegatedTx1.hash,
        id: shelleyDelegatedTx1.hash + '1',
        index: 1,
        amount: '5500000',
        assets: [],
      },
    ],
    outputs: [
      {
        // shelley-delegated base address index 0'/1/0
        // eslint-disable-next-line max-len
        // addr1qxnhwn2yw8utcxprcqxl0hx0v2wq2g304tc5wyzmhx6cvgzkmdwdfzyussgs6n0fpsx4qw63hpzdk0n0mpuezgufjkaswuh3qd
        address:
          '01a7774d4471f8bc1823c00df7dccf629c05222faaf147105bb9b5862056db5cd4889c84110d4de90c0d503b51b844db3e6fd87991238995bb',
        amount: '3000000',
        assets: [],
      },
    ],
    ttl: '500',
    fee: '500000',
    certificates: [
      {
        certIndex: 0,
        kind: (ShelleyCertificateTypes.StakeRegistration: 'StakeRegistration'),
        rewardAddress: 'e156db5cd4889c84110d4de90c0d503b51b844db3e6fd87991238995bb',
      },
      {
        certIndex: 1,
        kind: ShelleyCertificateTypes.StakeDelegation,
        rewardAddress: 'e156db5cd4889c84110d4de90c0d503b51b844db3e6fd87991238995bb',
        poolKeyHash: 'df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207', // YOROI
      },
    ],
    withdrawals: [],
    metadata: null,
    height: 200,
    block_hash: '200',
    tx_ordinal: 1,
    time: '2019-04-21T15:13:33.000Z',
    epoch: 0,
    slot: 200,
    last_update: '2019-05-21T23:14:51.899Z',
    tx_state: 'Successful',
  };

  // ============================
  //   shelley-ledger-delegated
  // ============================

  const shelleyLedgerDelegatedTx1 = {
    hash: '3699e76c7ba699afdc6cd57d42f246f86f69aefd76025006ac78313fad2bba21',
    inputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '20',
        index: 20,
        amount: '8500000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '1',
        assets: [],
      },
      {
        // shelley-ledger-delegated base address index 0'/0/0
        // eslint-disable-next-line max-len
        // addr1q82e70f6t2v5va99t2mvc894235wz5kfc32vhs5khf0c9xw7kz7vewkwsezwewajhr4el3axkrnnsr50qx05gdjd6psq4wu69r
        address:
          '01d59f3d3a5a994674a55ab6cc1cb55468e152c9c454cbc296ba5f8299deb0bcccbace8644ecbbb2b8eb9fc7a6b0e7380e8f019f44364dd060',
        amount: '5500000',
        assets: [],
      },
    ],
    height: 100,
    block_hash: '100',
    tx_ordinal: 5,
    time: '2019-04-20T15:15:33.000Z',
    epoch: 0,
    slot: 100,
    last_update: '2019-05-20T23:16:51.899Z',
    tx_state: 'Successful',
  };
  const shelleyLedgerDelegatedTx2 = {
    hash: '3688e86c7ba699afdc1cd57d42f246f86f69aefd76025006ac78313fad2bba21',
    type: 'shelley',
    inputs: [
      {
        // shelley-ledger-delegated base address index 0'/0/0
        // eslint-disable-next-line max-len
        // addr1q82e70f6t2v5va99t2mvc894235wz5kfc32vhs5khf0c9xw7kz7vewkwsezwewajhr4el3axkrnnsr50qx05gdjd6psq4wu69r
        address:
          '01d59f3d3a5a994674a55ab6cc1cb55468e152c9c454cbc296ba5f8299deb0bcccbace8644ecbbb2b8eb9fc7a6b0e7380e8f019f44364dd060',
        txHash: shelleyLedgerDelegatedTx1.hash,
        id: shelleyLedgerDelegatedTx1.hash + '1',
        index: 1,
        amount: '5500000',
        assets: [],
      },
    ],
    outputs: [
      {
        // shelley-ledger-delegated base address index 0'/1/0
        // eslint-disable-next-line max-len
        // addr1q9mhtwlxextzp4kqe04ycj7gus5j8gd5jaz42xsklslcdzx7kz7vewkwsezwewajhr4el3axkrnnsr50qx05gdjd6psq62plmk
        address:
          '017775bbe6c99620d6c0cbea4c4bc8e42923a1b49745551a16fc3f8688deb0bcccbace8644ecbbb2b8eb9fc7a6b0e7380e8f019f44364dd060',
        amount: '3000000',
        assets: [],
      },
    ],
    ttl: '500',
    fee: '500000',
    certificates: [
      {
        certIndex: 0,
        kind: (ShelleyCertificateTypes.StakeRegistration: 'StakeRegistration'),
        rewardAddress: 'e1deb0bcccbace8644ecbbb2b8eb9fc7a6b0e7380e8f019f44364dd060',
      },
      {
        certIndex: 1,
        kind: ShelleyCertificateTypes.StakeDelegation,
        rewardAddress: 'e1deb0bcccbace8644ecbbb2b8eb9fc7a6b0e7380e8f019f44364dd060',
        poolKeyHash: 'df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207', // YOROI
      },
    ],
    withdrawals: [],
    metadata: null,
    height: 200,
    block_hash: '200',
    tx_ordinal: 2,
    time: '2019-04-21T15:13:33.000Z',
    epoch: 0,
    slot: 200,
    last_update: '2019-05-21T23:14:51.899Z',
    tx_state: 'Successful',
  };

  // ============================
  //   shelley-just-registered
  // ============================

  const shelleyOnlyRegisteredTx1 = {
    hash: '3699e76c7b3456afdc6cd57d42f246f86f69aefd76025006ac78313fad2bba21',
    inputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '21',
        index: 21,
        amount: '8500000',
        assets: [],
      },
    ],
    outputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(testWallets['dump-wallet'].mnemonic, [
          WalletTypePurpose.BIP44,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          1,
        ]),
        amount: '1',
        assets: [],
      },
      {
        // shelley-just-registered base address index 0'/0/0
        // eslint-disable-next-line max-len
        // addr1q97p5s9fuhlymrqe2kr94krdfh6fujuvfyy67z53g7cmwrr4dsev5marcxj472jrtwfl5qqfzkc3udfwpckx66qyqp2q0j0e6c
        address:
          '017c1a40a9e5fe4d8c1955865ad86d4df49e4b8c4909af0a9147b1b70c756c32ca6fa3c1a55f2a435b93fa000915b11e352e0e2c6d68040054',
        amount: '5500000',
        assets: [],
      },
    ],
    height: 100,
    block_hash: '100',
    tx_ordinal: 7,
    time: '2019-04-20T15:15:33.000Z',
    epoch: 0,
    slot: 100,
    last_update: '2019-05-20T23:16:51.899Z',
    tx_state: 'Successful',
  };
  const shelleyOnlyRegisteredTx2 = {
    hash: '3456e86c7ba699afdc1cd57d42f246f86f69aefd76025006ac78313fad2bba21',
    type: 'shelley',
    inputs: [
      {
        // shelley-only-registered base address index 0'/0/0
        // eslint-disable-next-line max-len
        // addr1q97p5s9fuhlymrqe2kr94krdfh6fujuvfyy67z53g7cmwrr4dsev5marcxj472jrtwfl5qqfzkc3udfwpckx66qyqp2q0j0e6c
        address:
          '017c1a40a9e5fe4d8c1955865ad86d4df49e4b8c4909af0a9147b1b70c756c32ca6fa3c1a55f2a435b93fa000915b11e352e0e2c6d68040054',
        txHash: shelleyOnlyRegisteredTx1.hash,
        id: shelleyOnlyRegisteredTx1.hash + '1',
        index: 1,
        amount: '5500000',
        assets: [],
      },
    ],
    outputs: [
      {
        // shelley-only-registered base address index 0'/1/0
        // eslint-disable-next-line max-len
        // addr1qxzjfpfhwq4474fk7ruxsjh59s9g2n504jm6reug68zwx2t4dsev5marcxj472jrtwfl5qqfzkc3udfwpckx66qyqp2qgde07v
        address:
          '0185248537702b5f5536f0f8684af42c0a854e8facb7a1e788d1c4e329756c32ca6fa3c1a55f2a435b93fa000915b11e352e0e2c6d68040054',
        amount: '3000000',
        assets: [],
      },
    ],
    ttl: '500',
    fee: '500000',
    certificates: [
      {
        certIndex: 0,
        kind: (ShelleyCertificateTypes.StakeRegistration: 'StakeRegistration'),
        rewardAddress: 'e1756c32ca6fa3c1a55f2a435b93fa000915b11e352e0e2c6d68040054',
      },
    ],
    withdrawals: [],
    metadata: null,
    height: 200,
    block_hash: '200',
    tx_ordinal: 3,
    time: '2019-04-21T15:13:33.000Z',
    epoch: 0,
    slot: 200,
    last_update: '2019-05-21T23:14:51.899Z',
    tx_state: 'Successful',
  };

  // ===================
  //   shelley-mangled
  // ===================

  const delegateMangledWallet = {
    hash: '3456e86c7ba799afda1cd57d425946f86f69aefd76025006ac78313fad2bba21',
    type: 'shelley',
    inputs: [
      {
        // eslint-disable-next-line max-len
        // TODO
        address: getAddressForType(
          testWallets['shelley-mangled'].mnemonic,
          [
            WalletTypePurpose.CIP1852,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0,
          ],
          CoreAddressTypes.CARDANO_BASE
        ),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '25',
        index: 25,
        amount: '3500000',
        assets: [],
      },
    ],
    outputs: [
      {
        // eslint-disable-next-line max-len
        // TODO
        address: getAddressForType(
          testWallets['shelley-mangled'].mnemonic,
          [
            WalletTypePurpose.CIP1852,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.INTERNAL,
            1,
          ],
          CoreAddressTypes.CARDANO_BASE
        ),
        amount: '1000000',
        assets: [],
      },
    ],
    ttl: '500',
    fee: '500000',
    certificates: [
      {
        certIndex: 0,
        kind: (ShelleyCertificateTypes.StakeRegistration: 'StakeRegistration'),
        // TODO: bech32 address
        rewardAddress: getAddressForType(
          testWallets['shelley-mangled'].mnemonic,
          [
            WalletTypePurpose.CIP1852,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.CHIMERIC_ACCOUNT,
            0,
          ],
          CoreAddressTypes.CARDANO_REWARD
        ),
      },
      {
        certIndex: 1,
        kind: ShelleyCertificateTypes.StakeDelegation,
        // TODO: bech32 address
        rewardAddress: getAddressForType(
          testWallets['shelley-mangled'].mnemonic,
          [
            WalletTypePurpose.CIP1852,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.CHIMERIC_ACCOUNT,
            0,
          ],
          CoreAddressTypes.CARDANO_REWARD
        ),
        poolKeyHash: 'df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207', // YOROI
      },
    ],
    withdrawals: [],
    metadata: null,
    height: 200,
    block_hash: '200',
    tx_ordinal: 4,
    time: '2019-04-21T15:13:33.000Z',
    epoch: 0,
    slot: 200,
    last_update: '2019-05-21T23:14:51.899Z',
    tx_state: 'Successful',
  };

  return {
    genesisTx,
    distributorTx,
    pendingTx1,
    pendingTx2,
    manyTx1,
    manyTx2,
    manyTx3,
    manyTx4,
    useChange,
    postLaunchSuccessfulTx,
    postLaunchPendingTx,
    failedTx,
    ledgerTx1,
    cip1852LedgerTx1,
    bip44TrezorTx1,
    bip44TrezorTx2,
    bip44TrezorTx3,
    cip1852TrezorTx1,
    cip1852TrezorTx2,
    shelleySimple15,
    shelleyDelegatedTx1,
    shelleyDelegatedTx2,
    shelleyLedgerDelegatedTx1,
    shelleyLedgerDelegatedTx2,
    shelleyOnlyRegisteredTx1,
    shelleyOnlyRegisteredTx2,
    delegateMangledWallet,
  };
};

// =================
//   Manage state
// =================

const transactions: Array<MockTx> = [];

export function addTransaction(tx: MockTx): void {
  // need to insert txs in order they appear in the blockchain
  // note: pending transactions always go at the end
  if (tx.epoch == null || tx.slot == null || tx.tx_ordinal == null) {
    transactions.push(tx);
    return;
  }
  const newTxEpoch = tx.epoch;
  const newTxSlot = tx.slot;
  const newTxOrdinal = tx.tx_ordinal;

  const insertionIndex = transactions.findIndex(mockChainTx => {
    const epoch = mockChainTx.epoch;
    const slot = mockChainTx.slot;
    const txOrdinal = mockChainTx.tx_ordinal;

    if (epoch == null) return true;
    if (epoch > newTxEpoch) return true;
    if (epoch < newTxEpoch) return false;
    if (slot == null) return true;
    if (slot > newTxSlot) return true;
    if (slot < newTxSlot) return false;
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
export function resetChain(chainToUse: $Values<typeof MockChain>): void {
  // want to keep reference the same
  while (transactions.length > 0) {
    transactions.pop();
  }

  const txs = generateTransaction();

  if (chainToUse === MockChain.Standard) {
    // test setup
    addTransaction(txs.genesisTx);
    addTransaction(txs.distributorTx);
    // simple-pending-wallet
    addTransaction(txs.pendingTx1);
    addTransaction(txs.pendingTx2);
    // many-tx-wallet
    addTransaction(txs.manyTx1);
    addTransaction(txs.manyTx2);
    addTransaction(txs.manyTx3);
    addTransaction(txs.manyTx4);
    addTransaction(txs.useChange);
    // failed-single-tx
    addTransaction(txs.failedTx);
    // ledger-wallet
    addTransaction(txs.ledgerTx1);
    addTransaction(txs.cip1852LedgerTx1);
    // trezor-wallet
    addTransaction(txs.bip44TrezorTx1);
    addTransaction(txs.bip44TrezorTx2);
    addTransaction(txs.bip44TrezorTx3);
    addTransaction(txs.cip1852TrezorTx1);
    addTransaction(txs.cip1852TrezorTx2);
    // shelley-simple-15
    addTransaction(txs.shelleySimple15);
    // shelley-delegated
    addTransaction(txs.shelleyDelegatedTx1);
    addTransaction(txs.shelleyDelegatedTx2);
    // shelley-ledger-delegated
    addTransaction(txs.shelleyLedgerDelegatedTx1);
    addTransaction(txs.shelleyLedgerDelegatedTx2);
    // shelley-only-registered
    addTransaction(txs.shelleyOnlyRegisteredTx1);
    addTransaction(txs.shelleyOnlyRegisteredTx2);
    // shelley-mangled
    addTransaction(txs.delegateMangledWallet);
  } else if (chainToUse === MockChain.TestAssurance) {
    // test setup
    addTransaction(txs.genesisTx);
    addTransaction(txs.distributorTx);

    // setup wallet that will send the tx to move the best block
    addTransaction(txs.manyTx1);
    addTransaction(txs.manyTx2);
    addTransaction(txs.manyTx3);
    addTransaction(txs.manyTx4);
    addTransaction(txs.useChange);
  }
}

// =========================
//   server-status
// =========================
const apiStatuses: Array<ServerStatusResponse> = [];

const setServerStatus = (serverStatus: ServerStatusResponse) => {
  apiStatuses[0] = serverStatus;
};

const initialServerOk: ServerStatusResponse = {
  isServerOk: true,
  isMaintenance: false,
  // set the server time far into the future so that TTL is consistent
  serverTime: 1893456000 * 1000,
};

setServerStatus(initialServerOk);

export function serverIssue() {
  setServerStatus({
    isServerOk: false,
    isMaintenance: false,
    serverTime: new Date().getTime(),
  });
}
export function serverFixed() {
  setServerStatus(initialServerOk);
}

export function appMaintenance() {
  setServerStatus({
    isServerOk: true,
    isMaintenance: true,
    serverTime: new Date().getTime(),
  });
}
export function appMaintenanceFinish() {
  setServerStatus(initialServerOk);
}

function getApiStatus(): ServerStatusResponse {
  return apiStatuses[0];
}

const usedAddresses: FilterFunc = genCheckAddressesInUse(transactions, networks.CardanoMainnet);
const history: HistoryFunc = genGetTransactionsHistoryForAddresses(
  transactions,
  networks.CardanoMainnet
);
const getBestBlock: BestBlockFunc = genGetBestBlock(transactions);
const utxoForAddresses: AddressUtxoFunc = genUtxoForAddresses(
  history,
  getBestBlock,
  networks.CardanoMainnet
);
const utxoSumForAddresses: UtxoSumFunc = genUtxoSumForAddresses(utxoForAddresses);
const sendTx = (request: SignedRequestInternal): SignedResponse => {
  const remoteTx = toRemoteByronTx(transactions, request);

  addTransaction(remoteTx);
  return { txId: remoteTx.hash };
};

const getPoolInfo: PoolInfoFunc = genGetPoolInfo();
const getRewardHistory: RewardHistoryFunc = async (
  _body: RewardHistoryRequest
): Promise<RewardHistoryResponse> => {
  return {
    e19558e969caa9e57adcfc40b9907eb794363b590faf42fff48c38eb88: [
      {
        epoch: 210,
        reward: '5000000',
        poolHash: 'df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207',
      },
    ],
    e156db5cd4889c84110d4de90c0d503b51b844db3e6fd87991238995bb: [
      {
        epoch: 210,
        reward: '5000000',
        poolHash: 'df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207',
      },
    ],
    e164238bc39c962aa28156a45a461213770d88d808896785f92c3aa4d2: [
      {
        epoch: 210,
        reward: '5000000',
        poolHash: 'df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207',
      },
    ],
    e1deb0bcccbace8644ecbbb2b8eb9fc7a6b0e7380e8f019f44364dd060: [
      {
        epoch: 210,
        reward: '5000000',
        poolHash: 'c34a7f59c556633dc88ec25c9743c5ebca3705e179a54db5638941cb',
      },
    ],
  };
};

const getAccountState: AccountStateFunc = async request => {
  const totalRewards = new BigNumber(5000000);
  const totalWithdrawals = new BigNumber(0);

  // no good way to mock this since it's not implicitly stored in the chain
  // with the exception of MIR certificates
  const accountStateMap = new Map<string, RemoteAccountState>([
    [
      // shelley-simple-15
      'e19558e969caa9e57adcfc40b9907eb794363b590faf42fff48c38eb88',
      {
        poolOperator: null,
        remainingAmount: totalRewards.minus(totalWithdrawals).toString(),
        rewards: totalRewards.toString(),
        withdrawals: totalWithdrawals.toString(),
      },
    ],
    [
      // shelley-delegated
      'e156db5cd4889c84110d4de90c0d503b51b844db3e6fd87991238995bb',
      {
        poolOperator: null,
        remainingAmount: totalRewards.minus(totalWithdrawals).toString(),
        rewards: totalRewards.toString(),
        withdrawals: totalWithdrawals.toString(),
      },
    ],
    [
      // shelley-ledger-delegated
      'e1deb0bcccbace8644ecbbb2b8eb9fc7a6b0e7380e8f019f44364dd060',
      {
        poolOperator: null,
        remainingAmount: totalRewards.minus(totalWithdrawals).toString(),
        rewards: totalRewards.toString(),
        withdrawals: totalWithdrawals.toString(),
      },
    ],
    [
      // shelley-trezor
      'e164238bc39c962aa28156a45a461213770d88d808896785f92c3aa4d2',
      {
        poolOperator: null,
        remainingAmount: totalRewards.minus(totalWithdrawals).toString(),
        rewards: totalRewards.toString(),
        withdrawals: totalWithdrawals.toString(),
      },
    ],
  ]);

  const result: {| [key: string]: null | RemoteAccountState |} = {};
  for (const addr of request.addresses) {
    result[addr] = accountStateMap.get(addr) ?? null;
  }

  return result;
};

const mockScriptOutputs = [
  {
    txHash: '156f481d054e1e2798ef3cae84c0e7902b6ec18641c571d54c913e489327ab2d',
    txIndex: 0,
    output: {
      address:
        '31d7a345ebead42207d4321763c8172869843254c81d007dfa2a7ee279d7a345ebead42207d4321763c8172869843254c81d007dfa2a7ee279',
      amount: '2000000',
      dataHash: null,
      assets: [],
    },
    spendingTxHash: '4a3f86762383f1d228542d383ae7ac89cf75cf7ff84dec8148558ea92b0b92d0',
  },
  {
    txHash: 'e7db1f809fcc21d3dd108ced6218bf0f0cbb6a0f679f848ff1790b68d3a35872',
    txIndex: 0,
    output: {
      address: 'addr1w9jur974vh5g5gygtef4lym426pygnfuqt75fhts3ql738sez7sqy',
      amount: '1000000',
      dataHash: null,
      assets: [
        {
          assetId: '3652a89686608c45ca5b7768f44a961fe0e3459e21db4ea61b713aa6.4465764578',
          policyId: '3652a89686608c45ca5b7768f44a961fe0e3459e21db4ea61b713aa6',
          name: '4465764578',
          amount: '10',
        },
      ],
    },
    spendingTxHash: null,
  },
];

const getUtxoData = (txHash: string, txIndex: number): UtxoData | null => {
  const output = mockScriptOutputs.find(
    entry => entry.txHash === txHash && entry.txIndex === txIndex
  );
  if (!output) {
    return null;
  }
  return {
    output: output.output,
    spendingTxHash: output.spendingTxHash,
  };
};

export default {
  utxoForAddresses,
  utxoSumForAddresses,
  usedAddresses,
  getApiStatus,
  history,
  getBestBlock,
  sendTx,
  getPoolInfo,
  getRewardHistory,
  getAccountState,
  getUtxoData,
};
