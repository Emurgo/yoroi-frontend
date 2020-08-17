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
import { SEIZA_URL, POOLS_UI_URL_FOR_YOROI } from './manifestEnvs';

export default (isDebug: boolean): * => buildManifest({
  description: 'A simple, secure and fast Cardano ADA wallet.',
  defaultTitle: 'Yoroi Shelley Testnet',
  titleOverride: true,
  contentSecurityPolicy: genCSP({
    isDev: isDebug,
    additional: {
      'connect-src': [serverToPermission(Servers.ShelleyITN)],
      'frame-src': [
        POOLS_UI_URL_FOR_YOROI,
        SEIZA_URL,
      ],
    },
  }),
  iconOverride: {
    /* eslint-disable quote-props */
    '16': 'img/shelley-16.png',
    '48': 'img/shelley-48.png',
    '128': 'img/shelley-128.png',
    /* eslint-enable quote-props */
  },
  version: Version.Shelley,
  geckoKey: '{842ae5af-a7ff-4e99-afb6-bd6c4043bcfa}',
  enableProtocolHandlers: false,
});
