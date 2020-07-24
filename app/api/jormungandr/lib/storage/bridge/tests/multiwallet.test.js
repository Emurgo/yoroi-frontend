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
} from '../../../../../jestUtils';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
} from '../../../../../../config/numbersConfig';
import type { WalletTypePurposeT } from '../../../../../../config/numbersConfig';
import {
  genCheckAddressesInUse,
  genGetTransactionsHistoryForAddresses,
  genGetBestBlock,
  getSingleAddressString,
} from '../../../state-fetch/mockNetwork';
import { loadLovefieldDB } from '../../../../../ada/lib/storage/database/index';

import {
  PublicDeriver,
} from '../../../../../ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asDisplayCutoff,
  asGetUtxoBalance,
} from '../../../../../ada/lib/storage/models/PublicDeriver/traits';

import {
  updateTransactions,
  removeAllTransactions,
} from '../updateTransactions';
import {
  networks,
} from '../../../../../ada/lib/storage/database/prepackaged/networks';
import { TransactionType } from '../../../../../ada/lib/storage/database/primitives/tables';

jest.mock('../../../../../ada/lib/storage/database/initialSeed');

const TX_TEST_MNEMONIC_2 = 'eight country switch draw meat scout mystery blade tip drift useless good keep usage title';

const networkTransactions: number => Array<RemoteTransaction> = (purpose) => [{
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
      id: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d190',
      index: 0,
      txHash: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d19'
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
      // Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc
      address: getSingleAddressString(
        TX_TEST_MNEMONIC_2,
        [
          purpose,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          0
        ]
      ),
      amount: '2700000'
    }
  ]
}];

beforeEach(() => {
  mockDate();
});

async function checkPub1HasTx(
  purposeForTest: number,
  publicDeriver1: PublicDeriver<>,
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
          TransactionId: 1
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
}
async function checkPub2IsEmpty(
  publicDeriver2: PublicDeriver<>,
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
    const response = await basePubDeriver.getUtxoBalance();
    expect(response).toEqual(new BigNumber('0'));
  }

  {
    const response = await basePubDeriver.getUtxoBalance();
    expect(response).toEqual(new BigNumber('0'));
  }

  {
    const response = await basePubDeriver.getCutoff();
    expect(response).toEqual(0);
  }
}
async function checkPub2HasTx(
  purposeForTest: number,
  publicDeriver2: PublicDeriver<>,
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
    const expectedAddressing = [
      purposeForTest,
      CoinTypes.CARDANO,
      0 + HARD_DERIVATION_START,
      ChainDerivations.EXTERNAL,
      0
    ];
    const response = await basePubDeriver.getAllUtxos();
    expect(response).toEqual([{
      // Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc
      address: getSingleAddressString(
        TX_TEST_MNEMONIC_2,
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
          TransactionId: 2
        },
        UtxoTransactionOutput: {
          AddressId: purposeForTest === WalletTypePurpose.CIP1852
            ? 82
            : 41,
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
    const response = await basePubDeriver.getUtxoBalance();
    expect(response).toEqual(new BigNumber('2700000'));
  }

  {
    const response = await basePubDeriver.getUtxoBalance();
    expect(response).toEqual(new BigNumber('2700000'));
  }

  {
    const response = await basePubDeriver.getCutoff();
    expect(response).toEqual(0);
  }
}

async function syncingSimpleTransaction(
  purposeForTest: WalletTypePurposeT,
): Promise<void> {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver1 = await setup(db, TX_TEST_MNEMONIC_1, purposeForTest);
  const publicDeriver2 = await setup(db, TX_TEST_MNEMONIC_2, purposeForTest);

  const txHistory = networkTransactions(purposeForTest);
  const network = networks.JormungandrMainnet;
  const checkAddressesInUse = genCheckAddressesInUse(txHistory, network);
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(
    txHistory,
    network,
  );
  const getBestBlock = genGetBestBlock(txHistory);

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
    await checkPub1HasTx(purposeForTest, publicDeriver1);

    {
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

    await checkPub2HasTx(purposeForTest, publicDeriver2);
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
  const removedTx = txHistory.pop();

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
    await checkPub1HasTx(purposeForTest, publicDeriver1);
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

  // add back the tx, resync and then clear the wallet
  txHistory.push(removedTx);
  {
    // now sync and make sure it updated
    await updateTransactions(
      db,
      withUtxos2,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    await checkPub2HasTx(purposeForTest, publicDeriver2);

    await removeAllTransactions({ publicDeriver: withUtxos2 });

    // wallet 1 should not be affected
    await checkPub1HasTx(purposeForTest, publicDeriver1);

    // wallet 2 should be cleared
    await checkPub2IsEmpty(publicDeriver2);
  }
}

test('Syncing simple transaction bip44', async (done) => {
  await syncingSimpleTransaction(WalletTypePurpose.BIP44);
  done();
});
test('Syncing simple transaction cip1852', async (done) => {
  await syncingSimpleTransaction(WalletTypePurpose.CIP1852);
  done();
});
