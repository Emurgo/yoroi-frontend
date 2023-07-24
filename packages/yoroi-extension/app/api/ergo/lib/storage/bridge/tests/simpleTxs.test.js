// @flow

import BigNumber from 'bignumber.js';
import {
  schema,
} from 'lovefield';
import '../../../../../ada/lib/test-config';
import type { RemoteErgoTransaction, } from '../../../state-fetch/types';
import {
  setup,
} from './common';
import {
  ABANDON_SHARE,
  TX_TEST_MNEMONIC_1,
  mockDate,
  filterDbSnapshot,
} from '../../../../../jestUtils';
import {
  genCheckAddressesInUse,
  genGetTransactionsHistoryForAddresses,
  genGetBestBlock,
  genGetAssetInfo,
  getErgoAddress,
} from '../../../state-fetch/mockNetwork';
import {
  fixFilterFunc,
  fixHistoryFunc,
} from '../../../state-fetch/remoteFetcher';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
} from '../../../../../../config/numbersConfig';
import { loadLovefieldDB } from '../../../../../ada/lib/storage/database/index';

import {
  asGetAllUtxos,
  asDisplayCutoff,
  asGetUtxoBalance,
} from '../../../../../ada/lib/storage/models/PublicDeriver/traits';

import {
  updateTransactions,
} from '../updateTransactions';
import {
  networks,
} from '../../../../../ada/lib/storage/database/prepackaged/networks';
import { TransactionType } from '../../../../../ada/lib/storage/database/primitives/tables';

jest.mock('../../../../../ada/lib/storage/database/initialSeed');

const networkTransactions: void => Array<RemoteErgoTransaction> = () => [{
  hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
  block_num: 218608,
  block_hash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba25',
  time: '2019-09-13T16:37:16.000Z',
  tx_state: 'Successful',
  tx_ordinal: 0,
  inputs: [
    {
      // 9gEuDVHRLWpm84E31Sr39zYE6ZFu37ifSJwRgoFsr32bcPzTcxR
      address: getErgoAddress(
        ABANDON_SHARE,
        [
          WalletTypePurpose.BIP44,
          CoinTypes.ERGO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          7
        ]
      ).to_base58(),
      value: '4000000',
      id: '33a35e15ae1a83fa188674a2bd53007b07e119a0eaaf40b890b2081c2864f12a',
      index: 0,
      outputIndex: 0,
      spendingProof: '', // no need just for tests I think
      outputTransactionId: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d20',
      transactionId: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
      assets: [],
    }
  ],
  dataInputs: [],
  outputs: [
    (() => {
      // 9gYJPYdfSuMz3YxcQTFJ8sTYMKgrABeoFiLpFrkkDM1YPHaXzHD
      const addr =  getErgoAddress(
        TX_TEST_MNEMONIC_1,
        [
          WalletTypePurpose.BIP44,
          CoinTypes.ERGO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          4
        ]
      );
      return {
        address: addr.to_base58(),
        value: '2100000',
        additionalRegisters: Object.freeze({}),
        assets: [],
        creationHeight: 1,
        ergoTree: Buffer.from(addr.address().to_ergo_tree().sigma_serialize_bytes()).toString('hex'),
        id: '66a35e15ae1a83fa188674a2bd53137b07e119a0eaaf40b890b2081c2864f12a',
        txId: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
        index: 0,
        mainChain: true,
        spentTransactionId: null,
      };
    })(),
    (() => {
      // 9gD1NrAarkrtqffHvnjxwaiVTb9BMF1qVwF353jZU7Lzb6gMMVX
      const addr = getErgoAddress(
        ABANDON_SHARE,
        [
          WalletTypePurpose.BIP44,
          CoinTypes.ERGO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          12
        ]
      );
      return {
        address: addr.to_base58(),
        value: '1731391',
        additionalRegisters: Object.freeze({}),
        assets: [],
        creationHeight: 1,
        ergoTree: Buffer.from(addr.address().to_ergo_tree().sigma_serialize_bytes()).toString('hex'),
        id: '76a35e15ae1a83aa188674a2bd53137b07e119a0eaaf40b890b2081c2864f12a',
        txId: '39f2fe214ec2d9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
        index: 1,
        mainChain: true,
        spentTransactionId: null,
      };
    })()
  ],
}];

const nextRegularSpend: void => RemoteErgoTransaction = () => ({
  hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
  block_num: 218609,
  block_hash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba26',
  time: '2019-09-13T16:37:36.000Z',
  tx_state: 'Successful',
  tx_ordinal: 0,
  inputs: [
    {
      // 9gYJPYdfSuMz3YxcQTFJ8sTYMKgrABeoFiLpFrkkDM1YPHaXzHD
      address: getErgoAddress(
        TX_TEST_MNEMONIC_1,
        [
          WalletTypePurpose.BIP44,
          CoinTypes.ERGO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          4
        ]
      ).to_base58(),
      value: '2100000',
      id: 'aca35e15ae1a83ff188674a2bd53007b07e119a0eaaf40b890b2081c2864f12a',
      index: 0,
      outputIndex: 0,
      spendingProof: '', // no need just for tests I think
      outputTransactionId: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
      transactionId: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
      assets: [],
    }
  ],
  dataInputs: [],
  outputs: [
    (() => {
      // 9f6CoekmariCyqfJm97zBSn2D7WT3AQhXana7tuyh8jZbNDhCuV
      const addr = getErgoAddress(
        TX_TEST_MNEMONIC_1,
        [
          WalletTypePurpose.BIP44,
          CoinTypes.ERGO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0
        ]
      );
      return {
        address: addr.to_base58(),
        value: '1100000',
        additionalRegisters: Object.freeze({}),
        assets: [],
        creationHeight: 1,
        ergoTree: Buffer.from(addr.address().to_ergo_tree().sigma_serialize_bytes()).toString('hex'),
        id: '18335e15ae1a83fa188674a2bd53137839e119a0eaaf40b890b2081c2864f12a',
        txId: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
        index: 0,
        mainChain: true,
        spentTransactionId: null,
      };
    })(),
    (() => {
      // 9gzsdG5W1J1g8SaTW8qfNs219vsNUEYQFqoZakx6T3dGgXmyxRN
      const addr = getErgoAddress(
        TX_TEST_MNEMONIC_1,
        [
          WalletTypePurpose.BIP44,
          CoinTypes.ERGO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          19
        ]
      );
      return {
        address: addr.to_base58(),
        value: '900000',
        additionalRegisters: Object.freeze({}),
        assets: [],
        creationHeight: 1,
        ergoTree: Buffer.from(addr.address().to_ergo_tree().sigma_serialize_bytes()).toString('hex'),
        id: 'ff735e15ae1a83fa188674a21749137839e119a0eaaf40b890b2081c2864f12a',
        txId: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
        index: 1,
        mainChain: true,
        spentTransactionId: null,
      };
    })(),
  ],
});

beforeEach(() => {
  mockDate();
});

async function syncingSimpleTransaction(): Promise<void> {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver = await setup(db, TX_TEST_MNEMONIC_1, WalletTypePurpose.BIP44);

  const network = networks.ErgoMainnet;
  const txHistory = networkTransactions();
  const checkAddressesInUse = fixFilterFunc(genCheckAddressesInUse(txHistory, network));
  const getTransactionsHistoryForAddresses = fixHistoryFunc(genGetTransactionsHistoryForAddresses(
    txHistory,
    network,
  ));
  const getBestBlock = genGetBestBlock(txHistory);
  const getAssetInfo = genGetAssetInfo(txHistory);

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
    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getAssetInfo,
      getBestBlock,
    );

    {
      const expectedAddressing = [
        WalletTypePurpose.BIP44,
        CoinTypes.ERGO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
        4
      ];
      const response = await basePubDeriver.getAllUtxos();
      expect(response).toEqual([{
        // 9gYJPYdfSuMz3YxcQTFJ8sTYMKgrABeoFiLpFrkkDM1YPHaXzHD
        address: Buffer.from(getErgoAddress(
          TX_TEST_MNEMONIC_1,
          expectedAddressing
        ).to_bytes()).toString('hex'),
        addressing: {
          path: expectedAddressing,
          startLevel: 1,
        },
        output: {
          Transaction: {
            Type: TransactionType.Ergo,
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
            Digest: 8.191593645542673e-27,
            Ordinal: 0,
            BlockId: 1,
            LastUpdateTime: 1568392636000,
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
            ErgoBoxId: '66a35e15ae1a83fa188674a2bd53137b07e119a0eaaf40b890b2081c2864f12a',
            ErgoCreationHeight: 1,
            ErgoRegisters: '{}',
            ErgoTree: '0008cd030a34bb300eff7a7cc7fc2aba459142b5815883840fb8955db162b3f8f9b0ab72',
            TokenListId: 1,
          },
          tokens: [{
            Token: {
              Digest: 6.262633522161549e-167,
              IsDefault: true,
              IsNFT: false,
              Identifier: '',
              Metadata: {
                longName: null,
                numberOfDecimals: 9,
                ticker: 'ERG',
                type: 'Ergo',
                boxId: '',
                description: null,
                height: 0,
              },
              NetworkId: 200,
              TokenId: 2,
            },
            TokenList: {
              Amount: '2100000',
              ListId: 1,
              TokenId: 2,
              TokenListItemId: 2,
            },
          }]
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
        SlotNum: 0,
        Height: 218608,
        Time: new Date(0),
      });
    }
  }

  // test: add a 2nd transaction
  {
    txHistory.push(nextRegularSpend());

    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getAssetInfo,
      getBestBlock,
    );

    {
      const expectedAddressing1 = [
        WalletTypePurpose.BIP44,
        CoinTypes.ERGO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
        0
      ];
      const expectedAddressing2 = [
        WalletTypePurpose.BIP44,
        CoinTypes.ERGO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
        19
      ];
      const response = await basePubDeriver.getAllUtxos();
      expect(response).toEqual([{
        // 9f6CoekmariCyqfJm97zBSn2D7WT3AQhXana7tuyh8jZbNDhCuV
        address: Buffer.from(getErgoAddress(
          TX_TEST_MNEMONIC_1,
          expectedAddressing1,
        ).to_bytes()).toString('hex'),
        addressing: {
          path: expectedAddressing1,
          startLevel: 1,
        },
        output: {
          Transaction: {
            Type: TransactionType.Ergo,
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
            Digest: 1.249559827714551e-31,
            Ordinal: 0,
            BlockId: 2,
            LastUpdateTime: 1568392656000,
            Status: 1,
            TransactionId: 2,
            Extra: null,
          },
          UtxoTransactionOutput: {
            AddressId: 1,
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 2,
            UtxoTransactionOutputId: 3,
            ErgoBoxId: '18335e15ae1a83fa188674a2bd53137839e119a0eaaf40b890b2081c2864f12a',
            ErgoCreationHeight: 1,
            ErgoRegisters: '{}',
            ErgoTree: '0008cd024b414d2f9a78fa4df3052a6a6777e84c06a6bcbc37bd5f5bc895d406f30a6ad8',
            TokenListId: 4,
          },
          tokens: [{
            Token: {
              Digest: 6.262633522161549e-167,
              IsDefault: true,
              IsNFT: false,
              Identifier: '',
              Metadata: {
                longName: null,
                numberOfDecimals: 9,
                ticker: 'ERG',
                type: 'Ergo',
                boxId: '',
                description: null,
                height: 0,
              },
              NetworkId: 200,
              TokenId: 2,
            },
            TokenList: {
              Amount: '1100000',
              ListId: 4,
              TokenId: 2,
              TokenListItemId: 5,
            },
          }]
        }
      },
      {
        // 9gzsdG5W1J1g8SaTW8qfNs219vsNUEYQFqoZakx6T3dGgXmyxRN
        address: Buffer.from(getErgoAddress(
          TX_TEST_MNEMONIC_1,
          expectedAddressing2
        ).to_bytes()).toString('hex'),
        addressing: {
          path: expectedAddressing2,
          startLevel: 1,
        },
        output: {
          Transaction: {
            Type: TransactionType.Ergo,
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
            Digest: 1.249559827714551e-31,
            Ordinal: 0,
            BlockId: 2,
            LastUpdateTime: 1568392656000,
            Status: 1,
            TransactionId: 2,
            Extra: null,
          },
          UtxoTransactionOutput: {
            AddressId: 20,
            IsUnspent: true,
            OutputIndex: 1,
            TransactionId: 2,
            UtxoTransactionOutputId: 4,
            ErgoBoxId: 'ff735e15ae1a83fa188674a21749137839e119a0eaaf40b890b2081c2864f12a',
            ErgoCreationHeight: 1,
            ErgoRegisters: '{}',
            ErgoTree: '0008cd03468b1754b0f74d15440e78e8f6939a674e324f4617af443719b038c4229eca43',
            TokenListId: 5,
          },
          tokens: [{
            Token: {
              Digest: 6.262633522161549e-167,
              IsDefault: true,
              IsNFT: false,
              Identifier: '',
              Metadata: {
                longName: null,
                numberOfDecimals: 9,
                ticker: 'ERG',
                type: 'Ergo',
                boxId: '',
                description: null,
                height: 0,
              },
              NetworkId: 200,
              TokenId: 2,
            },
            TokenList: {
              Amount: '900000',
              ListId: 5,
              TokenId: 2,
              TokenListItemId: 6,
            },
          }]
        },
      }
      ]);
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response.getDefault()).toEqual(new BigNumber('2000000'));
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response.getDefault()).toEqual(new BigNumber('2000000'));
    }

    {
      const response = await basePubDeriver.getCutoff();
      expect(response).toEqual(19);
    }

    {
      const response = await publicDeriver.getLastSyncInfo();
      expect(response).toEqual({
        BlockHash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba26',
        LastSyncInfoId: 1,
        SlotNum: 0,
        Height: 218609,
        Time: new Date(1),
      });
    }
  }

  const keysForTest = [
    'Address',
    'Transaction',
    'UtxoTransactionInput',
    'AccountingTransactionInput',
    'UtxoTransactionOutput',
    'LastSyncInfo',
    'Block',
    'Token',
    'TokenList',
  ];
  const dump = (await db.export()).tables;
  filterDbSnapshot(dump, keysForTest);
}
test('Syncing simple transaction bip44', async (done) => {
  await syncingSimpleTransaction();
  done();
});
