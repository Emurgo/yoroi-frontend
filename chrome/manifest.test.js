// @flow

import buildManifest from './manifest.template';
import {
  Ports,
  portToPermission,
  portToSocketPermission,
} from '../scripts/connections';
import {
  Version,
  genCSP,
} from './constants';

export default buildManifest({
  description: '[localhost] Cardano ADA wallet',
  defaultTitle: '[localhost] Yoroi',
  contentSecurityPolicy: genCSP({
    isDev: false,
    additional: {
      'connect-src': [portToPermission(Ports.DevBackendServe), portToSocketPermission(Ports.DevBackendServe)],
    },
  }),
  version: Version.Byron,
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
});
