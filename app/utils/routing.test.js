// @flow

import { visitPaths, buildRoute, switchRouteWallet } from './routing';
import { ROUTES } from '../routes-config';

test('Daedalus transfer from single small UTXO', async () => {
  for (const route of visitPaths(ROUTES)) {
    const unrelatedParams = {
      token: 'a',
      token_type: 'a',
      uid: 'a',
      account_id: 'a',
      group: 'a',
      name: 'a',
    };
    const builtRoute = buildRoute(route, {
      ...unrelatedParams,
      id: 0,
    });
    if (builtRoute.includes(':')) {
      throw new Error(`Unhandled param for route ${builtRoute}`);
    }
    const newRoute = switchRouteWallet(builtRoute, 1);
    expect(newRoute).toEqual(buildRoute(route, { id: 1, ...unrelatedParams, }));
  }
});
