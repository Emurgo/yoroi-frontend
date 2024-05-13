// @flow
/* eslint-disable  import/no-unused-modules */

import buildManifest from './manifest.template';
import {
  Ports,
  portToPermission,
} from '../scripts/connections';
import {
  genCSP,
} from './constants';
import pkg from '../package.json';

export default (isDebug: boolean, shouldInjectConnector: boolean): * => buildManifest({
  description: '[localhost] Cardano ADA wallet',
  defaultTitle: '[localhost] Yoroi',
  contentSecurityPolicy: genCSP({
    isDev: isDebug,
    additional: {
      'connect-src': [
        portToPermission(Ports.DevBackendServer),
      ],
    },
  }),
  version: pkg.version,
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
  enableProtocolHandlers: false,
  shouldInjectConnector,
});
