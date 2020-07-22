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
  getAddressForType,
  getSingleAddressString,
} from '../../../state-fetch/mockNetwork';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
} from '../../../../../../config/numbersConfig';
import { loadLovefieldDB } from '../../../../../ada/lib/storage/database/index';
import { CoreAddressTypes } from '../../../../../ada/lib/storage/database/primitives/enums';
import { RustModule } from '../../../../../ada/lib/cardanoCrypto/rustLoader';
import {
  networks,
} from '../../../../../ada/lib/storage/database/prepackaged/networks';
import {
  asGetAllAccounting,
  asGetAllUtxos,
  asDisplayCutoff,
  asGetUtxoBalance,
} from '../../../../../ada/lib/storage/models/PublicDeriver/traits';

import { getCertificates } from '../../../../../ada/lib/storage/models/utils';

import {
  removeAllTransactions,
} from '../../../../../ada/lib/storage/bridge/updateTransactions';
import {
  updateTransactions,
} from '../updateTransactions';

jest.mock('../../../../../ada/lib/storage/database/initialSeed');

const firstTx: void => Array<RemoteTransaction> = () => [{
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
          WalletTypePurpose.BIP44, // purposely use legacy address
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
      // eslint-disable-next-line max-len
      // '0465267961fefd53aefe4cf741dc0df9902d360bca0de4c0abe88ca89d0d08dd3dd993c5b8ca62c78801d3228a8de6b9e18217b001820c24d60c1bcd91c895d585'
      address: getAddressForType(
        TX_TEST_MNEMONIC_1,
        [
          WalletTypePurpose.CIP1852,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          4
        ],
        CoreAddressTypes.JORMUNGANDR_GROUP
      ),
      amount: '2100000'
    },
    {
      address: getSingleAddressString(
        ABANDON_SHARE,
        [
          WalletTypePurpose.BIP44, // purposely use legacy address
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

const nextRegularSpend: void => Array<RemoteTransaction> = () => [{
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
      // eslint-disable-next-line max-len
      // '0465267961fefd53aefe4cf741dc0df9902d360bca0de4c0abe88ca89d0d08dd3dd993c5b8ca62c78801d3228a8de6b9e18217b001820c24d60c1bcd91c895d585'
      address: getAddressForType(
        TX_TEST_MNEMONIC_1,
        [
          WalletTypePurpose.CIP1852,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          4
        ],
        CoreAddressTypes.JORMUNGANDR_GROUP
      ),
      amount: '2100000',
      id: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed5450',
      index: 0,
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545'
    }
  ],
  outputs: [
    {
      // eslint-disable-next-line max-len
      // '0465267961fefd53aefe4cf741dc0df9902d360bca0de4c0abe88ca89d0d08dd3dd993c5b8ca62c78801d3228a8de6b9e18217b001820c24d60c1bcd91c895d585'
      address: getAddressForType(
        TX_TEST_MNEMONIC_1,
        [
          WalletTypePurpose.CIP1852,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          0
        ],
        CoreAddressTypes.JORMUNGANDR_GROUP
      ),
      amount: '1100000'
    },
    {
      address: getAddressForType(
        TX_TEST_MNEMONIC_1,
        [
          WalletTypePurpose.CIP1852,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          19
        ],
        CoreAddressTypes.JORMUNGANDR_SINGLE
      ),
      amount: '900000'
    }
  ]
}];

const swappedKeyAddr = '0465267961fefd53aefe4cf741dc0df9902d360bca0de4c0abe88ca89d0d08dd3dd993c5b8ca62c78801d3228a8de6b9e18217b001820c24d60c1bcd91c895d500';
const txWithGroupSwapped: void => Array<RemoteTransaction> = () => [{
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
          WalletTypePurpose.BIP44, // purposely use leagcy address
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
      address: swappedKeyAddr,
      amount: '2100000'
    },
    {
      // 'Ae2tdPwUPEZE9RAm3d3zuuh22YjqDxhR1JF6G93uJsRrk51QGHzRUzLvDjL'
      address: getSingleAddressString(
        ABANDON_SHARE,
        [
          WalletTypePurpose.BIP44, // purposely use legacy address
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

const txWithCert: void => Array<RemoteTransaction> = () => [{
  hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
  height: 218608,
  block_hash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba25',
  time: '2019-09-13T16:37:16.000Z',
  last_update: '2019-09-13T16:37:16.000Z',
  tx_state: 'Successful',
  tx_ordinal: 0,
  epoch: 10,
  slot: 3650,
  certificate: {
    payloadKind: 'StakeDelegation',
    payloadKindId: RustModule.WalletV3.CertificateKind.StakeDelegation,
    payloadHex: 'd993c5b8ca62c78801d3228a8de6b9e18217b001820c24d60c1bcd91c895d58501312e3d449038372ba2fc3300cfedf1b152ae739201b3e5da47ab3f933a421b62',
  },
  inputs: [
    {
      // 'Ae2tdPwUPEZ5PxKxoyZDgjsKgMWMpTRa4PH3sVgARSGBsWwNBH3qg7cMFsP'
      address: getSingleAddressString(
        ABANDON_SHARE,
        [
          WalletTypePurpose.BIP44, // purposely use legacy address
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
      // eslint-disable-next-line max-len
      // '0465267961fefd53aefe4cf741dc0df9902d360bca0de4c0abe88ca89d0d08dd3dd993c5b8ca62c78801d3228a8de6b9e18217b001820c24d60c1bcd91c895d585'
      address: getAddressForType(
        TX_TEST_MNEMONIC_1,
        [
          WalletTypePurpose.CIP1852,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          4
        ],
        CoreAddressTypes.JORMUNGANDR_GROUP
      ),
      amount: '2100000'
    },
    {
      address: getAddressForType(
        ABANDON_SHARE,
        [
          WalletTypePurpose.CIP1852,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          12
        ],
        CoreAddressTypes.JORMUNGANDR_SINGLE
      ),
      amount: '1731391'
    }
  ]
}];

const secondCertTx: ('Pending' | 'Successful') => RemoteTransaction = status => Object.freeze({
  hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
  height: status === 'Pending' ? null : 218609,
  block_hash: status === 'Pending' ? null : 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba26',
  time: status === 'Pending' ? null : '2019-09-13T16:37:36.000Z',
  last_update: '2019-09-13T16:37:36.000Z',
  tx_state: status,
  tx_ordinal: status === 'Pending' ? null : 0,
  epoch: status === 'Pending' ? null : 10,
  slot: status === 'Pending' ? null : 3651,
  certificate: {
    payloadKind: 'StakeDelegation',
    payloadKindId: RustModule.WalletV3.CertificateKind.StakeDelegation,
    payloadHex: 'd993c5b8ca62c78801d3228a8de6b9e18217b001820c24d60c1bcd91c895d58501312e3d449038372ba2fc3300cfedf1b152ae739201b3e5da47ab3f933a421b62',
  },
  inputs: [
    {
      address: getAddressForType(
        ABANDON_SHARE,
        [
          WalletTypePurpose.CIP1852,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          12
        ],
        CoreAddressTypes.JORMUNGANDR_SINGLE
      ),
      amount: '1731391',
      id: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed5451',
      index: 1,
      txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545'
    }
  ],
  outputs: [
    {
      // eslint-disable-next-line max-len
      // '0465267961fefd53aefe4cf741dc0df9902d360bca0de4c0abe88ca89d0d08dd3dd993c5b8ca62c78801d3228a8de6b9e18217b001820c24d60c1bcd91c895d585'
      address: getAddressForType(
        TX_TEST_MNEMONIC_1,
        [
          WalletTypePurpose.CIP1852,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.EXTERNAL,
          4
        ],
        CoreAddressTypes.JORMUNGANDR_GROUP
      ),
      amount: '1000000'
    },
    {
      address: getAddressForType(
        ABANDON_SHARE,
        [
          WalletTypePurpose.CIP1852,
          CoinTypes.CARDANO,
          0 + HARD_DERIVATION_START,
          ChainDerivations.INTERNAL,
          13
        ],
        CoreAddressTypes.JORMUNGANDR_SINGLE
      ),
      amount: '200000'
    }
  ]
});

beforeEach(() => {
  mockDate();
});

async function syncingSimpleTransaction(): Promise<void> {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver = await setup(db, TX_TEST_MNEMONIC_1, WalletTypePurpose.CIP1852);

  const txHistory = firstTx();
  const network = networks.JormungandrMainnet;
  const checkAddressesInUse = genCheckAddressesInUse(txHistory, network);
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(
    txHistory,
    network
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

  // test legacy => group
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
        WalletTypePurpose.CIP1852,
        CoinTypes.CARDANO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
        4
      ];
      const response = await basePubDeriver.getAllUtxos();
      expect(response).toEqual([{
        // eslint-disable-next-line max-len
        // '0465267961fefd53aefe4cf741dc0df9902d360bca0de4c0abe88ca89d0d08dd3dd993c5b8ca62c78801d3228a8de6b9e18217b001820c24d60c1bcd91c895d585'
        address: getAddressForType(
          TX_TEST_MNEMONIC_1,
          expectedAddressing,
          CoreAddressTypes.JORMUNGANDR_GROUP
        ),
        addressing: {
          path: expectedAddressing,
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
            AddressId: 10,
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

  // test group => change + single
  {
    txHistory.push(...nextRegularSpend());

    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    {
      const expectedAddressing1 = [
        WalletTypePurpose.CIP1852,
        CoinTypes.CARDANO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.INTERNAL,
        0
      ];
      const expectedAddressing2 = [
        WalletTypePurpose.CIP1852,
        CoinTypes.CARDANO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
        19
      ];
      const response = await basePubDeriver.getAllUtxos();
      expect(response).toEqual([{
        // eslint-disable-next-line max-len
        // '04c7cb0e3cd882555eeb8ddc58947eb40cba96c671ccf6806e377287ca087ad1e9d993c5b8ca62c78801d3228a8de6b9e18217b001820c24d60c1bcd91c895d585'
        address: getAddressForType(
          TX_TEST_MNEMONIC_1,
          expectedAddressing1,
          CoreAddressTypes.JORMUNGANDR_GROUP
        ),
        addressing: {
          path: expectedAddressing1,
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
            AddressId: 42,
            Amount: '1100000',
            IsUnspent: true,
            OutputIndex: 0,
            TransactionId: 2,
            UtxoTransactionOutputId: 3
          }
        }
      },
      {
        // '038e2840fed90d2138761d8a14a4cbed08ed00cf908b07f94ec5fa9db6f4d7e74f'
        address: getAddressForType(
          TX_TEST_MNEMONIC_1,
          expectedAddressing2,
          CoreAddressTypes.JORMUNGANDR_SINGLE
        ),
        addressing: {
          path: expectedAddressing2,
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
            AddressId: 39,
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
        Time: new Date(1),
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

async function syncWithSwappedGroup(): Promise<void> {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver = await setup(db, TX_TEST_MNEMONIC_1, WalletTypePurpose.CIP1852);

  const txHistory = txWithGroupSwapped();
  const network = networks.JormungandrMainnet;
  const checkAddressesInUse = genCheckAddressesInUse(txHistory, network);
  const getTransactionsHistoryForAddresses = genGetTransactionsHistoryForAddresses(
    txHistory,
    network
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

  // test tx with swapped staking key
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
        WalletTypePurpose.CIP1852,
        CoinTypes.CARDANO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
        4
      ];
      const response = await basePubDeriver.getAllUtxos();
      expect(response).toEqual([{
        address: swappedKeyAddr,
        addressing: {
          path: expectedAddressing,
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
            AddressId: 92,
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

async function syncWithCertificate(): Promise<void> {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  const publicDeriver = await setup(db, TX_TEST_MNEMONIC_1, WalletTypePurpose.CIP1852);

  const txHistory = txWithCert();
  const network = networks.JormungandrMainnet;
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
  const withStakingKey = asGetAllAccounting(withUtxos);
  if (!withStakingKey) throw new Error('missing staking key functionality');
  const basePubDeriver = withStakingKey;

  expect(basePubDeriver != null).toEqual(true);
  if (basePubDeriver == null) {
    throw new Error('basePubDeriver missing a functionality');
  }

  const stakingAddr = await basePubDeriver.getStakingKey();

  // make sure fetching certificates works when 0 certs exist
  {
    const certs = await getCertificates(db, [stakingAddr.addr.AddressId]);
    expect(certs.length).toEqual(0);
  }

  const cert1 = {
    block: {
      BlockId: 1,
      BlockTime: new Date('2019-09-13T16:37:16.000Z'),
      Digest: -9.690691258114666e-56,
      Hash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba25',
      Height: 218608,
      SlotNum: 219650,
    },
    certificate: {
      CertificateId: 1,
      Kind: 0,
      Payload: 'd993c5b8ca62c78801d3228a8de6b9e18217b001820c24d60c1bcd91c895d58501312e3d449038372ba2fc3300cfedf1b152ae739201b3e5da47ab3f933a421b62',
      TransactionId: 1,
    },
    relatedAddresses: [{
      AddressId: 81,
      CertificateAddressId: 1,
      CertificateId: 1,
      Relation: 0,
    }],
    transaction: {
      BlockId: 1,
      Digest: 8.191593645542673e-27,
      ErrorMessage: null,
      Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed545',
      LastUpdateTime: 1568392636000,
      Ordinal: 0,
      Status: 1,
      TransactionId: 1,
    },
  };

  const keysForTest = [
    'Transaction',
    'UtxoTransactionInput',
    'UtxoTransactionOutput',
    'LastSyncInfo',
    'Certificate',
    'CertificateAddress',
  ];
  const beforeAnyTxs = (await db.export()).tables;

  // tx with cert
  {
    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    // certificate was added to wallet
    const certs = await getCertificates(db, [stakingAddr.addr.AddressId]);
    expect(certs).toEqual([cert1]);
  }

  const cert2 = {
    block: null,
    certificate: {
      CertificateId: 2,
      Kind: 0,
      Payload: 'd993c5b8ca62c78801d3228a8de6b9e18217b001820c24d60c1bcd91c895d58501312e3d449038372ba2fc3300cfedf1b152ae739201b3e5da47ab3f933a421b62',
      TransactionId: 2,
    },
    relatedAddresses: [{
      AddressId: 81,
      CertificateAddressId: 2,
      CertificateId: 2,
      Relation: 0,
    }],
    transaction: {
      BlockId: null,
      Digest: 1.249559827714551e-31,
      ErrorMessage: null,
      Hash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
      LastUpdateTime: 1568392656000,
      Ordinal: null,
      Status: 0,
      TransactionId: 2,
    },
  };

  // test with cert in pending tx
  {
    txHistory.push(secondCertTx('Pending'));
    await updateTransactions(
      db,
      basePubDeriver,
      checkAddressesInUse,
      getTransactionsHistoryForAddresses,
      getBestBlock,
    );

    // certificate was added to wallet
    const certs = await getCertificates(db, [stakingAddr.addr.AddressId]);
    expect(certs).toEqual([cert1, cert2]);
  }

  // snapshot test for certificate insertion
  const dump = (await db.export()).tables;
  filterDbSnapshot(dump, ['Block', 'Address', ...keysForTest]);


  await removeAllTransactions({ publicDeriver: basePubDeriver });
  const afterRemoval = (await db.export()).tables;
  compareObject(beforeAnyTxs, afterRemoval, new Set(keysForTest));
}

test('Syncing group addresses for cip1852', async (done) => {
  await syncingSimpleTransaction();
  done();
});

test('Syncing group address with swapped staking key', async (done) => {
  await syncWithSwappedGroup();
  done();
});

test('Syncing tx with a certificate', async (done) => {
  await syncWithCertificate();
  done();
});
