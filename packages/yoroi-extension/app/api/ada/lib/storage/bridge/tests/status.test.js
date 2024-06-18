// @flow

import BigNumber from 'bignumber.js';
import {
  schema,
} from 'lovefield';
import '../../../test-config.forTests';
import type { RemoteTransaction, RemoteTxBlockMeta, } from '../../../state-fetch/types';
import {
  setup,
} from './common.forTests';
import {
  ABANDON_SHARE,
  TX_TEST_MNEMONIC_1,
  mockDate,
  filterDbSnapshot,
} from '../../../../../jestUtils.forTests';
import {
  genCheckAddressesInUse,
  genGetBestBlock,
  getSingleAddressString,
  genGetTokenInfo,
  genGetMultiAssetMetadata,
  MockUtxoApi,
  genGetRecentTransactionHashes,
  genGetTransactionsByHashes, genGetMultiAssetSupply, genGetTransactionsHistoryForAddresses,
} from '../../../state-fetch/mockNetwork.forTests';
import { loadLovefieldDB } from '../../database/index';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
} from '../../../../../../config/numbersConfig';
import type { WalletTypePurposeT } from '../../../../../../config/numbersConfig';
import {
  networks,
} from '../../database/prepackaged/networks';

import {
  asGetAllUtxos,
  asDisplayCutoff,
  asGetUtxoBalance,
} from '../../models/PublicDeriver/traits';

import {
  updateUtxos, updateTransactions, getAllTransactions
} from '../updateTransactions';
import { TransactionType } from '../../database/primitives/tables';
import UtxoApi from '../../../state-fetch/utxoApi';
import { RustModule } from '../../../cardanoCrypto/rustLoader';

jest.mock('../../database/initialSeed');

const placeholderTx = {
  hash: 'hash0',
  height: 218607,
  block_hash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba24',
  time: '2019-09-13T16:37:16.000Z',
  last_update: '2019-09-13T16:37:16.000Z',
  tx_state: 'Successful',
  tx_ordinal: 0,
  epoch: 10,
  slot: 3650,
  inputs: [],
  outputs: [],
};

const initialPendingTx: ('Failed' | 'Pending', number) => RemoteTransaction = (
  state,
  purpose
) => Object.freeze({
  hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
  height: null,
  block_hash: null,
  time: null,
  last_update: '2019-09-13T16:37:16.000Z',
  tx_state: state,
  tx_ordinal: null,
  epoch: null,
  slot: null,
  inputs: [
    {
      // 'Ae2tdPwUPEZ5PxKxoyZDgjsKgMWMpTRa4PH3sVgARSGBsWwNBH3qg7cMFsP'
      address: getSingleAddressString(
        ABANDON_SHARE,
        [
          purpose,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          7
        ]
      ),
      amount: '4000000',
      id: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d200',
      index: 0,
      txHash: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d20',
      assets: [],
    }
  ],
  outputs: [
    {
      // 'Ae2tdPwUPEZ6tzHKyuMLL6bh1au5DETgb53PTmJAN9aaCLtaUTWHvrS2mxo'
      address: getSingleAddressString(
        TX_TEST_MNEMONIC_1,
        [
          purpose,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          4
        ]
      ),
      amount: '2100000',
      assets: [],
    },
    {
      // 'Ae2tdPwUPEZE9RAm3d3zuuh22YjqDxhR1JF6G93uJsRrk51QGHzRUzLvDjL'
      address: getSingleAddressString(
        ABANDON_SHARE,
        [
          purpose,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          12
        ]
      ),
      amount: '1731391',
      assets: [],
    }
  ]
});

const otherSpend: number => RemoteTransaction = (purpose) => Object.freeze({
  hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
  height: 218608,
  block_hash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba25',
  time: '2019-09-13T16:37:16.000Z',
  last_update: '2019-09-13T16:37:16.000Z',
  tx_state: 'Successful',
  tx_ordinal: 0,
  epoch: 10,
  slot: 3650,
  inputs: [
    {
      // 'Ae2tdPwUPEZ5PxKxoyZDgjsKgMWMpTRa4PH3sVgARSGBsWwNBH3qg7cMFsP'
      address: getSingleAddressString(
        ABANDON_SHARE,
        [
          purpose,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          7
        ]
      ),
      amount: '4000000',
      id: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d210',
      index: 0,
      txHash: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d21',
      assets: [],
    }
  ],
  outputs: [
    {
      // 'Ae2tdPwUPEZ6tzHKyuMLL6bh1au5DETgb53PTmJAN9aaCLtaUTWHvrS2mxo'
      address: getSingleAddressString(
        TX_TEST_MNEMONIC_1,
        [
          purpose,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          4
        ]
      ),
      amount: '2100000',
      assets: [],
    },
    {
      // 'Ae2tdPwUPEZE9RAm3d3zuuh22YjqDxhR1JF6G93uJsRrk51QGHzRUzLvDjL'
      address: getSingleAddressString(
        ABANDON_SHARE,
        [
          purpose,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          12
        ]
      ),
      amount: '1731391',
      assets: [],
    }
  ]
});

const pendingOutwards: ('Failed' | 'Pending', number) => RemoteTransaction = (
  state,
  purpose
) => Object.freeze({
  hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed547',
  height: null,
  block_hash: null,
  time: null,
  last_update: '2019-09-13T16:37:56.000Z',
  tx_state: state,
  tx_ordinal: null,
  epoch: null,
  slot: null,
  inputs: [
    {
      // 'Ae2tdPwUPEZ6tzHKyuMLL6bh1au5DETgb53PTmJAN9aaCLtaUTWHvrS2mxo'
      address: getSingleAddressString(
        TX_TEST_MNEMONIC_1,
        [
          purpose,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          4
        ]
      ),
      amount: '2100000',
      id: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed5460',
      index: 0,
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
      assets: [],
    }
  ],
  outputs: [
    {
      // 'Ae2tdPwUPEZE9RAm3d3zuuh22YjqDxhR1JF6G93uJsRrk51QGHzRUzLvDjL'
      address: getSingleAddressString(
        ABANDON_SHARE,
        [
          purpose,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          12
        ]
      ),
      amount: '1900000',
      assets: [],
    }
  ]
});

const pointlessTx: number => RemoteTransaction = purpose => Object.freeze({
  hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed548',
  height: 218610,
  block_hash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba27',
  time: '2019-09-13T16:37:56.000Z',
  last_update: '2019-09-13T16:37:56.000Z',
  tx_state: 'Successful',
  tx_ordinal: 0,
  epoch: 10,
  slot: 3652,
  inputs: [
    {
      // 'Ae2tdPwUPEZE9RAm3d3zuuh22YjqDxhR1JF6G93uJsRrk51QGHzRUzLvDjL'
      address: getSingleAddressString(
        ABANDON_SHARE,
        [
          purpose,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          12
        ]
      ),
      amount: '4000000',
      id: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed5461',
      index: 1,
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
      assets: [],
    }
  ],
  outputs: [
    {
      // 'Ae2tdPwUPEZE9RAm3d3zuuh22YjqDxhR1JF6G93uJsRrk51QGHzRUzLvDjL'
      address: getSingleAddressString(
        ABANDON_SHARE,
        [
          purpose,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          12
        ]
      ),
      amount: '3800000',
      assets: [],
    },
  ]
});

beforeAll(async () => {
  await RustModule.load();
});

beforeEach(() => {
  mockDate();
});

async function baseTest(
  type: 'Pending' | 'Failed',
  purposeForTest: WalletTypePurposeT,
): Promise<void> {
  const networkTransactions: Array<RemoteTransaction> = [
    placeholderTx,
    initialPendingTx(type, purposeForTest)
  ];
  UtxoApi.utxoApiFactory = (_: string) => new MockUtxoApi(networkTransactions, 0);

  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver = await setup(db, TX_TEST_MNEMONIC_1, purposeForTest);

  const network = networks.CardanoMainnet;
  const checkAddressesInUse = genCheckAddressesInUse(networkTransactions, network);
  const getBestBlock = genGetBestBlock(networkTransactions);
  const getTokenInfo = genGetTokenInfo();
  const getMultiAssetMetadata = genGetMultiAssetMetadata();
  const getMultiAssetSupply = genGetMultiAssetSupply();
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(networkTransactions, network);
  const getRecentTransactionHashes = genGetRecentTransactionHashes(networkTransactions);
  const getTransactionsByHashes = genGetTransactionsByHashes(networkTransactions);

  const withDisplayCutoff = asDisplayCutoff(publicDeriver);
  if (!withDisplayCutoff) throw new Error('missing display cutoff functionality');
  const withUtxos = asGetAllUtxos(withDisplayCutoff);
  if (!withUtxos) throw new Error('missing get all utxos functionality');
  const withUtxoBalance = asGetUtxoBalance(withDisplayCutoff);
  if (!withUtxoBalance) throw new Error('missing utxo balance functionality');
  const basePubDeriver = withUtxoBalance;

  // single pending tx
  {
    await updateUtxos(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );
    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getRecentTransactionHashes,
      getTransactionsByHashes,
      getBestBlock,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );

    {
      const response = await basePubDeriver.getAllUtxosFromOldDb();
      expect(response).toEqual([]);
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response.getDefault()).toEqual(new BigNumber('0'));
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response.getDefault()).toEqual(new BigNumber('0'));
    }

    {
      const response = await basePubDeriver.getCutoff();
      expect(response).toEqual(0);
    }
    /*
    {
      const response = await publicDeriver.getLastSyncInfo();
      expect(response).toEqual({
        BlockHash: null,
        LastSyncInfoId: 1,
        SlotNum: null,
        Height: 0,
        Time: new Date(0),
      });
    }
    */
  }

  // adding regular tx while pending tx still exists
  {
    networkTransactions.push(otherSpend(purposeForTest));

    await updateUtxos(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );
    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getRecentTransactionHashes,
      getTransactionsByHashes,
      getBestBlock,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );

    {
      const expectedAddressing = [
        purposeForTest,
        CoinTypes.CARDANO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
        4
      ];
      const response = await basePubDeriver.getAllUtxosFromOldDb();
      expect(response).toEqual([{
        // 'Ae2tdPwUPEZ6tzHKyuMLL6bh1au5DETgb53PTmJAN9aaCLtaUTWHvrS2mxo'
        address: getSingleAddressString(
          TX_TEST_MNEMONIC_1,
          expectedAddressing
        ),
        addressing: {
          path: expectedAddressing,
          startLevel: 1,
        },
        output: {
          Transaction: {
            Type: TransactionType.CardanoByron,
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
            Digest: 1.249559827714551e-31,
            Ordinal: 0,
            BlockId: 1,
            LastUpdateTime: 1568392636000,
            Status: 1,
            TransactionId: 2,
            Extra: null,
          },
          UtxoTransactionOutput: {
            AddressId: 5,
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 2,
            UtxoTransactionOutputId: 3,
            ErgoBoxId: null,
            ErgoCreationHeight: null,
            ErgoRegisters: null,
            ErgoTree: null,
            TokenListId: 4,
          },
          tokens: [{
            Token: {
              Digest: 6.262633522161549e-167,
              IsDefault: true,
              IsNFT: false,
              Identifier: '',
              Metadata: {
                assetName: '',
                logo: null,
                longName: null,
                numberOfDecimals: 6,
                policyId: '',
                ticker: 'ADA',
                type: 'Cardano',
              },
              NetworkId: 0,
              TokenId: 1,
            },
            TokenList: {
              Amount: '2100000',
              ListId: 4,
              TokenId: 1,
              TokenListItemId: 5,
            },
          }],
        }
      }]);
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response.getDefault()).toEqual(new BigNumber('2100000'));
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response.getDefault()).toEqual(new BigNumber('2100000'));
    }

    {
      const response = await basePubDeriver.getCutoff();
      expect(response).toEqual(4);
    }

    {
      const response = await publicDeriver.getLastSyncInfo();
      expect(response).toEqual({
        BlockHash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba25',
        LastSyncInfoId: 1,
        SlotNum: 219650,
        Height: 218608,
        Time: new Date(1),
      });
    }
  }

  // pending becomes successful
  {
    const previouslyPending: RemoteTransaction = networkTransactions.splice(1, 1)[0];
    const newTx = {
      ...previouslyPending,
      ...({
        height: 218609,
        block_hash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba26',
        tx_ordinal: 0,
        time: '2019-09-13T16:37:36.000Z',
        epoch: 10,
        slot: 3651,
      }: RemoteTxBlockMeta),
      last_update: '2019-09-13T16:37:36.000Z',
      tx_state: 'Successful',
    };
    networkTransactions.push(newTx);

    await updateUtxos(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );
    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getRecentTransactionHashes,
      getTransactionsByHashes,
      getBestBlock,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );

    {
      const expectedAddressing = [
        purposeForTest,
        CoinTypes.CARDANO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
        4
      ];
      const response = await basePubDeriver.getAllUtxosFromOldDb();
      expect(response).toEqual([{
        // 'Ae2tdPwUPEZ6tzHKyuMLL6bh1au5DETgb53PTmJAN9aaCLtaUTWHvrS2mxo'
        address: getSingleAddressString(
          TX_TEST_MNEMONIC_1,
          expectedAddressing
        ),
        addressing: {
          path: expectedAddressing,
          startLevel: 1,
        },
        output: {
          Transaction: {
            Type: TransactionType.CardanoByron,
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
            Digest: 8.191593645542673e-27,
            Ordinal: 0,
            BlockId: 2,
            LastUpdateTime: 1568392656000,
            Status: 1,
            TransactionId: 1,
            Extra: null,
          },
          UtxoTransactionOutput: {
            AddressId: 5,
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 1,
            UtxoTransactionOutputId: 1,
            ErgoBoxId: null,
            ErgoCreationHeight: null,
            ErgoRegisters: null,
            ErgoTree: null,
            TokenListId: 1,
          },
          tokens: [{
            Token: {
              Digest: 6.262633522161549e-167,
              IsDefault: true,
              IsNFT: false,
              Identifier: '',
              Metadata: {
                assetName: '',
                logo: null,
                longName: null,
                numberOfDecimals: 6,
                policyId: '',
                ticker: 'ADA',
                type: 'Cardano',
              },
              NetworkId: 0,
              TokenId: 1,
            },
            TokenList: {
              Amount: '2100000',
              ListId: 1,
              TokenId: 1,
              TokenListItemId: 2,
            },
          }],
        }
      },
      {
        // 'Ae2tdPwUPEZ6tzHKyuMLL6bh1au5DETgb53PTmJAN9aaCLtaUTWHvrS2mxo'
        address: getSingleAddressString(
          TX_TEST_MNEMONIC_1,
          [
            purposeForTest,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            4
          ]
        ),
        addressing: {
          path: expectedAddressing,
          startLevel: 1,
        },
        output: {
          Transaction: {
            Type: TransactionType.CardanoByron,
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
            Digest: 1.249559827714551e-31,
            Ordinal: 0,
            BlockId: 1,
            LastUpdateTime: 1568392636000,
            Status: 1,
            TransactionId: 2,
            Extra: null,
          },
          UtxoTransactionOutput: {
            AddressId: 5,
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 2,
            UtxoTransactionOutputId: 3,
            ErgoBoxId: null,
            ErgoCreationHeight: null,
            ErgoRegisters: null,
            ErgoTree: null,
            TokenListId: 4,
          },
          tokens: [{
            Token: {
              Digest: 6.262633522161549e-167,
              IsDefault: true,
              IsNFT: false,
              Identifier: '',
              Metadata: {
                assetName: '',
                logo: null,
                longName: null,
                numberOfDecimals: 6,
                policyId: '',
                ticker: 'ADA',
                type: 'Cardano',
              },
              NetworkId: 0,
              TokenId: 1,
            },
            TokenList: {
              Amount: '2100000',
              ListId: 4,
              TokenId: 1,
              TokenListItemId: 5,
            },
          }],
        }
      }]);
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response.getDefault()).toEqual(new BigNumber('4200000'));
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response.getDefault()).toEqual(new BigNumber('4200000'));
    }

    {
      const response = await basePubDeriver.getCutoff();
      expect(response).toEqual(4);
    }

    {
      const response = await publicDeriver.getLastSyncInfo();
      expect(response).toEqual({
        BlockHash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba26',
        LastSyncInfoId: 1,
        SlotNum: 219651,
        Height: 218609,
        Time: new Date(2),
      });
    }
  }

  // add pending outwards
  {
    networkTransactions.push(pendingOutwards(type, purposeForTest));
    // need to add a pointless tx to advance the bestblock on the server
    networkTransactions.push(pointlessTx(purposeForTest));

    await updateUtxos(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );
    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getRecentTransactionHashes,
      getTransactionsByHashes,
      getBestBlock,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );

    {
      const response = await basePubDeriver.getAllUtxosFromOldDb();
      const expectedAddressing = [
        purposeForTest,
        CoinTypes.CARDANO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
        4
      ];
      expect(response).toEqual([{
        // 'Ae2tdPwUPEZ6tzHKyuMLL6bh1au5DETgb53PTmJAN9aaCLtaUTWHvrS2mxo'
        address: getSingleAddressString(
          TX_TEST_MNEMONIC_1,
          expectedAddressing
        ),
        addressing: {
          path: expectedAddressing,
          startLevel: 1,
        },
        output: {
          Transaction: {
            Type: TransactionType.CardanoByron,
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
            Digest: 8.191593645542673e-27,
            Ordinal: 0,
            BlockId: 2,
            LastUpdateTime: 1568392656000,
            Status: 1,
            TransactionId: 1,
            Extra: null,
          },
          UtxoTransactionOutput: {
            AddressId: 5,
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 1,
            UtxoTransactionOutputId: 1,
            ErgoBoxId: null,
            ErgoCreationHeight: null,
            ErgoRegisters: null,
            ErgoTree: null,
            TokenListId: 1,
          },
          tokens: [{
            Token: {
              Digest: 6.262633522161549e-167,
              IsDefault: true,
              IsNFT: false,
              Identifier: '',
              Metadata: {
                assetName: '',
                logo: null,
                longName: null,
                numberOfDecimals: 6,
                policyId: '',
                ticker: 'ADA',
                type: 'Cardano',
              },
              NetworkId: 0,
              TokenId: 1,
            },
            TokenList: {
              Amount: '2100000',
              ListId: 1,
              TokenId: 1,
              TokenListItemId: 2,
            },
          }],
        }
      },
      {
        // 'Ae2tdPwUPEZ6tzHKyuMLL6bh1au5DETgb53PTmJAN9aaCLtaUTWHvrS2mxo'
        address: getSingleAddressString(
          TX_TEST_MNEMONIC_1,
          [
            purposeForTest,
            CoinTypes.CARDANO,
            0 + HARD_DERIVATION_START,
            ChainDerivations.EXTERNAL,
            4
          ]
        ),
        addressing: {
          path: expectedAddressing,
          startLevel: 1,
        },
        output: {
          Transaction: {
            Type: TransactionType.CardanoByron,
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
            Digest: 1.249559827714551e-31,
            Ordinal: 0,
            BlockId: 1,
            LastUpdateTime: 1568392636000,
            Status: 1,
            TransactionId: 2,
            Extra: null,
          },
          UtxoTransactionOutput: {
            AddressId: 5,
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 2,
            UtxoTransactionOutputId: 3,
            ErgoBoxId: null,
            ErgoCreationHeight: null,
            ErgoRegisters: null,
            ErgoTree: null,
            TokenListId: 4,
          },
          tokens: [{
            Token: {
              Digest: 6.262633522161549e-167,
              IsDefault: true,
              IsNFT: false,
              Identifier: '',
              Metadata: {
                assetName: '',
                logo: null,
                longName: null,
                numberOfDecimals: 6,
                policyId: '',
                ticker: 'ADA',
                type: 'Cardano',
              },
              NetworkId: 0,
              TokenId: 1,
            },
            TokenList: {
              Amount: '2100000',
              ListId: 4,
              TokenId: 1,
              TokenListItemId: 5,
            },
          }],
        }
      }]);
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response.getDefault()).toEqual(new BigNumber('4200000'));
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response.getDefault()).toEqual(new BigNumber('4200000'));
    }

    {
      const response = await basePubDeriver.getCutoff();
      expect(response).toEqual(4);
    }
  }

  // rollback marks pending txs as failed
  {
    networkTransactions.pop();
    networkTransactions.pop();
    networkTransactions.pop();

    await updateUtxos(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );
    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getRecentTransactionHashes,
      getTransactionsByHashes,
      getBestBlock,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );

    /*
    expect((await db.export()).tables.Transaction).toEqual([{
      Type: TransactionType.CardanoByron,
      Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
      Digest: 8.191593645542673e-27,
      BlockId: 2,
      Ordinal: 0,
      Status: -2,
      LastUpdateTime: 1568392656000,
      ErrorMessage: null,
      TransactionId: 1,
      Extra: null,
    },
    {
      Type: TransactionType.CardanoByron,
      Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
      Digest: 1.249559827714551e-31,
      BlockId: 1,
      Ordinal: 0,
      LastUpdateTime: 1568392636000,
      Status: -2,
      ErrorMessage: null,
      TransactionId: 2,
      Extra: null,
    },
    {
      Type: TransactionType.CardanoByron,
      Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed547',
      Digest: 1.9060984568373646e-36,
      BlockId: null,
      Ordinal: null,
      LastUpdateTime: 1568392676000,
      // failed tx stays failed
      Status: type === 'Pending' ? -2 : -1,
      ErrorMessage: null,
      TransactionId: 3,
      Extra: null,
    }]);

    // Note currently networkTransactions = [ placerholderTx, otherSpend ],
    // so actually this proves that the original UTXO set result is *wrong*.
    {
      const response = await basePubDeriver.getAllUtxosFromOldDb();
      expect(response).toEqual([]);
    }
    */
    {
      const response = await basePubDeriver.getAllUtxos();
      expect(response).toEqual([
        {
          output: {
            Transaction: {
              Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546'
            },
            UtxoTransactionOutput: {
              OutputIndex: 0,
              ErgoBoxId: null,
              ErgoCreationHeight: null,
              ErgoTree: null,
              ErgoRegisters: null
            },
            tokens: [
              {
                Token: {
                  Digest: 6.262633522161549e-167,
                  NetworkId: 0,
                  Identifier: '',
                  IsDefault: true,
                  IsNFT: false,
                  Metadata: {
                    type: 'Cardano',
                    policyId: '',
                    assetName: '',
                    logo: null,
                    ticker: 'ADA',
                    longName: null,
                    numberOfDecimals: 6
                  },
                  TokenId: 1
                },
                TokenList: { Amount: '2100000' }
              }
            ]
          },
          addressing: {
            path: [ 2147483692, 2147485463, 2147483648, 0, 4 ],
            startLevel: 1
          },
          address: 'Ae2tdPwUPEZ6tzHKyuMLL6bh1au5DETgb53PTmJAN9aaCLtaUTWHvrS2mxo'
        }
      ]);
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response.getDefault()).toEqual(new BigNumber('2100000'));
    }
  }

  const txList = await getAllTransactions({
    publicDeriver: basePubDeriver,
  });
  expect(JSON.stringify(txList, null, 2)).toMatchSnapshot();

  const keysForTest = [
    'Address',
    'Transaction',
    'UtxoTransactionInput',
    'UtxoTransactionOutput',
    'LastSyncInfo',
    'Block',
    'Token',
    'TokenList',
  ];
  const dump = (await db.export()).tables;
  filterDbSnapshot(dump, keysForTest);
}

test('Syncing with pending bip44', async (done) => {
  await baseTest('Pending', WalletTypePurpose.BIP44);
  done();
});
test('Syncing with failed bip44', async (done) => {
  await baseTest('Failed', WalletTypePurpose.BIP44);
  done();
});


async function pendingDropped(
  purposeForTest: WalletTypePurposeT,
): Promise<void> {
  // need pointless tx otherwise the remote response is ignore since remote has empty blockchain
  const networkTransactions = [
    pointlessTx(purposeForTest),
    initialPendingTx('Pending', purposeForTest)
  ];
  UtxoApi.utxoApiFactory = (_: string) => new MockUtxoApi(networkTransactions, 0);

  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver = await setup(db, TX_TEST_MNEMONIC_1, purposeForTest);

  const network = networks.CardanoMainnet;
  const checkAddressesInUse = genCheckAddressesInUse(networkTransactions, network);
  const getBestBlock = genGetBestBlock(networkTransactions);
  const getTokenInfo = genGetTokenInfo();
  const getMultiAssetMetadata = genGetMultiAssetMetadata();
  const getMultiAssetSupply = genGetMultiAssetSupply();
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(networkTransactions, network);
  const getRecentTransactionHashes = genGetRecentTransactionHashes(networkTransactions);
  const getTransactionsByHashes = genGetTransactionsByHashes(networkTransactions);

  const basePubDeriver = asGetAllUtxos(publicDeriver);
  expect(basePubDeriver != null).toEqual(true);
  if (basePubDeriver == null) {
    throw new Error('Syncing txs basePubDeriver != GetAllAddressesInstance');
  }

  // add the pending tx to our wallet
  await updateUtxos(
    db,
    basePubDeriver,
    checkAddressesInUse,
    getTokenInfo,
    getMultiAssetMetadata,
    getMultiAssetSupply,
  );
  await updateTransactions(
    db,
    basePubDeriver,
    checkAddressesInUse,
    getTransactionsHistoryForAddresses,
    getRecentTransactionHashes,
    getTransactionsByHashes,
    getBestBlock,
    getTokenInfo,
    getMultiAssetMetadata,
    getMultiAssetSupply,
  );

  // remove it from backend
  networkTransactions.pop();

  // resync so pending becomes failed
  await updateUtxos(
    db,
    basePubDeriver,
    checkAddressesInUse,
    getTokenInfo,
    getMultiAssetMetadata,
    getMultiAssetSupply,
  );
  await updateTransactions(
    db,
    basePubDeriver,
    checkAddressesInUse,
    getTransactionsHistoryForAddresses,
    getRecentTransactionHashes,
    getTransactionsByHashes,
    getBestBlock,
    getTokenInfo,
    getMultiAssetMetadata,
    getMultiAssetSupply,
  );

  expect((await db.export()).tables.Transaction).toEqual([
    {
      Type: TransactionType.CardanoByron,
      // pending tx that is now failed as expected
      Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
      Digest: 8.191593645542673e-27,
      BlockId: null,
      Ordinal: null,
      LastUpdateTime: 1568392636000,
      Status: -3,
      ErrorMessage: null,
      TransactionId: 1,
      Extra: null,
    }
  ]);
}

test('Pending dropped from backend without rollback bip44', async (done) => {
  await pendingDropped(WalletTypePurpose.BIP44);
  done();
});
