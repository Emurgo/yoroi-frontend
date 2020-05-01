// @flow

/* global __webpack_public_path__ __HOST__ __PORT__ */
/* eslint no-global-assign: 0 camelcase: 0 */
/* eslint no-unused-vars: 0 */

/*::
declare var chrome;
declare var __webpack_public_path__: string;
declare var __HOST__: string;
declare var __PORT__: number;
*/

if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'shelley-dev') {
  __webpack_public_path__ = chrome.extension.getURL('/js/');
} else {
  // In development mode,
  // the iframe of injectpage cannot get correct path,
  // it need to get parent page protocol.
  const path = `//${__HOST__}:${__PORT__}/js/`;
  if (location.protocol === 'https:' || location.search.indexOf('protocol=https') !== -1) {
    __webpack_public_path__ = `https:${path}`;
  } else {
    __webpack_public_path__ = `http:${path}`;
  }
}
