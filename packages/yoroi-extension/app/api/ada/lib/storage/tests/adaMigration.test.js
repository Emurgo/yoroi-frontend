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
} from '../database/index';
import { storageV2Migration } from '../adaMigration';
import { mockDate, filterDbSnapshot } from '../../../../jestUtils.forTests';

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
