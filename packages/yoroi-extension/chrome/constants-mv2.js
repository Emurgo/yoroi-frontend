// @flow
/* eslint-disable  import/no-unused-modules */

import {
  Ports,
  portToPermission,
} from '../scripts-mv2/connections';

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

    imgSrc.push(portToPermission(Ports.WebpackDev));
  }

  imgSrc.push('https://static.adapools.org/');
  imgSrc.push('https://ipfs.io/ipfs/');
  // connectSrc.push('https://api.dropboxapi.com');
  // connectSrc.push('https://content.dropboxapi.com');

  frameSrc.push('https://connect.trezor.io/');
  frameSrc.push('https://emurgo.github.io/yoroi-extension-ledger-bridge');
  frameSrc.push('https://emurgo.github.io/');

  // Analytics
  connectSrc.push('https://analytics.emurgo-rnd.com/');
  connectSrc.push('https://api2.amplitude.com/');
  connectSrc.push('https://api.muesliswap.com');

  // Resolver
  connectSrc.push('https://api.handle.me/');
  connectSrc.push('https://api.unstoppabledomains.com/');

  // Pool info
  connectSrc.push('https://a.cexplorer.io/');
  imgSrc.push('https://img.cexplorer.io/');
  imgSrc.push('https://corsproxy.io/');

  // Swap
  connectSrc.push('https://aggregator.muesliswap.com/');
  connectSrc.push('https://onchain2.muesliswap.com/');

  // wasm-eval is needed to compile WebAssembly in the browser
  // note: wasm-eval is not standardized but empirically works in Firefox & Chrome https://github.com/w3c/webappsec-csp/pull/293
  const evalSrc = "'wasm-eval'";

  if (request.isDev) {
    scriptSrc.push("'unsafe-eval'");
  }

  // unsafe-inline is unfortunately required by style-loader (even in production builds)
  const evalStyle = "'unsafe-inline'";
  return [
    `default-src 'self' ${defaultSrc.join(' ')};`,
    `frame-src ${frameSrc.join(' ')};`,
    `script-src 'self' ${evalSrc} ${scriptSrc.join(' ')} blob:;`,
    `object-src 'self' ${objectSrc.join(' ')};`,
    `connect-src ${connectSrc.join(' ')};`,
    `style-src * ${evalStyle} 'self' ${styleSrc.join(' ')} blob:;`,
    `img-src 'self' ${imgSrc.join(' ')} data: ;`,
  ].join(' ');
}
