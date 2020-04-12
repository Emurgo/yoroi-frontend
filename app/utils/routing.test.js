// @flow

import { visitPaths, buildRoute, switchRouteWallet } from './routing';
import { ROUTES } from '../routes-config';

test('Daedalus transfer from single small UTXO', async () => {
  for (const route of visitPaths(ROUTES)) {
    const builtRoute = buildRoute(route, {
      token: 'a',
      token_type: 'a',
      uid: 'a',
      account_id: 'a',
      id: 0,
    });
    console.log(builtRoute);
    if (builtRoute.includes(':')) {
      throw new Error(`Unhandled param for route ${builtRoute}`);
    }
    const newRoute = switchRouteWallet(builtRoute, 1);
    expect(newRoute).toEqual(buildRoute(route, { id: 1, }));
  }
});
