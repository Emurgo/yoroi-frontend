// @flow

import BigNumber from 'bignumber.js';
import {
  schema,
} from 'lovefield';
import '../../../test-config';
import type { RemoteTransaction } from '../../../../adaTypes';
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
  PublicDeriver,
} from '../../models/PublicDeriver/index';

import {
  updateTransactions
} from '../updateTransactions';

jest.mock('../../database/initialSeed');

const networkTransactions: Array<RemoteTransaction> = [{
  // transaction that doesn't involve either wallet
  // just so blockchain isn't empty during tests
  hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed544',
  height: 0,
  block_hash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba24',
  time: '2019-09-13T16:36:56.000Z',
  last_update: '2019-09-13T16:36:56.000Z',
  tx_state: 'Successful',
  tx_ordinal: 0,
  epoch: 0,
  slot: 0,
  inputs: [
    {
      address: '2cWKMJemoBaiw2vnBSiChVe9owqcymJJUq9UdTFzn3QLjvqvoLRVadugTfMtcJXQKcoWW',
      amount: '4000000',
      id: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d190',
      index: 0,
      txHash: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d19'
    }
  ],
  outputs: [
    {
      address: '2cWKMJemoBaiw2vnBSiChVe9owqcymJJUq9UdTFzn3QLjvqvoLRVadugTfMtcJXQKcoWW',
      amount: '3800000'
    },
  ]
},
{
  hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
  height: 1,
  block_hash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba25',
  time: '2019-09-13T16:37:16.000Z',
  last_update: '2019-09-13T16:37:16.000Z',
  tx_state: 'Successful',
  tx_ordinal: 0,
  epoch: 0,
  slot: 1,
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
      // mnemonic1
      address: '2cWKMJemoBam9FHms2YNoTSaKGn5xCbN5FRhAa3seKgkfrAYujWrX8PRiFF2jVVMuM455',
      amount: '2100000'
    },
    {
      // mnemonic2
      address: '2cWKMJemoBajuCcDYHncArxP5JVaJ8FZeVtH1X49NEizHfSFAp6bSKppwhUyPZzi3mYMZ',
      amount: '2700000'
    }
  ]
}];

const mnemonic1 = 'prevent company field green slot measure chief hero apple task eagle sunset endorse dress seed';
const mnemonic2 = 'eight country switch draw meat scout mystery blade tip drift useless good keep usage title';

beforeEach(() => {
  mockDate();
});

async function checkPub1HasTx(
  publicDeriver1: PublicDeriver,
): Promise<void> {
  const withDisplayCutoff = asDisplayCutoff(publicDeriver1);
  if (!withDisplayCutoff) throw new Error('missing display cutoff functionality');
  const withUtxoBalance = asGetUtxoBalance(withDisplayCutoff);
  if (!withUtxoBalance) throw new Error('missing utxo balance functionality');
  const basePubDeriver = withUtxoBalance;

  expect(basePubDeriver != null).toEqual(true);
  if (basePubDeriver == null) {
    throw new Error('basePubDeriver missing a functionality');
  }

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
}
async function checkPub2IsEmpty(
  publicDeriver2: PublicDeriver,
): Promise<void> {
  const withDisplayCutoff = asDisplayCutoff(publicDeriver2);
  if (!withDisplayCutoff) throw new Error('missing display cutoff functionality');
  const withUtxoBalance = asGetUtxoBalance(withDisplayCutoff);
  if (!withUtxoBalance) throw new Error('missing utxo balance functionality');
  const basePubDeriver = withUtxoBalance;

  expect(basePubDeriver != null).toEqual(true);
  if (basePubDeriver == null) {
    throw new Error('basePubDeriver missing a functionality');
  }

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
}
async function checkPub2HasTx(
  publicDeriver2: PublicDeriver,
): Promise<void> {
  const withDisplayCutoff = asDisplayCutoff(publicDeriver2);
  if (!withDisplayCutoff) throw new Error('missing display cutoff functionality');
  const withUtxoBalance = asGetUtxoBalance(withDisplayCutoff);
  if (!withUtxoBalance) throw new Error('missing utxo balance functionality');
  const basePubDeriver = withUtxoBalance;

  expect(basePubDeriver != null).toEqual(true);
  if (basePubDeriver == null) {
    throw new Error('basePubDeriver missing a functionality');
  }

  {
    console.log('sadf');
    const response = await basePubDeriver.getAllUtxos();
    expect(response).toEqual([{
      address: '2cWKMJemoBajuCcDYHncArxP5JVaJ8FZeVtH1X49NEizHfSFAp6bSKppwhUyPZzi3mYMZ',
      addressing: {
        path: [2147483692, 2147485463, 2147483648, 0, 0],
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
          TransactionId: 2
        },
        UtxoTransactionOutput: {
          AddressId: 41,
          Amount: '2700000',
          IsUnspent: true,
          OutputIndex: 1,
          TransactionId: 2,
          UtxoTransactionOutputId: 4
        }
      }
    }]);
  }

  {
    const response = await basePubDeriver.getBalance();
    expect(response).toEqual(new BigNumber('2700000'));
  }

  {
    const response = await basePubDeriver.getBalance();
    expect(response).toEqual(new BigNumber('2700000'));
  }

  {
    const response = await basePubDeriver.getCutoff();
    expect(response).toEqual(0);
  }
}

test('Syncing simple transaction', async (done) => {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver1 = await setup(db, mnemonic1);
  const publicDeriver2 = await setup(db, mnemonic2);

  const checkAddressesInUse = genCheckAddressesInUse(networkTransactions);
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(
    networkTransactions
  );
  const getBestBlock = genGetBestBlock(networkTransactions);

  const withUtxos1 = asGetAllUtxos(publicDeriver1);
  expect(withUtxos1 != null).toEqual(true);
  if (withUtxos1 == null) {
    throw new Error('Syncing txs publicDeriver1 != GetAllAddressesInstance');
  }
  const withUtxos2 = asGetAllUtxos(publicDeriver2);
  expect(withUtxos2 != null).toEqual(true);
  if (withUtxos2 == null) {
    throw new Error('Syncing txs publicDeriver2 != GetAllAddressesInstance');
  }

  // update balance for publicDeriver1
  {
    await updateTransactions(
      db,
      withUtxos1,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );
    await checkPub1HasTx(publicDeriver1);

    {
      // const foo: IGetLastSyncInfo = publicDeriver1;
      const response = await publicDeriver1.getLastSyncInfo();
      expect(response).toEqual({
        BlockHash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba25',
        LastSyncInfoId: 1,
        SlotNum: 1,
        Height: 1,
        Time: new Date(0),
      });
    }
  }

  // update balance for publicDeriver2
  {
    // 1) check that nothing happened before syncing

    await checkPub2IsEmpty(publicDeriver2);
    {
      const response = await publicDeriver2.getLastSyncInfo();
      expect(response).toEqual({
        BlockHash: null,
        LastSyncInfoId: 2,
        SlotNum: null,
        Height: 0,
        Time: null,
      });
    }

    // now sync and make sure it updated
    await updateTransactions(
      db,
      withUtxos2,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    await checkPub2HasTx(publicDeriver2);
    {
      const response = await publicDeriver2.getLastSyncInfo();
      expect(response).toEqual({
        BlockHash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba25',
        LastSyncInfoId: 2,
        SlotNum: 1,
        Height: 1,
        Time: new Date(1),
      });
    }
  }

  // pop transaction to trigger rollback
  networkTransactions.pop();

  // check rollback on wallet 2
  {
    await updateTransactions(
      db,
      withUtxos2,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );
    await checkPub2IsEmpty(publicDeriver2);
    {
      // make sure last sync info got reset to ensure rollback did happen
      const response = await publicDeriver2.getLastSyncInfo();
      expect(response).toEqual({
        BlockHash: null,
        LastSyncInfoId: 2,
        SlotNum: null,
        Height: 0,
        Time: new Date(2),
      });
    }
  }

  // check rollback didn't affect wallet 1
  {
    await checkPub1HasTx(publicDeriver1);
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
