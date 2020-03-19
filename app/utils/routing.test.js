// @flow

import { visitPaths, buildRoute, switchRouteWallet } from './routing';
import { ROUTES } from '../routes-config';

test('Daedalus transfer from single small UTXO', async () => {
  for (const route of visitPaths(ROUTES)) {
    const builtRoute = buildRoute(route, { id: 0, });
    if (builtRoute.includes(':')) {
      throw new Error(`Unhandled param for route ${builtRoute}`);
    }
    const newRoute = switchRouteWallet(builtRoute, 1);
    expect(newRoute).toEqual(buildRoute(route, { id: 1, }));
  }
});
