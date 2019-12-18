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

export default buildManifest({
  description: '[shelley-dev] Cardano ADA wallet',
  defaultTitle: '[shelley-dev] Yoroi',
  titleOverride: true,
  contentSecurityPolicy: [
    `default-src 'self' ${portToPermission(Ports.WebpackDev)} ${portToPermission(Ports.ReactDevTools)};`,
    `frame-src ${SEIZA_FOR_YOROI_URL} ${SEIZA_URL} https://connect.trezor.io/ https://emurgo.github.io/yoroi-extension-ledger-bridge;`,
    `script-src 'self' 'unsafe-eval' ${portToPermission(Ports.WebpackDev)} ${portToPermission(Ports.ReactDevTools)} blob:;`,
    `object-src 'self';`,
    `connect-src ${portToPermission(Ports.WebpackDev)} ${portToPermission(Ports.DevBackendServe)} ${portToSocketPermission(Ports.WebpackDev)} ${portToPermission(Ports.ReactDevTools)} ${serverToPermission(Servers.ShelleyDev)};`,
    `style-src * 'unsafe-inline' 'self' blob:;`,
    `img-src 'self' ${portToPermission(Ports.WebpackDev)} data:;`,
  ].join(' '),
  extensionKey: 'pojejnpjgcacmnpkdiklhlnlbkjechfh',
  iconOverride: {
    /* eslint-disable quote-props */
    '16': 'img/shelley-16.png',
    '48': 'img/shelley-48.png',
    '128': 'img/shelley-128.png',
    /* eslint-enable quote-props */
  },
  versionOverride: '2.0.0',
  geckoKey: '{842ae5af-a7ff-4e99-afb6-bd6c4043bcfa}',
});
