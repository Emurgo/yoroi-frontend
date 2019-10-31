// @flow

import BigNumber from 'bignumber.js';
import {
  schema,
} from 'lovefield';
import stableStringify from 'json-stable-stringify';
import '../../../test-config';
import type { RemoteTransaction } from '../../../state-fetch/types';
import {
  setup,
  filterDbSnapshot,
  mockDate,
} from './common';
import {
  genCheckAddressesInUse,
  genGetTransactionsHistoryForAddresses,
  genGetBestBlock,
} from './mockNetwork';
import { loadLovefieldDB } from '../../database/index';

import {
  asGetAllUtxos,
  asDisplayCutoff,
} from '../../models/Bip44Wallet/traits';
import {
  asGetUtxoBalance,
} from '../../models/common/traits';

import {
  updateTransactions,
} from '../updateTransactions';

jest.mock('../../database/initialSeed');

const networkTransactions: Array<RemoteTransaction> = [{
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
      address: '2cWKMJemoBaiw2vnBSiChVe9owqcymJJUq9UdTFzn3QLjvqvoLRVadugTfMtcJXQKcoWW',
      amount: '4000000',
      id: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d200',
      index: 0,
      txHash: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d20'
    }
  ],
  outputs: [
    {
      // ours
      address: '2cWKMJemoBam9FHms2YNoTSaKGn5xCbN5FRhAa3seKgkfrAYujWrX8PRiFF2jVVMuM455',
      amount: '2100000'
    },
    {
      address: '2cWKMJemoBakYwphS2CYUDzm9jTvoKGeyUy43JXdKmSzEEdWMMnjD7REMX4kCdWj5W5U6',
      amount: '1731391'
    }
  ]
}];

const nextRegularSpend = {
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
      // ours
      address: '2cWKMJemoBam9FHms2YNoTSaKGn5xCbN5FRhAa3seKgkfrAYujWrX8PRiFF2jVVMuM455',
      amount: '2100000',
      id: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed5450',
      index: 0,
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545'
    }
  ],
  outputs: [
    {
      // ours
      address: '2cWKMJemoBai5YBzrvj8yR7AxofNVRRQ3HeGZ6ze2jedGJWAZuv1kk83DDHhbM4etgZoX',
      amount: '1100000'
    },
    {
      // ours
      address: '2cWKMJemoBajxKobGHH4FWX8MYipNcYd8QWU6GJNfam6H7HJ4CJFvv42jqiPayM6skcPs',
      amount: '900000'
    }
  ]
};

const twoTxsRegularSpend = [{
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
      // ours
      address: '2cWKMJemoBai5YBzrvj8yR7AxofNVRRQ3HeGZ6ze2jedGJWAZuv1kk83DDHhbM4etgZoX',
      amount: '1100000',
      id: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed5460',
      index: 0,
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546'
    }
  ],
  outputs: [
    {
      address: '2cWKMJemoBaiw2vnBSiChVe9owqcymJJUq9UdTFzn3QLjvqvoLRVadugTfMtcJXQKcoWW',
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
      // ours
      address: '2cWKMJemoBajxKobGHH4FWX8MYipNcYd8QWU6GJNfam6H7HJ4CJFvv42jqiPayM6skcPs',
      amount: '900000',
      id: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed5461',
      index: 1,
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546'
    }
  ],
  outputs: [
    {
      address: '2cWKMJemoBaiw2vnBSiChVe9owqcymJJUq9UdTFzn3QLjvqvoLRVadugTfMtcJXQKcoWW',
      amount: '700000'
    },
  ]
}];

beforeEach(() => {
  mockDate();
});

test('Syncing simple transaction', async (done) => {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver = await setup(db);

  const networkTransactionsClone = [...networkTransactions];
  const checkAddressesInUse = genCheckAddressesInUse(networkTransactionsClone);
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(
    networkTransactionsClone
  );
  const getBestBlock = genGetBestBlock(networkTransactionsClone);

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
      const response = await basePubDeriver.getAllUtxos();
      expect(response).toEqual([{
        address: '2cWKMJemoBam9FHms2YNoTSaKGn5xCbN5FRhAa3seKgkfrAYujWrX8PRiFF2jVVMuM455',
        addressing: {
          path: [2147483692, 2147485463, 2147483648, 0, 4],
          startLevel: 1,
        },
        output: {
          Transaction: {
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
            Digest: 8.191593645542673e-27,
            Ordinal: 0,
            BlockId: 1,
            LastUpdateTime: 1568392636000,
            Status: 1,
            TransactionId: 1
          },
          UtxoTransactionOutput: {
            AddressId: 5,
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
        SlotNum: 219650,
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
    networkTransactionsClone.push(nextRegularSpend);

    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    {
      const response = await basePubDeriver.getAllUtxos();
      expect(response).toEqual([{
        address: '2cWKMJemoBai5YBzrvj8yR7AxofNVRRQ3HeGZ6ze2jedGJWAZuv1kk83DDHhbM4etgZoX',
        addressing: {
          path: [2147483692, 2147485463, 2147483648, 1, 0],
          startLevel: 1,
        },
        output: {
          Transaction: {
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
            Digest: 1.249559827714551e-31,
            Ordinal: 0,
            BlockId: 2,
            LastUpdateTime: 1568392656000,
            Status: 1,
            TransactionId: 2
          },
          UtxoTransactionOutput: {
            AddressId: 21,
            Amount: '1100000',
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 2,
            UtxoTransactionOutputId: 3
          }
        }
      },
      {
        address: '2cWKMJemoBajxKobGHH4FWX8MYipNcYd8QWU6GJNfam6H7HJ4CJFvv42jqiPayM6skcPs',
        addressing: {
          path: [2147483692, 2147485463, 2147483648, 0, 19],
          startLevel: 1,
        },
        output: {
          Transaction: {
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
            Digest: 1.249559827714551e-31,
            Ordinal: 0,
            BlockId: 2,
            LastUpdateTime: 1568392656000,
            Status: 1,
            TransactionId: 2
          },
          UtxoTransactionOutput: {
            AddressId: 20,
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
        SlotNum: 219651,
        Height: 218609,
        Time: new Date(2),
      });
    }
  }

  // test: two txs in the same block
  {
    networkTransactionsClone.push(...twoTxsRegularSpend);

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
    networkTransactionsClone.pop();
    networkTransactionsClone.pop();

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
  done();
});

test('Utxo created and used in same sync', async (done) => {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver = await setup(db);

  const networkTransactionsClone = [...networkTransactions];
  const checkAddressesInUse = genCheckAddressesInUse(networkTransactionsClone);
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(
    networkTransactionsClone
  );
  const getBestBlock = genGetBestBlock(networkTransactionsClone);

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
    networkTransactionsClone.push(nextRegularSpend);

    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    {
      const response = await basePubDeriver.getAllUtxos();
      expect(response).toEqual([{
        address: '2cWKMJemoBai5YBzrvj8yR7AxofNVRRQ3HeGZ6ze2jedGJWAZuv1kk83DDHhbM4etgZoX',
        addressing: {
          path: [2147483692, 2147485463, 2147483648, 1, 0],
          startLevel: 1,
        },
        output: {
          Transaction: {
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
            Digest: 1.249559827714551e-31,
            Ordinal: 0,
            BlockId: 2,
            LastUpdateTime: 1568392656000,
            Status: 1,
            TransactionId: 2
          },
          UtxoTransactionOutput: {
            AddressId: 21,
            Amount: '1100000',
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 2,
            UtxoTransactionOutputId: 3
          }
        }
      },
      {
        address: '2cWKMJemoBajxKobGHH4FWX8MYipNcYd8QWU6GJNfam6H7HJ4CJFvv42jqiPayM6skcPs',
        addressing: {
          path: [2147483692, 2147485463, 2147483648, 0, 19],
          startLevel: 1,
        },
        output: {
          Transaction: {
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
            Digest: 1.249559827714551e-31,
            Ordinal: 0,
            BlockId: 2,
            LastUpdateTime: 1568392656000,
            Status: 1,
            TransactionId: 2
          },
          UtxoTransactionOutput: {
            AddressId: 20,
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
  done();
});

/**
 * We want to compare the test result with a snapshot of the database
 * However, the diff is too big to reasonably compare with your eyes
 * Therefore, we test each table separately
 */
function compareObject(obj1: { tables: any }, obj2: { tables: any }) {
  for (const prop of Object.keys(obj1)) {
    if (obj1[prop] !== undefined && obj2[prop] === undefined) {
      expect(stableStringify(obj1)).toEqual(stableStringify(obj2));
    }
  }
  for (const prop of Object.keys(obj2)) {
    if (obj2[prop] !== undefined && obj1[prop] === undefined) {
      expect(stableStringify(obj1)).toEqual(stableStringify(obj2));
    }
  }

  const obj2KeySet = new Set(Object.keys(obj2));
  const keysInBoth = Object.keys(obj1).filter(key => obj2KeySet.has(key));
  for (const key of keysInBoth) {
    if (key === 'tables') {
      compareObject(obj1[key], obj2[key]);
    } else {
      expect(stableStringify(obj1[key])).toEqual(stableStringify(obj2[key]));
    }
  }
}
