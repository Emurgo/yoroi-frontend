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

import { POOLS_UI_URL_FOR_YOROI } from './manifestEnvs';

export default (isDebug: boolean): * => buildManifest({
  description: 'A simple, secure and fast Cardano ADA wallet.',
  defaultTitle: 'Yoroi',
  titleOverride: true,
  contentSecurityPolicy: genCSP({
    isDev: isDebug,
    additional: {
      'connect-src': [serverToPermission(Servers.ShelleyMainnet)],
      'frame-src': [
        POOLS_UI_URL_FOR_YOROI,
      ],
    },
  }),
  version: Version.Byron,
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
  enableProtocolHandlers: true,
});
