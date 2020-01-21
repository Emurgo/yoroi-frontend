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
  description: 'A simple, secure and fast Cardano ADA wallet.',
  defaultTitle: 'Yoroi',
  titleOverride: true,
  contentSecurityPolicy: genCSP({
    isDev: false,
    additional: {
      'connect-src': [serverToPermission(Servers.ByronMainnet)],
    },
  }),
  version: Version.Byron,
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
});
