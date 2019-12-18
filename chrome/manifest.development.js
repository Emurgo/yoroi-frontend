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
  description: '[dev] Cardano ADA wallet',
  defaultTitle: '[dev] Yoroi',
  contentSecurityPolicy: [
    `default-src 'self' ${portToPermission(Ports.WebpackDev)} ${portToPermission(Ports.ReactDevTools)};`,
    `frame-src ${SEIZA_FOR_YOROI_URL} ${SEIZA_URL} https://connect.trezor.io/ https://emurgo.github.io/yoroi-extension-ledger-bridge;`,
    `script-src 'self' 'unsafe-eval' ${portToPermission(Ports.WebpackDev)} ${portToPermission(Ports.ReactDevTools)} blob:;`,
    `object-src 'self';`,
    `connect-src ${portToPermission(Ports.WebpackDev)} ${portToPermission(Ports.DevBackendServe)} ${portToSocketPermission(Ports.WebpackDev)} ${portToPermission(Ports.ReactDevTools)} ${serverToPermission(Servers.ByronTestnet)};`,
    `style-src * 'unsafe-inline' 'self' blob:;`,
    `img-src 'self' ${portToPermission(Ports.WebpackDev)} data:;`
  ].join(' '),
  extensionKey: 'pojejnpjgcacmnpkdiklhlnlbkjechfh',
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
});
