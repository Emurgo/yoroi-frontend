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

export default (isDebug: boolean) => buildManifest({
  description: '[testnet] Cardano ADA wallet',
  defaultTitle: '[testnet] Yoroi',
  contentSecurityPolicy: genCSP({
    isDev: isDebug,
    additional: {
      'connect-src': [serverToPermission(Servers.ByronTestnet)],
    },
  }),
  version: Version.Byron,
  versionName: 'tn-1.10.0',
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
});
