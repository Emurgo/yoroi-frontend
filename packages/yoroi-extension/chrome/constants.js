// @flow
/* eslint-disable  import/no-unused-modules */

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
  frameSrc.push('https://emurgo.github.io/');
  frameSrc.push('https://www.youtube.com/');

  // Analytics
  connectSrc.push('https://analytics.emurgo-rnd.com/');
  connectSrc.push('https://api2.amplitude.com');
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
  connectSrc.push('ws://0.0.0.0:8080/');

  // unsafe-inline is unfortunately required by style-loader (even in production builds)
  const evalStyle = "'unsafe-inline'";
  return [
    `default-src 'self' ${defaultSrc.join(' ')};`,
    `frame-src ${frameSrc.join(' ')};`,
    `script-src 'self' 'wasm-unsafe-eval';`,
    `object-src 'self' ${objectSrc.join(' ')};`,
    `connect-src ${connectSrc.join(' ')};`,
    `style-src * ${evalStyle} 'self' ${styleSrc.join(' ')} blob:;`,
    `img-src 'self' ${imgSrc.join(' ')} https: data: ;`,
  ].join(' ');
}

export const injectedScripts = ['cardanoApiInject.js', 'initialInject.js'];
