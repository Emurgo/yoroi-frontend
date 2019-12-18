// @flow

import buildManifest from './manifest.template';
import {
  Servers,
  serverToPermission,
} from '../scripts/connections';
import { SEIZA_URL, SEIZA_FOR_YOROI_URL } from './manifestEnvs';
import { Version } from './constants';

export default buildManifest({
  description: '[testnet] Cardano ADA wallet',
  defaultTitle: '[testnet] Yoroi',
  contentSecurityPolicy: [
    `default-src 'self';`,
    `frame-src ${SEIZA_FOR_YOROI_URL} ${SEIZA_URL} https://connect.trezor.io/ https://emurgo.github.io/yoroi-extension-ledger-bridge;`,
    `script-src 'self' 'unsafe-eval';`,
    `connect-src ${serverToPermission(Servers.ShelleyITN)};`,
    `style-src * 'unsafe-inline' 'self' blob:;`,
    `img-src 'self' data:;`,
  ].join(' '),
  version: Version.Byron,
  versionName: 'tn-1.10.0',
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
});
