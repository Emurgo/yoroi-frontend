// @flow

import buildManifest from './manifest.template';
import {
  Ports,
  portToPermission,
  portToSocketPermission,
  Servers,
  serverToPermission,
} from '../scripts/connections';
import { SEIZA_URL, SEIZA_FOR_YOROI_URL } from './manifestEnvs';
import {
  Version,
  genCSP,
} from './constants';

export default buildManifest({
  description: '[dev] Cardano ADA wallet',
  defaultTitle: '[dev] Yoroi',
  contentSecurityPolicy: genCSP({
    isDev: true,
    additional: {
      'connect-src': [serverToPermission(Servers.ByronTestnet)],
    },
  }),
  version: Version.Byron,
  extensionKey: 'pojejnpjgcacmnpkdiklhlnlbkjechfh',
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
});
