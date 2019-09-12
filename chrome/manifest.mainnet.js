import buildManifest from './manifest.template';

const SEIZA_URL = process.env.SEIZA_URL || 'http://localhost:3001';

export default buildManifest({
  description: 'A simple, secure and fast Cardano ADA wallet.',
  defaultTitle: 'Yoroi',
  contentSecurityPolicy: `default-src 'self'; frame-src ${SEIZA_URL} https://connect.trezor.io/ https://emurgo.github.io/yoroi-extension-ledger-bridge; script-src 'self' 'unsafe-eval' blob:; connect-src https://iohk-mainnet.yoroiwallet.com wss://iohk-mainnet.yoroiwallet.com:443; style-src * 'unsafe-inline' 'self' blob:; img-src 'self' data:;`,
});
