// @flow

import {
  Ports,
  portToPermission,
  portToSocketPermission,
} from '../scripts/connections';

export function genCSP(request: {|
  isDev: boolean,
  additional: {|
    'default-src'?: Array<string>,
    'frame-src'?: Array<string>,
    'object-src'?: Array<string>,
    'connect-src'?: Array<string>,
    'style-src'?: Array<string>,
    'img-src'?: Array<string>,
  |},
|}): string {
  const defaultSrc = request.additional['default-src'] ?? [];
  const frameSrc = request.additional['frame-src'] ?? [];
  const objectSrc = request.additional['object-src'] ?? [];
  const connectSrc = request.additional['connect-src'] ?? [];
  const styleSrc = request.additional['style-src'] ?? [];
  const imgSrc = request.additional['img-src'] ?? [];

  imgSrc.push('https://static.adapools.org/');
  imgSrc.push('https://ipfs.io/ipfs/');
  // connectSrc.push('https://api.dropboxapi.com');
  // connectSrc.push('https://content.dropboxapi.com');

  frameSrc.push('https://connect.trezor.io/');
  frameSrc.push('https://emurgo.github.io/yoroi-extension-ledger-bridge');

  // Zendesk setup
  connectSrc.push('https://*.zdassets.com/')
  connectSrc.push('https://emurgohelpdesk.zendesk.com/')

  // Analytics
  connectSrc.push('https://analytics.emurgo-rnd.com/');

  // unsafe-inline is unfortunately required by style-loader (even in production builds)
  const evalStyle = "'unsafe-inline'";
  return [
    `default-src 'self' ${defaultSrc.join(' ')};`,
    `frame-src ${frameSrc.join(' ')};`,
    `script-src 'self' 'wasm-unsafe-eval';`,
    `object-src 'self' ${objectSrc.join(' ')};`,
    `connect-src ${connectSrc.join(' ')};`,
    `style-src * ${evalStyle} 'self' ${styleSrc.join(' ')} blob:;`,
    `img-src 'self' ${imgSrc.join(' ')} data: ;`,
  ].join(' ');
}

export const injectedScripts = [
  'cardanoApiInject.js',
  'ergoApiInject.js',
  'initialInject.js',
];
