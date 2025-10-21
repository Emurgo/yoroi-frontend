// @flow
/* eslint-disable  import/no-unused-modules */
const { injectedScripts } = require('./constants');

export default ({
  description,
  defaultTitle,
  titleOverride,
  contentSecurityPolicy, // extension_pages CSP from genCSP()
  versionName,
  extensionKey,
  geckoKey,
  iconOverride,
  version,
  enableProtocolHandlers,
  shouldInjectConnector,
  isFirefox,
}) => {
  const icons = iconOverride == null
    ? { '16': 'img/icon-16.png', '48': 'img/icon-48.png', '128': 'img/icon-128.png' }
    : iconOverride;

  let background = { service_worker: 'js/background-service-worker.js' };
  if (isFirefox) background = { scripts: ['js/background-service-worker.js'] };

  const base = {
    version,
    name: titleOverride === true ? defaultTitle : 'Yoroi',
    manifest_version: 3,
    description,
    action: { default_title: defaultTitle, default_icon: icons },
    browser_specific_settings: { gecko: { id: geckoKey } },
    icons,
    background,
    permissions: ['storage', 'tabs', 'alarms', 'system.display'],
    host_permissions: ['*://connect.trezor.io/*'],

    content_scripts: [
      {
        matches: ['*://connect.trezor.io/*/popup.html*'],
        js: ['js/trezor-content-script.js'],
      },
      {
        matches: ['file://*/*', 'http://*/*', 'https://*/*'],
        js: ['js/bringInject.js'],
        run_at: 'document_start',
        all_frames: true,
      },
    ],

    // ✅ MV3 CSP locations
    content_security_policy: {
      extension_pages: contentSecurityPolicy,
      // ✅ minimal, Chrome-acceptable sandbox CSP (no inline)
      sandbox: "script-src 'self' https://client.crisp.chat; connect-src https://client.crisp.chat wss://client.relay.crisp.chat; img-src https: data:; style-src 'self' https://client.crisp.chat"
    },

    // ✅ Only list sandboxed pages here (define once)
    ...(isFirefox ? {} : {
      sandbox: { pages: ['3rd-party-crisp/crisp.html'] },
    }),

    protocol_handlers: !enableProtocolHandlers ? [] : [
      { protocol: 'web+cardano', name: 'Yoroi', uriTemplate: 'main_window.html#/send-from-uri?q=%s' },
    ],

    web_accessible_resources: [],
  };

  if (!isFirefox) {
    base.web_accessible_resources.push({
      resources: ['3rd-party-crisp/crisp.html'],
      matches: ['<all_urls>'],
    });
  }

  if (shouldInjectConnector) {
    base.content_scripts.push({
      matches: ['file://*/*', 'http://*/*', 'https://*/*'],
      js: ['js/inject.js'],
      run_at: 'document_start',
      all_frames: true,
    });
    base.web_accessible_resources.push({
      resources: injectedScripts.map(script => `js/${script}`),
      matches: ['<all_urls>'],
    });
  }

  if (versionName != null) base.version_name = versionName;
  if (extensionKey != null) base.key = extensionKey;

  return base;
};
