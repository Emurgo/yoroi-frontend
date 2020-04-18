// @flow

import {
  Ports,
  portToPermission,
  portToSocketPermission,
} from '../scripts/connections';
import { SEIZA_URL, SEIZA_FOR_YOROI_URL } from './manifestEnvs';

export const Version = {
  Shelley: '2.7.3',
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

  connectSrc.push('https://api.dropboxapi.com');
  connectSrc.push('https://content.dropboxapi.com');

  frameSrc.push(SEIZA_FOR_YOROI_URL);
  frameSrc.push(SEIZA_URL);
  frameSrc.push('https://connect.trezor.io/');
  frameSrc.push('https://emurgo.github.io/yoroi-extension-ledger-bridge');

  // unsafe-eval is unfortunately needed to compile WebAssembly in the browser
  // it may be removed if wasm-eval is ever standardized https://github.com/w3c/webappsec-csp/pull/293
  const evalSrc = "'unsafe-eval'";

  // unsafe-inline is unfortunately required by style-loader (even in production builds)
  const evalStyle = "'unsafe-inline'";
  return [
    `default-src 'self' ${defaultSrc.join(' ')};`,
    `frame-src ${frameSrc.join(' ')};`,
    `script-src 'self' ${evalSrc} ${scriptSrc.join(' ')} blob:;`,
    `object-src 'self' ${objectSrc.join(' ')};`,
    `connect-src ${connectSrc.join(' ')};`,
    `style-src * ${evalStyle} 'self' ${styleSrc.join(' ')} blob:;`,
    `img-src 'self' ${imgSrc.join(' ')} data:;`,
  ].join(' ');
}
