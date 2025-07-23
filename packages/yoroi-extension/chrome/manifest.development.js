// @flow
/* eslint-disable  import/no-unused-modules */

import buildManifest from './manifest.template';
import { genCSP, speculosEndpoint } from './constants';
import {
  Servers,
  serverToPermission,
} from '../scripts/connections';
import { CHANGELLY_URL, POOLS_UI_URL_FOR_YOROI } from './manifestEnvs'
import pkg from '../package.json';
import config from 'config';
// `config` is available only in the build script, not in the bundle
const fcmProjectId = config.fcm?.projectId;

export default (isDebug: boolean, shouldInjectConnector: boolean): * => buildManifest({
  description: '[dev] Cardano ADA wallet',
  defaultTitle: '[dev] Yoroi',
  contentSecurityPolicy: genCSP({
    isDev: isDebug,
    additional: {
      'connect-src': [
        serverToPermission(Servers.Primary),
        serverToPermission(Servers.Testnet),
        speculosEndpoint,
        // Firebase cloud messaging
        `https://firebaseinstallations.googleapis.com/v1/projects/${fcmProjectId}/`,
        `https://fcmregistrations.googleapis.com/v1/projects/${fcmProjectId}/`,
      ],
      'frame-src': [
        POOLS_UI_URL_FOR_YOROI,
        CHANGELLY_URL,
      ],
    },
  }),
  version: pkg.version,
  extensionKey: 'pojejnpjgcacmnpkdiklhlnlbkjechfh',
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
  enableProtocolHandlers: true,
  shouldInjectConnector,
});
