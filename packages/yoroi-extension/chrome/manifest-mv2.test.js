// @flow

import buildManifest from './manifest-mv2.template';
import {
  Ports,
  portToPermission,
  portToSocketPermission,
} from '../scripts-mv2/connections';
import {
  genCSP,
} from './constants-mv2';
import pkg from '../package.json';

export default (isDebug: boolean, shouldInjectConnector: boolean): any=> buildManifest({
  description: '[localhost] Cardano ADA wallet',
  defaultTitle: '[localhost] Yoroi',
  contentSecurityPolicy: genCSP({
    isDev: isDebug,
    additional: {
      'connect-src': [
        portToPermission(Ports.DevBackendServe),
        portToSocketPermission(Ports.DevBackendServe),
        portToPermission(Ports.ErgoMockServer),
        portToSocketPermission(Ports.ErgoMockServer),
      ],
    },
  }),
  version: pkg.version,
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
  enableProtocolHandlers: false,
  shouldInjectConnector,
});
