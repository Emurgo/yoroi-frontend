import buildManifest from './manifest.template';

const SEIZA_URL = process.env.SEIZA_URL || 'http://localhost:3001';

export default buildManifest({
  description: '[testnet] Cardano ADA wallet',
  defaultTitle: '[testnet] Yoroi',
  contentSecurityPolicy: `default-src 'self'; frame-src ${SEIZA_URL} https://connect.trezor.io/ https://emurgo.github.io/yoroi-extension-ledger-bridge; script-src 'self' 'unsafe-eval'; connect-src wss://testnet-yoroi-backend.yoroiwallet.com:443 https://testnet-yoroi-backend.yoroiwallet.com; style-src * 'unsafe-inline' 'self' blob:; img-src 'self' data:;`,
  versionName: 'tn-1.9.0',
});
