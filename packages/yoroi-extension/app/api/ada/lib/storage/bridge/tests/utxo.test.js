// @flow

import BigNumber from 'bignumber.js';
import {
  schema,
} from 'lovefield';
import '../../../test-config.forTests';
import type { RemoteTransaction } from '../../../state-fetch/types';
import {
  setup,
} from './common.forTests';
import {
  ABANDON_SHARE,
  TX_TEST_MNEMONIC_1,
  mockDate,
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
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
} from '../../../../../../config/numbersConfig';
import type { WalletTypePurposeT } from '../../../../../../config/numbersConfig';
import { loadLovefieldDB } from '../../database/index';

import {
  asGetAllUtxos,
  asDisplayCutoff,
  asGetUtxoBalance,
} from '../../models/PublicDeriver/traits';

import {
  updateUtxos,
  updateTransactions,
} from '../updateTransactions';
import {
  networks,
} from '../../database/prepackaged/networks';
import UtxoApi from '../../../state-fetch/utxoApi';
import { RustModule } from '../../../cardanoCrypto/rustLoader';

jest.mock('../../database/initialSeed');

const networkTransactions: number => Array<RemoteTransaction> = (purpose) => [
  {
    hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
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
    ],
  },
  {
    hash: 'hash2',
    height: 218609,
    block_hash: 'blockhash2',
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
        id: 'txHash10',
        index: 0,
        txHash: 'txHash1',
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
            5
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
    ],
  },
];

const nextRegularSpend: number => RemoteTransaction = (purpose) => ({
  hash: 'hash3',
  height: 218610,
  block_hash: 'blockhash3',
  time: '2019-09-13T16:37:36.000Z',
  last_update: '2019-09-13T16:37:36.000Z',
  tx_state: 'Successful',
  tx_ordinal: 0,
  epoch: 10,
  slot: 3651,
  ttl: '99999999',
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
      id: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed5450',
      index: 0,
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
      assets: [],
    }
  ],
  outputs: [
    {
      // 'Ae2tdPwUPEZ3Kt2BJnDMQggxEA4c9MTagByH41rJkv2k82dBch2nqMAdyHJ'
      address: getSingleAddressString(
        TX_TEST_MNEMONIC_1,
        [
          purpose,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          0
        ]
      ),
      amount: '1100000',
      assets: [],
    },
    {
      // Ae2tdPwUPEYxsngJhnW49jrmGuaCvQK34Hqrnx5w5SWxgfjDkSDcnrRdT5G
      address: getSingleAddressString(
        TX_TEST_MNEMONIC_1,
        [
          purpose,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          19
        ]
      ),
      amount: '900000',
      assets: [],
    },
  ],
  type: 'shelley',
  fee: '100000',
  certificates: [],
  withdrawals: [{
    address: '619a57f784ef8f9a9d3d25a905e4df27d46843d7a0b93d162cdfae6cdc',
    amount: '1000',
  }],
  metadata: null,
});

beforeAll(async () => {
  await RustModule.load();
});

beforeEach(() => {
  mockDate();
});

async function syncingSimpleTransaction(
  purposeForTest: WalletTypePurposeT,
): Promise<void> {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);

  const network = networks.CardanoMainnet;
  const txHistory = networkTransactions(purposeForTest);

  UtxoApi.utxoApiFactory = (_: string) => new MockUtxoApi(txHistory, 1);

  const publicDeriver = await setup(db, TX_TEST_MNEMONIC_1, purposeForTest);

  const checkAddressesInUse = genCheckAddressesInUse(txHistory, network);
  const getBestBlock = genGetBestBlock(txHistory);
  const getTokenInfo = genGetTokenInfo();
  const getMultiAssetMetadata = genGetMultiAssetMetadata();
  const getMultiAssetSupply = genGetMultiAssetSupply();
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(txHistory, network);
  const getRecentTransactionHashes = genGetRecentTransactionHashes(txHistory);
  const getTransactionsByHashes = genGetTransactionsByHashes(txHistory);

  const withDisplayCutoff = asDisplayCutoff(publicDeriver);
  if (!withDisplayCutoff) throw new Error('missing display cutoff functionality');
  const withUtxoBalance = asGetUtxoBalance(withDisplayCutoff);
  if (!withUtxoBalance) throw new Error('missing utxo balance functionality');
  const withUtxos = asGetAllUtxos(withUtxoBalance);
  if (!withUtxos) throw new Error('missing get all addresses functionality');
  const basePubDeriver = withUtxos;

  expect(basePubDeriver != null).toEqual(true);
  if (basePubDeriver == null) {
    throw new Error('basePubDeriver missing a functionality');
  }

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
      const response = await basePubDeriver.getAllUtxos();

      expect(response).toEqual(
        [
          {
            output: {
              Transaction: {
                Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545'
              },
              UtxoTransactionOutput: {
                OutputIndex: 0,
                ErgoBoxId: null,
                ErgoCreationHeight: null,
                ErgoTree: null,
                ErgoRegisters: null,
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
          },
          {
            output: {
              Transaction: { Hash: 'hash2' },
              UtxoTransactionOutput: {
                OutputIndex: 0,
                ErgoBoxId: null,
                ErgoCreationHeight: null,
                ErgoTree: null,
                ErgoRegisters: null,
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
              path: [ 2147483692, 2147485463, 2147483648, 0, 5 ],
              startLevel: 1
            },
            address: 'Ae2tdPwUPEYxzZH7sSyyXK6DDmjCxRajXUXFqbEjtxfPN7HZzQfXr4hxKwT'
          }
        ]
      );
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response.getDefault()).toEqual(new BigNumber('4200000'));
    }

    {
      const response = await basePubDeriver.getCutoff();
      expect(response).toEqual(5);
    }
  }

  // test: add a 2nd transaction
  {
    txHistory.push(nextRegularSpend(purposeForTest));

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
      const response = await basePubDeriver.getAllUtxos();

      expect(response).toEqual(
        [
          {
            output: {
              Transaction: { Hash: 'hash2' },
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
              path: [ 2147483692, 2147485463, 2147483648, 0, 5 ],
              startLevel: 1
            },
            address: 'Ae2tdPwUPEYxzZH7sSyyXK6DDmjCxRajXUXFqbEjtxfPN7HZzQfXr4hxKwT'
          },
          {
            output: {
              Transaction: { Hash: 'hash3' },
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
                      ticker: 'ADA',
                      longName: null,
                      numberOfDecimals: 6
                    },
                    TokenId: 1
                  },
                  TokenList: { Amount: '1100000' }
                }
              ]
            },
            addressing: {
              path: [ 2147483692, 2147485463, 2147483648, 1, 0 ],
              startLevel: 1
            },
            address: 'Ae2tdPwUPEZ3Kt2BJnDMQggxEA4c9MTagByH41rJkv2k82dBch2nqMAdyHJ'
          },
          {
            output: {
              Transaction: { Hash: 'hash3' },
              UtxoTransactionOutput: {
                OutputIndex: 1,
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
                      ticker: 'ADA',
                      longName: null,
                      numberOfDecimals: 6
                    },
                    TokenId: 1
                  },
                  TokenList: { Amount: '900000' }
                }
              ]
            },
            addressing: {
              path: [ 2147483692, 2147485463, 2147483648, 0, 19 ],
              startLevel: 1
            },
            address: 'Ae2tdPwUPEYxsngJhnW49jrmGuaCvQK34Hqrnx5w5SWxgfjDkSDcnrRdT5G'
          }
        ]
      );
    }
    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response.getDefault()).toEqual(new BigNumber('4100000'));
    }

    {
      const response = await basePubDeriver.getCutoff();
      expect(response).toEqual(19);
    }

  }
}
test('Syncing simple transaction bip44', async (done) => {
  await syncingSimpleTransaction(WalletTypePurpose.BIP44);
  done();
});
