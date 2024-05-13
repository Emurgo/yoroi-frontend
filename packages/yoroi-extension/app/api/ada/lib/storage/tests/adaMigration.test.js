// @flow

import '../../test-config.forTests';
import { schema, } from 'lovefield';
import type { lf$Database } from 'lovefield';
import { setLocalItem } from '../../../../localStorage/primitives';
import oldStorageMemory from './__yoroi_snapshots__/historical-version-1_9_0/software/localStorage.forTests.json'
import oldStorageTrezor from './__yoroi_snapshots__/historical-version-1_9_0/trezor/localStorage.forTests.json';
import oldStorageLedger from './__yoroi_snapshots__/historical-version-1_9_0/ledger/localStorage.forTests.json';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import {
  dumpByVersion,
  loadLovefieldDB,
  loadLovefieldDBFromDump
} from '../database/index';
import { storageV2Migration, populateNewUtxodata } from '../adaMigration';
import { mockDate, filterDbSnapshot } from '../../../../jestUtils.forTests';
import utxoTestDbDump from './testDb.dump.json';

beforeAll(async () => {
  await RustModule.load();
});

beforeEach(() => {
  mockDate();
});

async function baseTest(
  db: lf$Database,
): Promise<void> {
  // need to fake having data in the legacy DB format for migration to trigger
  dumpByVersion.test = [];

  await storageV2Migration(db);

  const keysForTest = [
    'ConceptualWallet',
    'Key',
    'Bip44Wrapper',
    'RootDerivation',
    'PurposeDerivation',
    'CoinTypeDerivation',
    'Bip44Account',
    'Bip44Chain',
    'HwWalletMeta',
    'KeyDerivation',
  ];

  const dump = (await db.export()).tables;
  filterDbSnapshot(dump, keysForTest);
}

test('Migrate memory storage v1 to storage v2', async (done) => {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  for (const key of Object.keys(oldStorageMemory)) {
    await setLocalItem(key, oldStorageMemory[key]);
  }

  await baseTest(db);
  done();
});

test('Migrate trezor storage v1 to storage v2', async (done) => {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  for (const key of Object.keys(oldStorageTrezor)) {
    await setLocalItem(key, oldStorageTrezor[key]);
  }

  await baseTest(db);
  done();
});

test('Migrate ledger storage v1 to storage v2', async (done) => {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  for (const key of Object.keys(oldStorageLedger)) {
    await setLocalItem(key, oldStorageLedger[key]);
  }

  await baseTest(db);
  done();
});

test('Migrate to Yoroi-lib UtxoService storage', async () => {
  const db = await loadLovefieldDBFromDump(schema.DataStoreType.MEMORY, utxoTestDbDump);

  await populateNewUtxodata(db);

  const dump = await db.export();

  expect(dump.tables.UtxoAtSafePointTable).toEqual(
    [
      {
        PublicDeriverId: 1,
        UtxoAtSafePoint: {
          lastSafeBlockHash: 'a9835cc1e0f9b6c239aec4c446a6e181b7db6a80ad53cc0b04f70c6b85e9ba26',
          utxos: [
            {
              utxoId: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed5460',
              txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
              txIndex: 0,
              receiver: 'Ae2tdPwUPEZ3Kt2BJnDMQggxEA4c9MTagByH41rJkv2k82dBch2nqMAdyHJ',
              amount: '1100000',
              assets: [
                {
                  assetId: '0ccb954ed44c1cd267f21f628317637679887033564eef61857a0b62.616263',
                  policyId: '0ccb954ed44c1cd267f21f628317637679887033564eef61857a0b62',
                  name: '616263',
                  amount: '1'
                }
              ],
              blockNum: 218609
            },
            {
              utxoId: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed5461',
              txHash: '29f2fe214ec2c9b05773a689eca797e903adeaaf51dfe20782a4bf401e7ed546',
              txIndex: 1,
              receiver: 'Ae2tdPwUPEYxsngJhnW49jrmGuaCvQK34Hqrnx5w5SWxgfjDkSDcnrRdT5G',
              amount: '900000',
              assets: [],
              blockNum: 218609
            }
          ]
        },
        UtxoAtSafePointId: 1
      }
    ]
  );
});
