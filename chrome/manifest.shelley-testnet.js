// @flow

import buildManifest from './manifest.template';
import {
  Servers,
  serverToPermission,
} from '../scripts/connections';
import { SEIZA_URL, SEIZA_FOR_YOROI_URL } from './manifestEnvs';
import { Version } from './constants';

export default buildManifest({
  description: 'A simple, secure and fast Cardano ADA wallet.',
  defaultTitle: 'Yoroi Shelley Testnet',
  titleOverride: true,
  contentSecurityPolicy: [
    `default-src 'self';`,
    `frame-src ${SEIZA_FOR_YOROI_URL} ${SEIZA_URL} https://connect.trezor.io/ https://emurgo.github.io/yoroi-extension-ledger-bridge;`,
    `script-src 'self' 'unsafe-eval' blob:;`,
    `connect-src ${serverToPermission(Servers.ShelleyITN)};`,
    `style-src * 'unsafe-inline' 'self' blob:;`,
    `img-src 'self' data:;`,
  ].join(' '),
  iconOverride: {
    /* eslint-disable quote-props */
    '16': 'img/shelley-16.png',
    '48': 'img/shelley-48.png',
    '128': 'img/shelley-128.png',
    /* eslint-enable quote-props */
  },
  version: Version.Shelley,
  versionOverride: '2.1.1',
  geckoKey: '{842ae5af-a7ff-4e99-afb6-bd6c4043bcfa}',
});
