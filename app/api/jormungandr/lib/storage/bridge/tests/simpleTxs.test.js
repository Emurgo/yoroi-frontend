// @flow

import BigNumber from 'bignumber.js';
import {
  schema,
} from 'lovefield';
import '../../../../../ada/lib/test-config';
import type { RemoteTransaction } from '../../../state-fetch/types';
import {
  setup,
} from './common';
import {
  ABANDON_SHARE,
  TX_TEST_MNEMONIC_1,
  mockDate,
  filterDbSnapshot,
  compareObject,
} from '../../../../../jestUtils';
import {
  genCheckAddressesInUse,
  genGetTransactionsHistoryForAddresses,
  genGetBestBlock,
  getSingleAddressString,
} from '../../../state-fetch/mockNetwork';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
} from '../../../../../../config/numbersConfig';
import type { WalletTypePurposeT } from '../../../../../../config/numbersConfig';
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

const networkTransactions: number => Array<RemoteTransaction> = (purpose) => [{
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
      txHash: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d20'
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
      amount: '2100000'
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
      amount: '1731391'
    }
  ]
}];

const nextRegularSpend: number => RemoteTransaction = (purpose) => ({
  hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
  height: 218609,
  block_hash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba26',
  time: '2019-09-13T16:37:36.000Z',
  last_update: '2019-09-13T16:37:36.000Z',
  tx_state: 'Successful',
  tx_ordinal: 0,
  epoch: 10,
  slot: 3651,
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
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545'
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
      amount: '1100000'
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
      amount: '900000'
    }
  ]
});

const twoTxsRegularSpend: number => Array<RemoteTransaction> = (purpose) => [{
  hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed547',
  height: 218611,
  block_hash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba27',
  time: '2019-09-13T16:38:26.000Z',
  last_update: '2019-09-13T16:38:26.000Z',
  tx_state: 'Successful',
  tx_ordinal: 0,
  epoch: 10,
  slot: 3653,
  inputs: [
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
      id: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed5460',
      index: 0,
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546'
    }
  ],
  outputs: [
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
      amount: '900000'
    },
  ]
},
{
  hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed548',
  height: 218611,
  block_hash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba27',
  time: '2019-09-13T16:38:26.000Z',
  last_update: '2019-09-13T16:38:26.000Z',
  tx_state: 'Successful',
  tx_ordinal: 1,
  epoch: 10,
  slot: 3653,
  inputs: [
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
      id: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed5461',
      index: 1,
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546'
    }
  ],
  outputs: [
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
      amount: '700000'
    },
  ]
}];

beforeEach(() => {
  mockDate();
});

async function syncingSimpleTransaction(
  purposeForTest: WalletTypePurposeT,
): Promise<void> {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver = await setup(db, TX_TEST_MNEMONIC_1, purposeForTest);

  const network = networks.JormungandrMainnet;
  const txHistory = networkTransactions(purposeForTest);
  const checkAddressesInUse = genCheckAddressesInUse(txHistory, network);
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(
    txHistory,
    network,
  );
  const getBestBlock = genGetBestBlock(txHistory);

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

  // test Public Deriver functionality
  {
    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    {
      const expectedAddressing = [
        purposeForTest,
        CoinTypes.CARDANO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
        4
      ];
      const response = await basePubDeriver.getAllUtxos();
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
            Type: TransactionType.Jormungandr,
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
            AddressId: purposeForTest === WalletTypePurpose.CIP1852
              ? 9
              : 5,
            Amount: '2100000',
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 1,
            UtxoTransactionOutputId: 1
          }
        }
      }]);
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response).toEqual(new BigNumber('2100000'));
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response).toEqual(new BigNumber('2100000'));
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
        SlotNum: 435650,
        Height: 218608,
        Time: new Date(0),
      });
    }
  }

  // test: calling update TX again when nothing changed results in no change in DB
  {
    const dbDump1 = (await db.export()).tables;

    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    const dbDump2 = (await db.export()).tables;
    // note: last sync time updates every sync even if nothing changes
    delete dbDump1.LastSyncInfo[0].Time;
    delete dbDump2.LastSyncInfo[0].Time;
    compareObject(dbDump1, dbDump2);
  }

  // test: add a 2nd transaction
  {
    txHistory.push(nextRegularSpend(purposeForTest));

    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    {
      const expectedAddressing1 = [
        purposeForTest,
        CoinTypes.CARDANO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.INTERNAL,
        0
      ];
      const expectedAddressing2 = [
        purposeForTest,
        CoinTypes.CARDANO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
        19
      ];
      const response = await basePubDeriver.getAllUtxos();
      expect(response).toEqual([{
        // 'Ae2tdPwUPEZ3Kt2BJnDMQggxEA4c9MTagByH41rJkv2k82dBch2nqMAdyHJ'
        address: getSingleAddressString(
          TX_TEST_MNEMONIC_1,
          expectedAddressing1,
        ),
        addressing: {
          path: expectedAddressing1,
          startLevel: 1,
        },
        output: {
          Transaction: {
            Type: TransactionType.Jormungandr,
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
            AddressId: purposeForTest === WalletTypePurpose.CIP1852
              ? 41
              : 21,
            Amount: '1100000',
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 2,
            UtxoTransactionOutputId: 3
          }
        }
      },
      {
        // Ae2tdPwUPEYxsngJhnW49jrmGuaCvQK34Hqrnx5w5SWxgfjDkSDcnrRdT5G
        address: getSingleAddressString(
          TX_TEST_MNEMONIC_1,
          expectedAddressing2
        ),
        addressing: {
          path: expectedAddressing2,
          startLevel: 1,
        },
        output: {
          Transaction: {
            Type: TransactionType.Jormungandr,
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
            AddressId: purposeForTest === WalletTypePurpose.CIP1852
              ? 39
              : 20,
            Amount: '900000',
            IsUnspent: true,
            OutputIndex: 1,
            TransactionId: 2,
            UtxoTransactionOutputId: 4
          }
        },
      }
      ]);
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response).toEqual(new BigNumber('2000000'));
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response).toEqual(new BigNumber('2000000'));
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
        SlotNum: 435651,
        Height: 218609,
        Time: new Date(2),
      });
    }
  }

  // test: two txs in the same block
  {
    txHistory.push(...twoTxsRegularSpend(purposeForTest));

    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    {
      const response = await basePubDeriver.getAllUtxos();
      expect(response).toEqual([]);
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response).toEqual(new BigNumber('0'));
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response).toEqual(new BigNumber('0'));
    }

    {
      const response = await basePubDeriver.getCutoff();
      expect(response).toEqual(19);
    }
  }

  // test rollback
  {
    txHistory.pop();
    txHistory.pop();

    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    {
      const response = await basePubDeriver.getAllUtxos();
      expect(response).toEqual([]);
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response).toEqual(new BigNumber('0'));
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response).toEqual(new BigNumber('0'));
    }

    {
      const response = await basePubDeriver.getCutoff();
      expect(response).toEqual(19);
    }

    {
      const response = await publicDeriver.getLastSyncInfo();
      expect(response).toEqual({
        BlockHash: null,
        LastSyncInfoId: 1,
        SlotNum: null,
        Height: 0,
        Time: new Date(4),
      });
    }
  }

  const keysForTest = [
    'Address',
    'Transaction',
    'UtxoTransactionInput',
    'UtxoTransactionOutput',
    'LastSyncInfo',
    'Block'
  ];
  const dump = (await db.export()).tables;
  filterDbSnapshot(dump, keysForTest);
}
test('Syncing simple transaction bip44', async (done) => {
  await syncingSimpleTransaction(WalletTypePurpose.BIP44);
  done();
});

test('Syncing simple transaction cip1852', async (done) => {
  await syncingSimpleTransaction(WalletTypePurpose.CIP1852);
  done();
});

async function utxoCreatedAndUsed(
  purposeForTest: WalletTypePurposeT,
): Promise<void> {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver = await setup(db, TX_TEST_MNEMONIC_1, purposeForTest);

  const txHistory = networkTransactions(purposeForTest);
  const network = networks.JormungandrMainnet;
  const checkAddressesInUse = genCheckAddressesInUse(txHistory, network);
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(
    txHistory,
    network
  );
  const getBestBlock = genGetBestBlock(txHistory);

  const withDisplayCutoff = asDisplayCutoff(publicDeriver);
  if (!withDisplayCutoff) throw new Error('missing display cutoff functionality');
  const withUtxos = asGetAllUtxos(withDisplayCutoff);
  if (!withUtxos) throw new Error('missing get all utxos functionality');
  const withUtxoBalance = asGetUtxoBalance(withUtxos);
  if (!withUtxoBalance) throw new Error('missing utxo balance functionality');
  const basePubDeriver = withUtxoBalance;

  expect(basePubDeriver != null).toEqual(true);
  if (basePubDeriver == null) {
    throw new Error('basePubDeriver missing a functionality');
  }

  {
    // add tx so that we  both created and used a utxo in the same sync
    txHistory.push(nextRegularSpend(purposeForTest));

    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    {
      const expectedAddressing1 = [
        purposeForTest,
        CoinTypes.CARDANO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.INTERNAL,
        0
      ];
      const expectedAddressing2 = [
        purposeForTest,
        CoinTypes.CARDANO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
        19
      ];
      const response = await basePubDeriver.getAllUtxos();
      expect(response).toEqual([{
        // 'Ae2tdPwUPEZ3Kt2BJnDMQggxEA4c9MTagByH41rJkv2k82dBch2nqMAdyHJ'
        address: getSingleAddressString(
          TX_TEST_MNEMONIC_1,
          expectedAddressing1
        ),
        addressing: {
          path: expectedAddressing1,
          startLevel: 1,
        },
        output: {
          Transaction: {
            Type: TransactionType.Jormungandr,
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
            AddressId: purposeForTest === WalletTypePurpose.CIP1852
              ? 41
              : 21,
            Amount: '1100000',
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 2,
            UtxoTransactionOutputId: 3
          }
        }
      },
      {
        // Ae2tdPwUPEYxsngJhnW49jrmGuaCvQK34Hqrnx5w5SWxgfjDkSDcnrRdT5G
        address: getSingleAddressString(
          TX_TEST_MNEMONIC_1,
          expectedAddressing2
        ),
        addressing: {
          path: expectedAddressing2,
          startLevel: 1,
        },
        output: {
          Transaction: {
            Type: TransactionType.Jormungandr,
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
            AddressId: purposeForTest === WalletTypePurpose.CIP1852
              ? 39
              : 20,
            Amount: '900000',
            IsUnspent: true,
            OutputIndex: 1,
            TransactionId: 2,
            UtxoTransactionOutputId: 4
          }
        }
      },
      ]);
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response).toEqual(new BigNumber('2000000'));
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
      expect(response).toEqual(new BigNumber('2000000'));
    }
  }
}

test('Utxo created and used in same sync bip44', async (done) => {
  await utxoCreatedAndUsed(WalletTypePurpose.BIP44);
  done();
});

test('Utxo created and used in same sync cip1852', async (done) => {
  await utxoCreatedAndUsed(WalletTypePurpose.CIP1852);
  done();
});
