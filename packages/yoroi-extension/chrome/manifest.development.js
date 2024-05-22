// @flow
/* eslint-disable  import/no-unused-modules */

import buildManifest from './manifest.template';
import {
  genCSP,
} from './constants';
import {
  Servers,
  serverToPermission,
} from '../scripts/connections';
import { CHANGELLY_URL, POOLS_UI_URL_FOR_YOROI } from './manifestEnvs'
import pkg from '../package.json';

export default (isDebug: boolean, shouldInjectConnector: boolean): * => buildManifest({
  description: '[dev] Cardano ADA wallet',
  defaultTitle: '[dev] Yoroi',
  contentSecurityPolicy: genCSP({
    isDev: isDebug,
    additional: {
      'connect-src': [
        serverToPermission(Servers.Primary),
        serverToPermission(Servers.Testnet),
      ],
      'frame-src': [
        POOLS_UI_URL_FOR_YOROI,
        CHANGELLY_URL,
      ],
    },
  }),
  version: pkg.version,
  extensionKey: 'pojejnpjgcacmnpkdiklhlnlbkjechfh',
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
  enableProtocolHandlers: true,
  shouldInjectConnector,
});
