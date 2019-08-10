// @flow
import { schema } from 'lovefield';

import * as lovefieldDatabase from './lovefieldDatabase';

beforeAll(async () => {
  await lovefieldDatabase.loadLovefieldDB({
    storeType: schema.DataStoreType.MEMORY,
  });
});

test('Store into and retrieve from coin price data cache', async () => {
  const data = [{ from: 'ADA', to: 'USD', price: 1 }];
  const timestamp = Date.now();

  await lovefieldDatabase.cachePriceData(timestamp, data);
  const retrieved = await lovefieldDatabase.getCachedPriceData(timestamp);
  expect(retrieved).toEqual(data);

  const nonexistent = await lovefieldDatabase.getCachedPriceData(1);
  expect(nonexistent).toBeNull();
});
