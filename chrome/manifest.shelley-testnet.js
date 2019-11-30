// @flow

import buildManifest from './manifest.template';
import { SEIZA_URL, SEIZA_FOR_YOROI_URL } from './manifestEnvs';

export default buildManifest({
  // TODO: change
  description: 'A simple, secure and fast Cardano ADA wallet.',
  defaultTitle: 'Yoroi Shelley Testnet',
  titleOverride: true,
  // TODO: change backend URLs
  contentSecurityPolicy: `default-src 'self'; frame-src ${SEIZA_FOR_YOROI_URL} ${SEIZA_URL} https://connect.trezor.io/ https://emurgo.github.io/yoroi-extension-ledger-bridge; script-src 'self' 'unsafe-eval' blob:; connect-src https://shelley-testnet-yoroi-backend.yoroiwallet.com wss://shelley-testnet-yoroi-backend.yoroiwallet.com:443; style-src * 'unsafe-inline' 'self' blob:; img-src 'self' data:;`,
  iconOverride: {
    /* eslint-disable quote-props */
    '16': 'img/shelley-16.png',
    '48': 'img/shelley-48.png',
    '128': 'img/shelley-128.png',
    /* eslint-enable quote-props */
  },
  versionOverride: '2.0.2',
  geckoKey: '{842ae5af-a7ff-4e99-afb6-bd6c4043bcfa}',
});
