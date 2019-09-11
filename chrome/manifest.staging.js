const SEIZA_URL = process.env.SEIZA_URL || 'http://localhost:3001';
export default require('./manifest.template')({
  description: '[staging] Cardano ADA wallet',
  defaultTitle: '[staging] Yoroi',
  contentSecurityPolicy: `default-src 'self'; frame-src ${SEIZA_URL} https://connect.trezor.io/ https://emurgo.github.io/yoroi-extension-ledger-bridge; script-src 'self' 'unsafe-eval' blob:; connect-src wss://stg-yoroi-backend.yoroiwallet.com:443 https://stg-yoroi-backend.yoroiwallet.com; style-src * 'unsafe-inline' 'self' blob:; img-src 'self' data:;`,
  version_name: 'st-1.9.0',
});
