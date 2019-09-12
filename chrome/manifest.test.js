import buildManifest from './manifest.template';

const SEIZA_URL = process.env.SEIZA_URL || 'http://localhost:3001';

export default buildManifest({
  description: '[localhost] Cardano ADA wallet',
  defaultTitle: '[localhost] Yoroi',
  contentSecurityPolicy: `default-src 'self'; frame-src ${SEIZA_URL} https://connect.trezor.io/ https://emurgo.github.io/yoroi-extension-ledger-bridge; script-src 'self' 'unsafe-eval' blob:; connect-src http://localhost:8080 https://localhost:8080 ws://localhost:8080 wss://localhost:8080; style-src * 'unsafe-inline' 'self' blob:; img-src 'self' data:;`,
});

