// @flow

import buildManifest from './manifest.template';
import {
  Ports,
  portToPermission,
  portToSocketPermission,
} from '../scripts/connections';
import {
  genCSP,
} from './constants';
import pkg from '../package.json';

export default (isDebug: boolean): * => buildManifest({
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
});
