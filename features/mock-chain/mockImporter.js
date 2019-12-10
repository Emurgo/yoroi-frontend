// @flow

import cryptoRandomString from 'crypto-random-string';
import type { SignedRequestInternal, SignedResponse, RemoteTransaction } from '../../app/api/ada/lib/state-fetch/types';
import {
  genGetTransactionsHistoryForAddresses,
  genGetBestBlock,
  genCheckAddressesInUse,
  genUtxoForAddresses,
  genUtxoSumForAddresses,
  getAddressForType,
  getSingleAddressString,
  toRemoteTx,
} from '../../app/api/ada/lib/storage/bridge/tests/mockNetwork';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
} from '../../app/config/numbersConfig';
import { testWallets } from './TestWallets';

const isShelley = true;

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
}

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
const utxoForAddresses = genUtxoForAddresses(
  history,
  getBestBlock,
);
const utxoSumForAddresses = genUtxoSumForAddresses(utxoForAddresses);
const sendTx = (request: SignedRequestInternal): SignedResponse => {
  const remoteTx = toRemoteTx(transactions, request);
  addTransaction(remoteTx);
  return { txId: remoteTx.hash };
};

export default {
  utxoForAddresses,
  utxoSumForAddresses,
  usedAddresses,
  getApiStatus,
  history,
  getBestBlock,
  sendTx,
};
