// @flow

import '../../test-config';
import { schema, } from 'lovefield';
import type { lf$Database } from 'lovefield';
import { setLocalItem } from '../../../../localStorage/primitives';
import oldStorageMemory from '../../../../../../features/yoroi_snapshots/historical-versions/1_9_0/software/localStorage';
import oldStorageTrezor from '../../../../../../features/yoroi_snapshots/historical-versions/1_9_0/trezor/localStorage';
import oldStorageLedger from '../../../../../../features/yoroi_snapshots/historical-versions/1_9_0/ledger/localStorage';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import { loadLovefieldDB } from '../database/index';
import { storagev2Migation } from '../adaMigration';
import { mockDate, filterDbSnapshot } from '../bridge/tests/common';

beforeAll(async () => {
  await RustModule.load();
});

beforeEach(() => {
  mockDate();
});

async function baseTest(
  db: lf$Database,
): Promise<void> {
  await storagev2Migation(db);

  const keysForTest = [
    'ConceptualWallet',
    'Key',
    'Bip44Wrapper',
    'Bip44Root',
    'Bip44Purpose',
    'Bip44CoinType',
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
