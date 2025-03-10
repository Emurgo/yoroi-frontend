// @flow
/* eslint-disable  import/no-unused-modules */

import buildManifest from './manifest.template';
import { Servers, serverToPermission } from '../scripts/connections';
import { genCSP, speculosEndpoint } from './constants';
import pkg from '../package.json';

export default (isDebug: boolean, shouldInjectConnector: boolean): * => buildManifest({
  description: 'e2e test Cardano ADA wallet',
  defaultTitle: 'e2e test Yoroi',
  contentSecurityPolicy: genCSP({
    isDev: isDebug,
    additional: {
      'connect-src': [
        serverToPermission(Servers.Primary),
        serverToPermission(Servers.Testnet),
        speculosEndpoint,
      ],
    },
  }),
  version: pkg.version,
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
  enableProtocolHandlers: false,
  shouldInjectConnector,
});
