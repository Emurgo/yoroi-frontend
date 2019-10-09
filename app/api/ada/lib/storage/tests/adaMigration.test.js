// @flow

import { RustModule } from '../../cardanoCrypto/rustLoader';

beforeAll(async () => {
  await RustModule.load();
});

test('Migrate storage v1 to storage v2', async (done) => {

  // TODO
  done();
});
