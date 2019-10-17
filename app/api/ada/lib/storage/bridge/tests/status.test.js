// @flow

import BigNumber from 'bignumber.js';
import {
  schema,
} from 'lovefield';
import '../../../test-config';
import type { RemoteTxBlockMeta, } from '../../../../adaTypes';
import {
  setup,
  mockDate,
  filterDbSnapshot,
} from './common';
import {
  genCheckAddressesInUse,
  genGetTransactionsHistoryForAddresses,
  genGetBestBlock,
} from './mockNetwork';
import { loadLovefieldDB } from '../../database/index';

import {
  asGetAllUtxos,
  asGetUtxoBalance,
  asDisplayCutoff,
} from '../../models/PublicDeriver/index';

import {
  updateTransactions, getAllUtxoTransactions
} from '../updateTransactions';

jest.mock('../../database/initialSeed');

const initialPendingTx = (state: 'Pending' | 'Failed') => ({
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
});

const otherSpend = {
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
      address: '2cWKMJemoBaiw2vnBSiChVe9owqcymJJUq9UdTFzn3QLjvqvoLRVadugTfMtcJXQKcoWW',
      amount: '4000000',
      id: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d210',
      index: 0,
      txHash: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d21'
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
};

const pendingOutwards = (state: 'Pending' | 'Failed') => ({
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
      // ours
      address: '2cWKMJemoBam9FHms2YNoTSaKGn5xCbN5FRhAa3seKgkfrAYujWrX8PRiFF2jVVMuM455',
      amount: '2100000',
      id: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed5460',
      index: 0,
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546'
    }
  ],
  outputs: [
    {
      address: '2cWKMJemoBakYwphS2CYUDzm9jTvoKGeyUy43JXdKmSzEEdWMMnjD7REMX4kCdWj5W5U6',
      amount: '1900000'
    }
  ]
});

const pointlessTx = {
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
      address: '2cWKMJemoBakYwphS2CYUDzm9jTvoKGeyUy43JXdKmSzEEdWMMnjD7REMX4kCdWj5W5U6',
      amount: '4000000',
      id: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed5461',
      index: 1,
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546'
    }
  ],
  outputs: [
    {
      address: '2cWKMJemoBakYwphS2CYUDzm9jTvoKGeyUy43JXdKmSzEEdWMMnjD7REMX4kCdWj5W5U6',
      amount: '3800000'
    },
  ]
};

beforeEach(() => {
  mockDate();
});

async function baseTest(
  type: 'Pending' | 'Failed',
): Promise<void> {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver = await setup(db);

  const networkTransactions = [initialPendingTx(type)];
  const checkAddressesInUse = genCheckAddressesInUse(networkTransactions);
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(
    networkTransactions
  );
  const getBestBlock = genGetBestBlock(networkTransactions);

  const withDisplayCutoff = asDisplayCutoff(publicDeriver);
  if (!withDisplayCutoff) throw new Error('missing display cutoff functionality');
  const withUtxos = asGetAllUtxos(withDisplayCutoff);
  if (!withUtxos) throw new Error('missing get all utxos functionality');
  const withUtxoBalance = asGetUtxoBalance(withDisplayCutoff);
  if (!withUtxoBalance) throw new Error('missing utxo balance functionality');
  const basePubDeriver = withUtxoBalance;

  // single pending tx
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
      expect(response).toEqual([]);
    }

    {
      const response = await basePubDeriver.getBalance();
      expect(response).toEqual(new BigNumber('0'));
    }

    {
      const response = await basePubDeriver.getBalance();
      expect(response).toEqual(new BigNumber('0'));
    }

    {
      const response = await basePubDeriver.getCutoff();
      expect(response).toEqual(0);
    }

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
  }

  // adding regular tx while pending tx still exists
  {
    networkTransactions.push(otherSpend);

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
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
            Digest: 1.249559827714551e-31,
            Ordinal: 0,
            BlockId: 1,
            LastUpdateTime: 1568392636000,
            Status: 1,
            TransactionId: 2
          },
          UtxoTransactionOutput: {
            AddressId: 5,
            Amount: '2100000',
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 2,
            UtxoTransactionOutputId: 3
          }
        }
      }]);
    }

    {
      const response = await basePubDeriver.getBalance();
      expect(response).toEqual(new BigNumber('2100000'));
    }

    {
      const response = await basePubDeriver.getBalance();
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
        Time: new Date(1),
      });
    }
  }

  // pending becomes successful
  {
    const previouslyPending = networkTransactions.shift();
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
      tx_state: 'Successful'
    };
    networkTransactions.push(newTx);

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
            BlockId: 2,
            LastUpdateTime: 1568392656000,
            Status: 1,
            TransactionId: 1
          },
          UtxoTransactionOutput: {
            AddressId: 5,
            Amount: '2100000',
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 1,
            UtxoTransactionOutputId: 1,
          }
        }
      },
      {
        address: '2cWKMJemoBam9FHms2YNoTSaKGn5xCbN5FRhAa3seKgkfrAYujWrX8PRiFF2jVVMuM455',
        addressing: {
          path: [2147483692, 2147485463, 2147483648, 0, 4],
          startLevel: 1,
        },
        output: {
          Transaction: {
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
            Digest: 1.249559827714551e-31,
            Ordinal: 0,
            BlockId: 1,
            LastUpdateTime: 1568392636000,
            Status: 1,
            TransactionId: 2
          },
          UtxoTransactionOutput: {
            AddressId: 5,
            Amount: '2100000',
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 2,
            UtxoTransactionOutputId: 3
          }
        }
      }]);
    }

    {
      const response = await basePubDeriver.getBalance();
      expect(response).toEqual(new BigNumber('4200000'));
    }

    {
      const response = await basePubDeriver.getBalance();
      expect(response).toEqual(new BigNumber('4200000'));
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
    networkTransactions.push(pendingOutwards(type));
    // need to add a pointless tx to advance the bestblock on the server
    networkTransactions.push(pointlessTx);

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
            BlockId: 2,
            LastUpdateTime: 1568392656000,
            Status: 1,
            TransactionId: 1
          },
          UtxoTransactionOutput: {
            AddressId: 5,
            Amount: '2100000',
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 1,
            UtxoTransactionOutputId: 1,
          }
        }
      },
      {
        address: '2cWKMJemoBam9FHms2YNoTSaKGn5xCbN5FRhAa3seKgkfrAYujWrX8PRiFF2jVVMuM455',
        addressing: {
          path: [2147483692, 2147485463, 2147483648, 0, 4],
          startLevel: 1,
        },
        output: {
          Transaction: {
            ErrorMessage: null,
            Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
            Digest: 1.249559827714551e-31,
            Ordinal: 0,
            BlockId: 1,
            LastUpdateTime: 1568392636000,
            Status: 1,
            TransactionId: 2
          },
          UtxoTransactionOutput: {
            AddressId: 5,
            Amount: '2100000',
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 2,
            UtxoTransactionOutputId: 3
          }
        }
      }]);
    }

    {
      const response = await basePubDeriver.getBalance();
      expect(response).toEqual(new BigNumber('4200000'));
    }

    {
      const response = await basePubDeriver.getBalance();
      expect(response).toEqual(new BigNumber('4200000'));
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

    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    expect((await db.export()).tables.Transaction).toEqual([{
      Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
      Digest: 8.191593645542673e-27,
      BlockId: 2,
      Ordinal: 0,
      Status: -2,
      LastUpdateTime: 1568392656000,
      ErrorMessage: null,
      TransactionId: 1
    },
    {
      Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
      Digest: 1.249559827714551e-31,
      BlockId: 1,
      Ordinal: 0,
      LastUpdateTime: 1568392636000,
      Status: -2,
      ErrorMessage: null,
      TransactionId: 2
    },
    {
      Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed547',
      Digest: 1.9060984568373646e-36,
      BlockId: null,
      Ordinal: null,
      LastUpdateTime: 1568392676000,
      // failed tx stays failed
      Status: type === 'Pending' ? -2 : -1,
      ErrorMessage: null,
      TransactionId: 3
    }]);

    {
      const response = await basePubDeriver.getAllUtxos();
      expect(response).toEqual([]);
    }

    {
      const response = await basePubDeriver.getBalance();
      expect(response).toEqual(new BigNumber('0'));
    }
  }

  const txList = await getAllUtxoTransactions(basePubDeriver.getDb(), {
    addressFetch: basePubDeriver,
  });
  expect(txList).toMatchSnapshot();

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

test('Syncing with pending', async (done) => {
  await baseTest('Pending');
  done();
});

test('Syncing with failed', async (done) => {
  await baseTest('Failed');
  done();
});

test('Pending dropped from backend without rollback', async (done) => {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver = await setup(db);

  // need pointless tx otherwise the remote response is ignore since remote has empty blockchain
  const networkTransactions = [pointlessTx, initialPendingTx('Pending')];
  const checkAddressesInUse = genCheckAddressesInUse(networkTransactions);
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(
    networkTransactions
  );
  const getBestBlock = genGetBestBlock(networkTransactions);

  const basePubDeriver = asGetAllUtxos(publicDeriver);
  expect(basePubDeriver != null).toEqual(true);
  if (basePubDeriver == null) {
    throw new Error('Syncing txs basePubDeriver != GetAllAddressesInstance');
  }

  // add the pending tx to our wallet
  await updateTransactions(
    db,
    basePubDeriver,
    checkAddressesInUse,
    getTransactionsHistoryForAddresses,
    getBestBlock,
  );

  // remove it from backend
  networkTransactions.pop();

  // resync so pending becomes failed
  await updateTransactions(
    db,
    basePubDeriver,
    checkAddressesInUse,
    getTransactionsHistoryForAddresses,
    getBestBlock,
  );

  expect((await db.export()).tables.Transaction).toEqual([
    {
      // pending tx that is now failed as expected
      Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
      Digest: 8.191593645542673e-27,
      BlockId: null,
      Ordinal: null,
      LastUpdateTime: 1568392636000,
      Status: -3,
      ErrorMessage: null,
      TransactionId: 1
    }
  ]);

  done();
});
