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
  filterDbSnapshot,
} from '../../../../../jestUtils.forTests';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
} from '../../../../../../config/numbersConfig';
import type { WalletTypePurposeT } from '../../../../../../config/numbersConfig';
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
  PublicDeriver,
} from '../../models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asDisplayCutoff,
  asGetUtxoBalance,
} from '../../models/PublicDeriver/traits';

import {
  updateUtxos,
  updateTransactions,
  removeAllTransactions,
} from '../updateTransactions';
import {
  networks,
} from '../../database/prepackaged/networks';
import UtxoApi from '../../../state-fetch/utxoApi';
import { RustModule } from '../../../cardanoCrypto/rustLoader';

jest.mock('../../database/initialSeed');

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
      txHash: '9c8d3c4fe576f8c99d8ad6ba5d889f5a9f2d7fe07dc17b3f425f5d17696f3d19',
      assets: [],
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
      amount: '3800000',
      assets: [],
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
      amount: '2700000',
      assets: [],
    }
  ]
}];

beforeAll(async () => {
  await RustModule.load();
});

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
          Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
        },
        UtxoTransactionOutput: {
          OutputIndex: 0,
          ErgoBoxId: null,
          ErgoCreationHeight: null,
          ErgoRegisters: null,
          ErgoTree: null,
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
          Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
        },
        UtxoTransactionOutput: {
          OutputIndex: 1,
          ErgoBoxId: null,
          ErgoCreationHeight: null,
          ErgoRegisters: null,
          ErgoTree: null,
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
            Amount: '2700000',
          },
        }],
      }
    }]);
  }

  {
    const response = await basePubDeriver.getUtxoBalance();
    expect(response.getDefault()).toEqual(new BigNumber('2700000'));
  }

  {
    const response = await basePubDeriver.getUtxoBalance();
    expect(response.getDefault()).toEqual(new BigNumber('2700000'));
  }

  {
    const response = await basePubDeriver.getCutoff();
    expect(response).toEqual(0);
  }
}

async function syncingSimpleTransaction(
  purposeForTest: WalletTypePurposeT,
): Promise<void> {
  const txHistory = networkTransactions(purposeForTest);
  UtxoApi.utxoApiFactory = (_: string) => new MockUtxoApi(txHistory, 0);

  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver1 = await setup(db, TX_TEST_MNEMONIC_1, purposeForTest);
  const publicDeriver2 = await setup(db, TX_TEST_MNEMONIC_2, purposeForTest);

  const network = networks.CardanoMainnet;
  const checkAddressesInUse = genCheckAddressesInUse(txHistory, network);
  const getBestBlock = genGetBestBlock(txHistory);
  const getTokenInfo = genGetTokenInfo();
  const getMultiAssetMetadata = genGetMultiAssetMetadata();
  const getMultiAssetSupply = genGetMultiAssetSupply();
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(txHistory, network);
  const getRecentTransactionHashes = genGetRecentTransactionHashes(txHistory);
  const getTransactionsByHashes = genGetTransactionsByHashes(txHistory);

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
    await updateUtxos(
      db,
      withUtxos1,
      checkAddressesInUse,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );
    await updateTransactions(
      db,
      withUtxos1,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getRecentTransactionHashes,
      getTransactionsByHashes,
      getBestBlock,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
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
    await updateUtxos(
      db,
      withUtxos2,
      checkAddressesInUse,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );
    await updateTransactions(
      db,
      withUtxos2,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getRecentTransactionHashes,
      getTransactionsByHashes,
      getBestBlock,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
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
    await updateUtxos(
      db,
      withUtxos2,
      checkAddressesInUse,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );
    await updateTransactions(
      db,
      withUtxos2,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getRecentTransactionHashes,
      getTransactionsByHashes,
      getBestBlock,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );
    await checkPub2IsEmpty(publicDeriver2);
    {
      const response = await publicDeriver2.getLastSyncInfo();
      expect(response).toEqual({
        BlockHash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba24',
        LastSyncInfoId: 2,
        SlotNum: 0,
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
    'Block',
    'Token',
    'TokenList',
  ];
  const dump = (await db.export()).tables;
  filterDbSnapshot(dump, keysForTest);

  // add back the tx, resync and then clear the wallet
  txHistory.push(removedTx);
  {
    // now sync and make sure it updated
    await updateUtxos(
      db,
      withUtxos2,
      checkAddressesInUse,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
    );
    await updateTransactions(
      db,
      withUtxos2,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getRecentTransactionHashes,
      getTransactionsByHashes,
      getBestBlock,
      getTokenInfo,
      getMultiAssetMetadata,
      getMultiAssetSupply,
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
