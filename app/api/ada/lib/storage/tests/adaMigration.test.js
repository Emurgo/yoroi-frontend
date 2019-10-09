// @flow

import '../../test-config';
import { schema, } from 'lovefield';
import { setLocalItem } from '../../../../localStorage/primitives';
import oldStorage from '../../../../../../features/yoroi_snapshots/historical-versions/1_9_0/software/localStorage';
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

test('Migrate storage v1 to storage v2', async (done) => {
  const db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  for (const key of Object.keys(oldStorage)) {
    await setLocalItem(key, oldStorage[key]);
  }

  const migrationResult = await storagev2Migation(db);

  const keysForTest = [
    'ConceptualWallet',
    'Key',
    'Bip44Wrapper',
    'Bip44Root', // why two roots?
    'Bip44Purpose',
    'Bip44CoinType', // TODO: why is this missing?
    'Bip44Account',
    'Bip44Chain',
    'HwWalletMeta', // TODO: another test that makes use of this
  ];

  const dump = (await db.export()).tables;
  filterDbSnapshot(dump, keysForTest);
  done();
});
