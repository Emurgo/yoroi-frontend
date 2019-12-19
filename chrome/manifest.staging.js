// @flow

import buildManifest from './manifest.template';
import {
  Servers,
  serverToPermission,
} from '../scripts/connections';
import {
  Version,
  genCSP,
} from './constants';

export default buildManifest({
  description: '[staging] Cardano ADA wallet',
  defaultTitle: '[staging] Yoroi',
  contentSecurityPolicy: genCSP({
    isDev: false,
    additional: {
      'connect-src': [serverToPermission(Servers.ByronStaging)],
    },
  }),
  version: Version.Byron,
  version_name: 'st-1.10.0',
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
});
