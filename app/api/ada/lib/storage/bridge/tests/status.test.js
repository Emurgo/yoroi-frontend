// @flow

import BigNumber from 'bignumber.js';
import {
  schema,
} from 'lovefield';
import '../../../test-config';
import type { RemoteTransaction, RemoteTxBlockMeta, } from '../../../state-fetch/types';
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
  getSingleAddressString,
} from '../../../state-fetch/mockNetwork';
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
  updateTransactions, getAllTransactions
} from '../updateTransactions';
import { TransactionType } from '../../database/primitives/tables';

jest.mock('../../database/initialSeed');

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
      txHash: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d21'
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
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546'
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
      amount: '1900000'
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
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546'
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
      amount: '3800000'
    },
  ]
});

beforeEach(() => {
  mockDate();
});

async function baseTest(
  type: 'Pending' | 'Failed',
  purposeForTest: WalletTypePurposeT,
): Promise<void> {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver = await setup(db, TX_TEST_MNEMONIC_1, purposeForTest);

  const network = networks.ByronMainnet;
  const networkTransactions: Array<RemoteTransaction> = [initialPendingTx(type, purposeForTest)];
  const checkAddressesInUse = genCheckAddressesInUse(networkTransactions, network);
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(
    networkTransactions,
    network,
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
    networkTransactions.push(otherSpend(purposeForTest));

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
            Type: TransactionType.CardanoByron,
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
        Time: new Date(1),
      });
    }
  }

  // pending becomes successful
  {
    const previouslyPending: RemoteTransaction = networkTransactions.shift();
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
            Type: TransactionType.CardanoByron,
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
      const response = await basePubDeriver.getUtxoBalance();
      expect(response).toEqual(new BigNumber('4200000'));
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
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
    networkTransactions.push(pendingOutwards(type, purposeForTest));
    // need to add a pointless tx to advance the bestblock on the server
    networkTransactions.push(pointlessTx(purposeForTest));

    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    {
      const response = await basePubDeriver.getAllUtxos();
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
      const response = await basePubDeriver.getUtxoBalance();
      expect(response).toEqual(new BigNumber('4200000'));
    }

    {
      const response = await basePubDeriver.getUtxoBalance();
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
      Type: TransactionType.CardanoByron,
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
      Type: TransactionType.CardanoByron,
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
      Type: TransactionType.CardanoByron,
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
      const response = await basePubDeriver.getUtxoBalance();
      expect(response).toEqual(new BigNumber('0'));
    }
  }

  const txList = await getAllTransactions({
    publicDeriver: basePubDeriver,
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
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver = await setup(db, TX_TEST_MNEMONIC_1, purposeForTest);

  // need pointless tx otherwise the remote response is ignore since remote has empty blockchain
  const networkTransactions = [
    pointlessTx(purposeForTest),
    initialPendingTx('Pending', purposeForTest)
  ];
  const network = networks.ByronMainnet;
  const checkAddressesInUse = genCheckAddressesInUse(networkTransactions, network);
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(
    networkTransactions,
    network
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
      Type: TransactionType.CardanoByron,
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
}

test('Pending dropped from backend without rollback bip44', async (done) => {
  await pendingDropped(WalletTypePurpose.BIP44);
  done();
});
