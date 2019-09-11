const SEIZA_URL = process.env.SEIZA_URL || 'http://localhost:3001';
export default {
  version: '1.9.0',
  name: 'yoroi',
  manifest_version: 2,
  description: '[dev] Cardano ADA wallet',
  browser_action: {
    default_title: '[dev] Yoroi',
    default_icon: {
      16: 'img/icon-16.png',
      48: 'img/icon-48.png',
      128: 'img/icon-128.png',
    },
  },
  browser_specific_settings: {
    gecko: {
      id: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
    },
  },
  icons: {
    16: 'img/icon-16.png',
    48: 'img/icon-48.png',
    128: 'img/icon-128.png',
  },
  background: {
    page: 'background.html',
  },
  permissions: ['storage', '*://connect.trezor.io/*'],
  content_scripts: [
    {
      matches: ['*://connect.trezor.io/*/popup.html'],
      js: ['js/trezor-content-script.js'],
    },
  ],
  content_security_policy: `default-src 'self' http://localhost:3000 https://localhost:3000 http://localhost:8097; frame-src ${SEIZA_URL} https://connect.trezor.io/ https://emurgo.github.io/yoroi-extension-ledger-bridge; script-src 'self' 'unsafe-eval' http://localhost:3000 https://localhost:3000 http://localhost:8097 blob:; object-src 'self'; connect-src https://iohk-mainnet.yoroiwallet.com wss://iohk-mainnet.yoroiwallet.com:443 http://localhost:3000 https://localhost:3000 http://localhost:8080 https://localhost:8080 http://localhost:8097 ws://localhost:8080 ws://localhost:8097 wss://localhost:8080 wss://testnet-yoroi-backend.yoroiwallet.com:443 https://testnet-yoroi-backend.yoroiwallet.com; style-src * 'unsafe-inline' 'self' blob:; img-src 'self' http://localhost:3000 data:;`,
  key: 'pojejnpjgcacmnpkdiklhlnlbkjechfh',
  protocol_handlers: [
    {
      protocol: 'web+cardano',
      name: 'Yoroi',
      uriTemplate: 'main_window.html#/send-from-uri?q=%s',
    },
  ],
};
