// @flow
/* eslint-disable  import/no-unused-modules */
const { injectedScripts } = require('./constants');

/*::
type Icons = {|
  '16': string,
  '48': string,
  '128': string,
|};
*/

export default ({
  description,
  defaultTitle,
  titleOverride,
  contentSecurityPolicy,
  versionName,
  extensionKey,
  geckoKey,
  iconOverride,
  version,
  enableProtocolHandlers,
  shouldInjectConnector,
} /*: {|
  description: string,
  defaultTitle: string,
  titleOverride?: boolean,
  contentSecurityPolicy: string,
  versionName?: string,
  extensionKey?: string,
  geckoKey: string,
  iconOverride?: Icons,
  version: string,
  enableProtocolHandlers: boolean,
  shouldInjectConnector: boolean,
|} */
)/* : * */ => { // eslint-disable-line function-paren-newline
  const icons = iconOverride == null
    ? {
      /* eslint-disable quote-props */
      '16': 'img/icon-16.png',
      '48': 'img/icon-48.png',
      '128': 'img/icon-128.png',
      /* eslint-enable quote-props */
    }
    : iconOverride;
  const base = {
    version,
    // the name shown in chrome://extensions
    // we also reuse this to choose the filename on disk
    name: titleOverride === true ? defaultTitle : 'Yoroi',
    manifest_version: 3,
    description,
    action: {
      default_title: defaultTitle,
      default_icon: icons,
    },
    browser_specific_settings: {
      gecko: {
        id: geckoKey,
      },
    },
    icons,
    background: {
      service_worker: 'js/background-service-worker.js',
    },
    permissions: [
      'storage',
      // so that the background service could access `chrome.system.display.width`
      'system.display',
    ],
    host_permissions: [
      '*://connect.trezor.io/*',
    ],
    content_scripts: [
      {
        matches: ['*://connect.trezor.io/*/popup.html'],
        js: ['js/trezor-content-script.js'],
      },
    ],
    content_security_policy: {
      extension_pages: contentSecurityPolicy
    },
    protocol_handlers: !enableProtocolHandlers
      ? []
      : [
        {
          protocol: 'web+cardano',
          name: 'Yoroi',
          uriTemplate: 'main_window.html#/send-from-uri?q=%s',
        },
      ],
    web_accessible_resources: [],
  };

  if (shouldInjectConnector) {
    base.content_scripts.push(
      {
        matches: [
          'file://*/*',
          'http://*/*',
          'https://*/*',
        ],
        js: [
          'js/inject.js',
        ],
        run_at: 'document_start',
        all_frames: true,
      }
    );
    base.web_accessible_resources.push(
      {
        resources: injectedScripts.map(script => `js/${script}`),
        matches: ['<all_urls>'],
      }
    );
  }

  const verName /*: {| version_name?: string |} */ = versionName != null
    ? { version_name: versionName }
    : Object.freeze({});
  const extKey /*: {| key?: string |} */ = extensionKey != null
    ? { key: extensionKey }
    : Object.freeze({});
  return {
    ...verName,
    ...base,
    ...extKey,
  };
};

export function overrideForNightly(manifest: any): any {
  const nightlyTitle = 'Yoroi Nightly';
  const nightlyIcons = {
    /* eslint-disable quote-props */
    '16': 'img/nightly-16.png',
    '48': 'img/nightly-48.png',
    '128': 'img/nightly-128.png',
    /* eslint-enable quote-props */
  };

  manifest.browser_specific_settings.gecko.id = '{6abdeba8-579b-11ea-8e2d-0242ac130003}';

  manifest.name = nightlyTitle;
  manifest.action.default_title = nightlyTitle;

  manifest.icons = nightlyIcons;
  manifest.action.default_icon = nightlyIcons;

  return manifest;
}
