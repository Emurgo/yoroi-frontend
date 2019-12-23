// @flow

import {
  Ports,
  portToPermission,
  portToSocketPermission,
} from '../scripts/connections';
import { SEIZA_URL, SEIZA_FOR_YOROI_URL } from './manifestEnvs';

export const Version = {
  Shelley: '2.2.2',
  Byron: '1.10.0',
};

export function genCSP(request: {|
  isDev: boolean,
  additional: {|
    'default-src'?: Array<string>,
    'frame-src'?: Array<string>,
    'script-src'?: Array<string>,
    'object-src'?: Array<string>,
    'connect-src'?: Array<string>,
    'style-src'?: Array<string>,
    'img-src'?: Array<string>,
  |},
|}): string {
  const defaultSrc = request.additional['default-src'] ?? [];
  const frameSrc = request.additional['frame-src'] ?? [];
  const scriptSrc = request.additional['script-src'] ?? [];
  const objectSrc = request.additional['object-src'] ?? [];
  const connectSrc = request.additional['connect-src'] ?? [];
  const styleSrc = request.additional['style-src'] ?? [];
  const imgSrc = request.additional['img-src'] ?? [];

  if (request.isDev) {
    defaultSrc.push(portToPermission(Ports.WebpackDev));
    defaultSrc.push(portToPermission(Ports.ReactDevTools));

    scriptSrc.push(portToPermission(Ports.WebpackDev));
    scriptSrc.push(portToPermission(Ports.ReactDevTools));

    connectSrc.push(portToPermission(Ports.WebpackDev));
    connectSrc.push(portToPermission(Ports.DevBackendServe));
    connectSrc.push(portToPermission(Ports.ReactDevTools));
    connectSrc.push(portToSocketPermission(Ports.WebpackDev));

    imgSrc.push(portToPermission(Ports.WebpackDev));
  }

  frameSrc.push(SEIZA_FOR_YOROI_URL);
  frameSrc.push(SEIZA_URL);
  frameSrc.push('https://connect.trezor.io/');
  frameSrc.push('https://emurgo.github.io/yoroi-extension-ledger-bridge');
  return [
    `default-src 'self' ${defaultSrc.join(' ')};`,
    `frame-src ${frameSrc.join(' ')};`,
    `script-src 'self' 'unsafe-eval' ${scriptSrc.join(' ')} blob:;`,
    `object-src 'self' ${objectSrc.join(' ')};`,
    `connect-src ${connectSrc.join(' ')};`,
    `style-src * 'unsafe-inline' 'self' ${styleSrc.join(' ')} blob:;`,
    `img-src 'self' ${imgSrc.join(' ')} data:;`,
  ].join(' ');
}
