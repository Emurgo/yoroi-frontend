export default ({ description, defaultTitle, contentSecurityPolicy, versionName }) => ({
  version: '1.9.0',
  name: 'yoroi',
  manifest_version: 2,
  ...(versionName ? { version_name: versionName } : {}),
  description,
  browser_action: {
    default_title: defaultTitle,
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
  content_security_policy: contentSecurityPolicy,
  key: 'pojejnpjgcacmnpkdiklhlnlbkjechfh',
  protocol_handlers: [
    {
      protocol: 'web+cardano',
      name: 'Yoroi',
      uriTemplate: 'main_window.html#/send-from-uri?q=%s',
    },
  ],
});
