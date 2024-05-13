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
import pkg from '../package.json';

import { POOLS_UI_URL_FOR_YOROI, CHANGELLY_URL } from './manifestEnvs';

export default (isDebug: boolean, shouldInjectConnector: boolean): * => buildManifest({
  description: 'A simple, secure and fast Cardano ADA wallet.',
  defaultTitle: 'Yoroi',
  titleOverride: true,
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
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
  enableProtocolHandlers: true,
  shouldInjectConnector,
});
