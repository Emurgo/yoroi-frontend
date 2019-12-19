// @flow

import buildManifest from './manifest.template';
import {
  Ports,
  portToPermission,
  portToSocketPermission,
  Servers,
  serverToPermission,
} from '../scripts/connections';
import {
  Version,
  genCSP,
} from './constants';

export default buildManifest({
  description: '[shelley-dev] Cardano ADA wallet',
  defaultTitle: '[shelley-dev] Yoroi',
  titleOverride: true,
  contentSecurityPolicy: genCSP({
    isDev: true,
    additional: {
      'connect-src': [serverToPermission(Servers.ShelleyDev)],
    },
  }),
  extensionKey: 'pojejnpjgcacmnpkdiklhlnlbkjechfh',
  iconOverride: {
    /* eslint-disable quote-props */
    '16': 'img/shelley-16.png',
    '48': 'img/shelley-48.png',
    '128': 'img/shelley-128.png',
    /* eslint-enable quote-props */
  },
  version: Version.Shelley,
  geckoKey: '{842ae5af-a7ff-4e99-afb6-bd6c4043bcfa}',
});
