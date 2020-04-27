// @flow

import cryptoRandomString from 'crypto-random-string';
import type {
  SignedRequestInternal, SignedResponse,
  RemoteTransaction,
  ServerStatusResponse,
  TxBodiesFunc,
} from '../../app/api/ada/lib/state-fetch/types';
import {
  genGetTransactionsHistoryForAddresses,
  genGetRewardHistory,
  genGetBestBlock,
  genCheckAddressesInUse,
  genUtxoForAddresses,
  genUtxoSumForAddresses,
  genGetAccountState,
  genGetPoolInfo,
  genGetReputation,
  getAddressForType,
  getSingleAddressString,
  toRemoteJormungandrTx,
  toRemoteByronTx,
} from '../../app/api/ada/lib/storage/bridge/tests/mockNetwork';
import { CoreAddressTypes } from '../../app/api/ada/lib/storage/database/primitives/enums';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
} from '../../app/config/numbersConfig';
import { testWallets } from './TestWallets';
import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';

const isShelley = false;

// based on abandon x 14 + share
const genesisTransaction = '52929ce6f1ab83b439e65f6613bad9590bd264c0d6c4f910e36e2369bb987b35';
const genesisAddress = 'Ae2tdPwUPEZLs4HtbuNey7tK4hTKrwNwYtGqp7bDfCy2WdR3P6735W5Yfpe';
const genesisTxValue = 2000000000000000; // 2 billion ada

// based on abandon x14 + address
const genesisTxReceiver = 'Ae2tdPwUPEZ4YjgvykNpoFeYUxoyhNj2kg8KfKWN2FizsSpLUPv68MpTVDo';

type MockTx = RemoteTransaction;

/**
 * To simplify, our genesis is a single address which gives all its ada to a "distributor"
 * The distributor gives ADA to a bunch of addresses to setup the tests
 *
 * You can generate more data for these tests using the Cardano-Wallet WASM library
 */

export const generateTransction = () => {
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
      {
        // Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc
        address: getSingleAddressString(
          testWallets['small-single-tx'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ]
        ),
        amount: '20295'
      },
      // tx-big-input-wallet
      {
        // Ae2tdPwUPEYx2dK1AMzRN1GqNd2eY7GCd7Z6aikMPJL3EkqqugoFQComQnV
        address: getSingleAddressString(
          testWallets['tx-big-input-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ]
        ),
        amount: '1234567898765'
      },
      // simple-pending-wallet
      {
        // Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ
        address: getSingleAddressString(
          testWallets['simple-pending-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ]
        ),
        amount: '1000000'
      },
      {
        // Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ
        address: getSingleAddressString(
          testWallets['simple-pending-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ]
        ),
        amount: '1000000'
      },
      {
        // Ae2tdPwUPEZ9uHfzhw3vXUrTFLowct5hMMHeNjfsrkQv5XSi5PhSs2yRNUb
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ]
        ),
        amount: '1000000'
      },
      {
        // Ae2tdPwUPEZEXbmLnQ22Rxhv8a6hQ3C2673nkGsXKAgzqnuC1vqne9EtBkK
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            1
          ]
        ),
        amount: '1000000'
      },
      {
        // Ae2tdPwUPEYwBZD5hPWCm3PUDYdMBfnLHsQmgUiexnkvDMTFCQ4gzRkgAEQ
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            2
          ]
        ),
        amount: '1000000'
      },
      {
        // Ae2tdPwUPEYvzFpWJEGmSjLdz3DNY9WL5CbPjsouuM5M6YMsYWB1vsCS8j4
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            3
          ]
        ),
        amount: '1000000'
      },
      // failed-single-tx
      {
        // Ae2tdPwUPEYw8ScZrAvKbxai1TzG7BGC4n8PoF9JzE1abgHc3gBfkkDNBNv
        address: getSingleAddressString(
          testWallets['failed-single-tx'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ]
        ),
        amount: '1000000'
      },
      // daedalus addresses
      { address: 'DdzFFzCqrhstBgE23pfNLvukYhpTPUKgZsXWLN5GsawqFZd4Fq3aVuGEHk11LhfMfmfBCFCBGrdZHVExjiB4FY5Jkjj1EYcqfTTNcczb', amount: '500000' },
      { address: 'DdzFFzCqrht74dr7DYmiyCobGFQcfLCsHJCCM6nEBTztrsEk5kwv48EWKVMFU9pswAkLX9CUs4yVhVxqZ7xCVDX1TdatFwX5W39cohvm', amount: '500000' },
      // paper wallet
      { address: 'Ae2tdPwUPEZ7TQpzbJZCbA5BjW4zWYFn47jKo43ouvfe4EABoCfvEjwYvJr', amount: '500000' },
      // abandon/address
      {
        // eslint-disable-next-line max-len
        // addr1sjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsghptz42
        address: getAddressForType(
          testWallets['shelley-test'].mnemonic,
          [
            WalletTypePurpose.CIP1852,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ],
          CoreAddressTypes.SHELLEY_GROUP
        ),
        amount: '2100000'
      },
      // dump-wallet
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(
          testWallets['dump-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            1
          ],
        ),
        amount: '2000000'
      },
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(
          testWallets['dump-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            1
          ],
        ),
        amount: '3000000'
      },
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(
          testWallets['dump-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            1
          ],
        ),
        amount: '2000000'
      },
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(
          testWallets['dump-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            1
          ],
        ),
        amount: '2000000'
      },
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
        // Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ
        address: getSingleAddressString(
          testWallets['simple-pending-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ]
        ),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '2',
        index: 2,
        amount: '1000000'
      }
    ],
    outputs: [
      {
        // Ae2tdPwUPEYw3yJyPX1LWKXpuUjKAt57TLdR5fF61PRvUyswE3m7WrKNbrr
        address: getSingleAddressString(
          testWallets['simple-pending-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            1
          ]
        ),
        amount: '1'
      },
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
        // Ae2tdPwUPEZ9ySSM18e2QGFnCgL8ViDqp8K3wU4i5DYTSf5w6e1cT2aGdSJ
        address: getSingleAddressString(
          testWallets['simple-pending-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ]
        ),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '3',
        index: 3,
        amount: '1000000'
      }
    ],
    outputs: [
      {
        // Ae2tdPwUPEYwEnNsuY9uMAphecEWipHKEy9g8yZCJTJm4zxV1sTrQfTxPVX
        address: getSingleAddressString(
          testWallets['simple-pending-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            2
          ]
        ),
        amount: '1'
      },
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
        // Ae2tdPwUPEZ9uHfzhw3vXUrTFLowct5hMMHeNjfsrkQv5XSi5PhSs2yRNUb
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ]
        ),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '4',
        index: 4,
        amount: '1000000'
      }
    ],
    outputs: [
      {
        // Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            9
          ]
        ),
        amount: '1'
      },
      {
        // Ae2tdPwUPEZ77uBBu8cMVxswVy1xfaMZR9wsUSwDNiB48MWqsVWfitHfUM9
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.INTERNAL,
            0
          ]
        ),
        amount: '820000'
      },
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
        // Ae2tdPwUPEZEXbmLnQ22Rxhv8a6hQ3C2673nkGsXKAgzqnuC1vqne9EtBkK
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            1
          ]
        ),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '5',
        index: 5,
        amount: '1000000'
      }
    ],
    outputs: [
      {
        // Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            9
          ]
        ),
        amount: '1'
      },
      {
        // Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.INTERNAL,
            1
          ]
        ),
        amount: '820000'
      },
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
        // Ae2tdPwUPEYwBZD5hPWCm3PUDYdMBfnLHsQmgUiexnkvDMTFCQ4gzRkgAEQ
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            2
          ]
        ),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '6',
        index: 6,
        amount: '1000000'
      }
    ],
    outputs: [
      {
        // Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            9
          ]
        ),
        amount: '1'
      },
      {
        // Ae2tdPwUPEZJZPsFg8w5bXA4brfu8peYy5prmrFiYPACb7DX64iiBY8WvHD
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.INTERNAL,
            2
          ]
        ),
        amount: '820000'
      },
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
        // Ae2tdPwUPEYvzFpWJEGmSjLdz3DNY9WL5CbPjsouuM5M6YMsYWB1vsCS8j4
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            3
          ]
        ),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '7',
        index: 7,
        amount: '1000000'
      }
    ],
    outputs: [
      {
        // Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            9
          ]
        ),
        amount: '1'
      },
      {
        // Ae2tdPwUPEZHG9AGUYWqFcM5zFn74qdEx2TqyZxuU68CQ33EBodWAVJ523w
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.INTERNAL,
            3
          ]
        ),
        amount: '820000'
      },
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
        // Ae2tdPwUPEZ77uBBu8cMVxswVy1xfaMZR9wsUSwDNiB48MWqsVWfitHfUM9
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.INTERNAL,
            0
          ]
        ),
        txHash: manyTx1.hash,
        id: manyTx1.hash + '1',
        index: 1,
        amount: '820000'
      }
    ],
    outputs: [
      {
        // Ae2tdPwUPEYzkKjrqPw1GHUty25Cj5fWrBVsWxiQYCxfoe2d9iLjTnt34Aj
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            30
          ]
        ),
        amount: '1'
      },
      {
        // Ae2tdPwUPEZ7VKG9jy6jJTxQCWNXoMeL2Airvzjv3dc3WCLhSBA7XbSMhKd
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.INTERNAL,
            4
          ]
        ),
        amount: '650000'
      },
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

  const postLaunchSuccessfulTx = {
    hash: '350632adedd456cf607ed01a84f8c6c49d32f17e0e63447be7f7b69cb37ef446',
    inputs: [
      {
        // Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.INTERNAL,
            1
          ]
        ),
        txHash: manyTx2.hash,
        id: manyTx2.hash + '1',
        index: 1,
        amount: '820000'
      }
    ],
    outputs: [
      {
        // Ae2tdPwUPEZCdSLM7bHhoC6xptW9SRW155PFFf4WYCKnpX4JrxJPmFzi6G2
        address: getSingleAddressString(
          testWallets['dump-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ]
        ),
        amount: '500000'
      },
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

  const postLaunchPendingTx = {
    hash: '350632adedd456cf607ed01a84f8c6c49d32f17e0e63447be7f7b69cb37ef446',
    inputs: [
      {
        // Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3
        address: getSingleAddressString(
          testWallets['many-tx-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.INTERNAL,
            1
          ]
        ),
        txHash: manyTx2.hash,
        id: manyTx2.hash + '1',
        index: 1,
        amount: '820000'
      }
    ],
    outputs: [
      {
        // Ae2tdPwUPEZCdSLM7bHhoC6xptW9SRW155PFFf4WYCKnpX4JrxJPmFzi6G2
        address: getSingleAddressString(
          testWallets['dump-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ]
        ),
        amount: '500000'
      },
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
        // Ae2tdPwUPEYw8ScZrAvKbxai1TzG7BGC4n8PoF9JzE1abgHc3gBfkkDNBNv
        address: getSingleAddressString(
          testWallets['failed-single-tx'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ]
        ),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '8',
        index: 8,
        amount: '1000000'
      }
    ],
    outputs: [
      {
        // Ae2tdPwUPEZCdSLM7bHhoC6xptW9SRW155PFFf4WYCKnpX4JrxJPmFzi6G2
        address: getSingleAddressString(
          testWallets['dump-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ]
        ),
        amount: '1'
      },
      {
        // Ae2tdPwUPEZCqWsJkibw8BK2SgbmJ1rRG142Ru1CjSnRvKwDWbL4UYPN3eU
        address: getSingleAddressString(
          testWallets['failed-single-tx'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.INTERNAL,
            0
          ]
        ),
        amount: '820000'
      },
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

  // ================
  //   shelley-test
  // ================

  const certificateTx = {
    hash: cryptoRandomString({ length: 64 }),
    inputs: [
      {
        // eslint-disable-next-line max-len
        // addr1sjag9rgwe04haycr283datdrjv3mlttalc2waz34xcct0g4uvf6gdg3dpwrsne4uqng3y47ugp2pp5dvuq0jqlperwj83r4pwxvwuxsghptz42
        address: getAddressForType(
          testWallets['shelley-test'].mnemonic,
          [
            WalletTypePurpose.CIP1852,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ],
          CoreAddressTypes.SHELLEY_GROUP
        ),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '12',
        index: 12,
        amount: '2100000'
      }
    ],
    outputs: [
      {
        address: getAddressForType(
          testWallets['shelley-test'].mnemonic,
          [
            WalletTypePurpose.CIP1852,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.INTERNAL,
            0
          ],
          CoreAddressTypes.SHELLEY_GROUP
        ),
        amount: '2099990'
      },
    ],
    certificate: {
      payloadKind: 'StakeDelegation',
      payloadKindId: RustModule.WalletV3.CertificateKind.StakeDelegation,
      // delegates all ADA to pool 312e3d449038372ba2fc3300cfedf1b152ae739201b3e5da47ab3f933a421b62
      payloadHex: 'a22d0b8709e6bc04d11257dc405410d1ace01f207c391ba4788ea17198ee1a0801312e3d449038372ba2fc3300cfedf1b152ae739201b3e5da47ab3f933a421b62',
    },
    height: 100,
    block_hash: '100',
    tx_ordinal: 3,
    time: '2019-04-20T15:15:33.000Z',
    epoch: 0,
    slot: 100,
    last_update: '2019-05-20T23:16:51.899Z',
    tx_state: 'Successful'
  };

  // =================
  //   ledger-wallet
  // =================

  const ledgerTx1 = {
    hash: '166dfde5b183b7e09483afbbfce7b41e7d6fed34b405cc1041b45f27e8b05d47',
    inputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(
          testWallets['dump-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            1
          ]
        ),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '13',
        index: 13,
        amount: '2000000'
      }
    ],
    outputs: [
      {
        // Ae2tdPwUPEYyHfxoQYGPhyHuAfLHKfLubzo4kxyw2XDnLsLmACtjufaBs33
        address: getSingleAddressString(
          testWallets['ledger-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            0
          ],
          true
        ),
        amount: '638497'
      },
    ],
    height: 300,
    block_hash: '300',
    tx_ordinal: 0,
    time: '2019-04-20T15:15:33.000Z',
    epoch: 0,
    slot: 300,
    last_update: '2019-05-20T23:16:51.899Z',
    tx_state: 'Successful'
  };

  // =================
  //   trezor-wallet
  // =================

  const trezorTx1 = {
    hash: '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba20',
    inputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(
          testWallets['dump-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            1
          ]
        ),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '14',
        index: 14,
        amount: '3000000'
      }
    ],
    outputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(
          testWallets['dump-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            1
          ]
        ),
        amount: '1'
      },
      {
        // Ae2tdPwUPEZ9qgUrkrTqqTa5iKkaURYNFqM1gSbPXicn21LYyF184ZXnQ5R
        address: getSingleAddressString(
          testWallets['trezor-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.INTERNAL,
            2
          ],
        ),
        amount: '2832006'
      },
    ],
    height: 301,
    block_hash: '301',
    tx_ordinal: 1,
    time: '2019-04-20T15:15:53.000Z',
    epoch: 0,
    slot: 301,
    last_update: '2019-05-20T23:17:11.899Z',
    tx_state: 'Successful'
  };
  const trezorTx2 = {
    hash: '058405892f66075d83abd1b7fe341d2d5bfd2f6122b2f874700039e5078e0dd5',
    inputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(
          testWallets['dump-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            1
          ]
        ),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '15',
        index: 15,
        amount: '2000000'
      }
    ],
    outputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(
          testWallets['dump-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            1
          ]
        ),
        amount: '1'
      },
      {
        // Ae2tdPwUPEZLmqiKtMQ4kKL38emRfkyPqBsHqL64pf8uRz6uzsQCd7GAu9R
        address: getSingleAddressString(
          testWallets['trezor-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.INTERNAL,
            1
          ],
        ),
        amount: '1494128'
      },
    ],
    height: 302,
    block_hash: '302',
    tx_ordinal: 1,
    time: '2019-04-20T15:16:13.000Z',
    epoch: 0,
    slot: 302,
    last_update: '2019-05-20T23:17:31.899Z',
    tx_state: 'Successful'
  };
  const trezorTx3 = {
    hash: '1029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3657',
    inputs: [
      {
        // Ae2tdPwUPEZ2y4rAdJG2coM4MXeNNAAKDztXXztz8LrcYRZ8waYoa7pWXgj
        address: getSingleAddressString(
          testWallets['dump-wallet'].mnemonic,
          [
            WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            1
          ]
        ),
        txHash: distributorTx.hash,
        id: distributorTx.hash + '16',
        index: 16,
        amount: '2000000'
      }
    ],
    outputs: [
      {
        // Ae2tdPwUPEYw66yGJJfbzNxTerpKV3zQRcd746cUtNSFgAGSYx1YLHnQW6c
        address: getSingleAddressString(
          testWallets['trezor-wallet'].mnemonic,
          [
            isShelley ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            7
          ],
        ),
        amount: '1000000'
      },
    ],
    height: 303,
    block_hash: '303',
    tx_ordinal: 0,
    time: '2019-04-20T15:16:33.000Z',
    epoch: 0,
    slot: 303,
    last_update: '2019-05-20T23:17:51.899Z',
    tx_state: 'Successful'
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
    certificateTx,
    ledgerTx1,
    trezorTx1,
    trezorTx2,
    trezorTx3,
  };
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

  const txs = generateTransction();
  // test setup
  addTransaction(txs.genesisTx);
  addTransaction(txs.distributorTx);
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
  // shelley-test
  if (isShelley) {
    addTransaction(txs.certificateTx);
  }
  // ledger-wallet
  addTransaction(txs.ledgerTx1);
  // trezor-wallet
  addTransaction(txs.trezorTx1);
  addTransaction(txs.trezorTx2);
  addTransaction(txs.trezorTx3);
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
};

setServerStatus(initialServerOk);

export function serverIssue() {
  setServerStatus({
    isServerOk: false,
    isMaintenance: false,
  });
}
export function serverFixed() {
  setServerStatus({
    isServerOk: true,
    isMaintenance: false,
  });
}

export function appMaintenance() {
  setServerStatus({
    isServerOk: true,
    isMaintenance: true,
  });
}
export function appMaintenanceFinish() {
  setServerStatus({
    isServerOk: true,
    isMaintenance: false,
  });
}

function getApiStatus(): ServerStatusResponse {
  return apiStatuses[0];
}


const usedAddresses = genCheckAddressesInUse(transactions);
const history = genGetTransactionsHistoryForAddresses(transactions);
const getBestBlock = genGetBestBlock(transactions);
const utxoForAddresses = genUtxoForAddresses(
  history,
  getBestBlock,
);
const utxoSumForAddresses = genUtxoSumForAddresses(utxoForAddresses);
const sendTx = (request: SignedRequestInternal): SignedResponse => {
  const remoteTx = isShelley
    ? toRemoteJormungandrTx(transactions, request)
    : toRemoteByronTx(transactions, request);

  addTransaction(remoteTx);
  return { txId: remoteTx.hash };
};
const getAccountState = genGetAccountState(transactions);
const getPoolInfo = genGetPoolInfo(transactions);
const getReputation = genGetReputation();
const getRewardHistory = genGetRewardHistory();
const getTxsBodiesForUTXOs: TxBodiesFunc = async req => {
  const result = {};
  for (const hash of req.txsHashes) {
    if (hash === '166dfde5b183b7e09483afbbfce7b41e7d6fed34b405cc1041b45f27e8b05d47') {
      result[hash] = '839f8200d818582482582000665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f008200d818582482582000665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f01ff9f8282d818582183581c18ddda3e6ad67cfa6e91357e75f565835b86379e8f3f22f60fa8a312a0001a9c55fede1a0009be21ffa0';
    } else if (hash === '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba20') {
      result[hash] = '839f8200d8185824825820591267207e36e03789c74b282cce9d0637325d46d6bd5b9a27fe6e75abf1b08700ff9f8282d818582183581ce999ddf0e7b22ffdc8a6ea041ba4b1382c4834fd553f308c407d9e1aa0001a8132b4e41a001e84808282d818582183581c829e3e4cecea3cd73fae255123bef7be317ed0ac3be40c1616ade9fea0001ab3ff94641a002b3686ffa0';
    } else if (hash === '058405892f66075d83abd1b7fe341d2d5bfd2f6122b2f874700039e5078e0dd5') {
      result[hash] = '839f8200d8185824825820c54e97f5d6fa9b1170a986d081dc860f9721e253b40c0c6b79edbab922f235f201ff9f8282d818582183581c429bfc0da2711bf754edc60f6ec0349c4fb02eabfd5b66597d25a9e3a0001a1d25653f1a000f42408282d818582183581cf03274dad3c7a1b7aa3951a4cdecc167d5c17d82f3cbfb291f71d2c2a0001a98ca71d01a0016cc70ffa0';
    } else if (hash === '1029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3657') {
      result[hash] = '839f8200d81858248258202bddf3710ee44383a5a9f53aee9f3e27d1d8382537b8b21b30e6314c2897664b00ff9f8282d818582183581c02d2cf0eca7f55fdce2f4c51a307583f50eae31c052c934ae59bf704a0001a0a0584011a000f42408282d818582183581ca3f6cfcb530b5c1d148a07707baef7fea7d61217117903c4109694d2a0001a3dca8fd51a000a0a5cffa0';
    } else {
      throw new Error(`Txhash found with no body ${hash}`);
    }
  }
  return result;
};

export default {
  utxoForAddresses,
  utxoSumForAddresses,
  usedAddresses,
  getApiStatus,
  history,
  getRewardHistory,
  getTxsBodiesForUTXOs,
  getBestBlock,
  getAccountState,
  getPoolInfo,
  getReputation,
  sendTx,
};
