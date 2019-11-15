// @flow

import buildManifest from './manifest.template';
import { SEIZA_URL, SEIZA_FOR_YOROI_URL } from './manifestEnvs';

export default buildManifest({
  description: '[shelley-dev] Cardano ADA wallet',
  defaultTitle: '[shelley-devdev] Yoroi',
  // TODO: change backend URLs
  contentSecurityPolicy: `default-src 'self' http://localhost:3000 https://localhost:3000 http://localhost:8097; frame-src ${SEIZA_FOR_YOROI_URL} ${SEIZA_URL} https://connect.trezor.io/ https://emurgo.github.io/yoroi-extension-ledger-bridge; script-src 'self' 'unsafe-eval' http://localhost:3000 https://localhost:3000 http://localhost:8097 blob:; object-src 'self'; connect-src https://iohk-mainnet.yoroiwallet.com wss://iohk-mainnet.yoroiwallet.com:443 http://localhost:3000 https://localhost:3000 http://localhost:8080 https://localhost:8080 http://localhost:8097 ws://localhost:8080 ws://localhost:8097 wss://localhost:8080 wss://testnet-yoroi-backend.yoroiwallet.com:443 https://testnet-yoroi-backend.yoroiwallet.com; style-src * 'unsafe-inline' 'self' blob:; img-src 'self' http://localhost:3000 data:;`,
  extensionKey: 'pojejnpjgcacmnpkdiklhlnlbkjechfh',
  iconOverride: {
    /* eslint-disable quote-props */
    '16': 'img/shelley-16.png',
    '48': 'img/shelley-48.png',
    '128': 'img/shelley-128.png',
    /* eslint-enable quote-props */
  },
  versionOverride: '2.0.0',
  geckoKey: '{842ae5af-a7ff-4e99-afb6-bd6c4043bcfa}',
});
