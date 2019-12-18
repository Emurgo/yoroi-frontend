// @flow

import buildManifest from './manifest.template';
import {
  Ports,
  portToPermission,
  portToSocketPermission,
} from '../scripts/connections';
import { SEIZA_URL, SEIZA_FOR_YOROI_URL } from './manifestEnvs';

export default buildManifest({
  description: '[localhost] Cardano ADA wallet',
  defaultTitle: '[localhost] Yoroi',
  contentSecurityPolicy: [
    `default-src 'self';`,
    `frame-src ${SEIZA_FOR_YOROI_URL} ${SEIZA_URL} https://connect.trezor.io/ https://emurgo.github.io/yoroi-extension-ledger-bridge;`,
    `script-src 'self' 'unsafe-eval' blob:;`,
    `connect-src ${portToPermission(Ports.DevBackendServe)} ${portToSocketPermission(Ports.DevBackendServe)};`,
    `style-src * 'unsafe-inline' 'self' blob:;`,
    `img-src 'self' data:;`,
  ].join(' '),
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
});
