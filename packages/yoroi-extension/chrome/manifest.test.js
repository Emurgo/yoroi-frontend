// @flow
/* eslint-disable  import/no-unused-modules */

import buildManifest from './manifest.template';
import { Servers, serverToPermission } from '../scripts/connections';
import { genCSP, speculosEndpoint } from './constants';
import pkg from '../package.json';
import config from 'config';
// `config` is available only in the build script, not in the bundle
const fcmProjectId = config.fcm?.projectId;

export default (isDebug: boolean, shouldInjectConnector: boolean): * => buildManifest({
  description: 'e2e test Cardano ADA wallet',
  defaultTitle: 'e2e test Yoroi',
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
    },
  }),
  version: pkg.version,
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
  enableProtocolHandlers: false,
  shouldInjectConnector,
});
