// @flow

import buildManifest from './manifest.template';
import { SEIZA_URL, SEIZA_FOR_YOROI_URL } from './manifestEnvs';

export default buildManifest({
  description: '[staging] Cardano ADA wallet',
  defaultTitle: '[staging] Yoroi',
  contentSecurityPolicy: `default-src 'self'; frame-src ${SEIZA_FOR_YOROI_URL} ${SEIZA_URL} https://connect.trezor.io/ https://emurgo.github.io/yoroi-extension-ledger-bridge; script-src 'self' 'unsafe-eval' blob:; connect-src wss://stg-yoroi-backend.yoroiwallet.com:443 https://stg-yoroi-backend.yoroiwallet.com; style-src * 'unsafe-inline' 'self' blob:; img-src 'self' data:;`,
  version_name: 'st-1.10.0',
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
});
