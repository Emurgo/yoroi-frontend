// @flow
import RouteParser from 'route-parser';

export const matchRoute = (pattern: string, path: string) => new RouteParser(pattern).match(path);

/**
 * Build a route from a pattern like `/wallets/:id` to `/wallets/123`
 * by calling it with the pattern + params:
 *
 * buildRoute('/wallets/:id', { id: 123 });
 *
 * Code taken from:
 * https://github.com/adamziel/react-router-named-routes/blob/master/lib/index.js
 *
 * @param pattern
 * @param params
 */
type ParamsT = ?{ [key: string]: Array<number|string>|number|string };
export const buildRoute = (pattern: string, params: ParamsT) => {
  function toArray(val) {
    return Array.isArray(val) ? val : [val];
  }
  const reRepeatingSlashes = /\/+/g; // '/some//path'
  const reSplatParams = /\*{1,2}/g;  // '/some/*/complex/**/path'
  const reResolvedOptionalParams = /\(([^:*?#]+?)\)/g; // '/path/with/(resolved/params)'
  // '/path/with/(groups/containing/:unresolved/optional/:params)'
  const reUnresolvedOptionalParams = /\([^:?#]*:[^?#]*?\)/g;
  const reTokens = /<(.*?)>/g;
  const reSlashTokens = /_!slash!_/g;

  let routePath = pattern;
  const tokens = {};

  if (params) {
    // assert not null
    const paramsArgs = params;
    Object.keys(params).forEach((paramName) => {
      const paramValue = paramsArgs[paramName];

      // special param name in RR, used for '*' and '**' placeholders
      if (paramName === 'splat') {
        // when there are multiple globs, RR defines 'splat' param as array.
        const paramValueArray = toArray(paramValue);
        let i = 0;
        routePath = routePath.replace(reSplatParams, (match) => {
          const val = paramValueArray[i++];
          if (val === undefined) {
            return '';
          }
          const tokenName = `splat${i}`;
          if (match === '*') {
            tokens[tokenName] = encodeURIComponent(String(val));
          } else {
            // don't escape slashes for double star, as '**' considered greedy by RR spec
            tokens[tokenName] = encodeURIComponent(
              val.toString().replace(/\//g, '_!slash!_')
            ).replace(reSlashTokens, '/');
          }
          return `<${tokenName}>`;
        });
      } else {
        // Rougly resolve all named placeholders.
        // Cases:
        // - '/path/:param'
        // - '/path/(:param)'
        // - '/path(/:param)'
        // - '/path(/:param/):another_param'
        // - '/path/:param(/:another_param)'
        // - '/path(/:param/:another_param)'
        const paramRegex = new RegExp('(/|\\(|\\)|^):' + paramName + '(/|\\)|\\(|$)');
        routePath = routePath.replace(paramRegex, (match, g1, g2) => {
          // $FlowFixMe
          tokens[paramName] = encodeURIComponent(paramValue);
          return `${g1}<${paramName}>${g2}`;
        });
      }
    });
  }

  return routePath
  // Remove braces around resolved optional params (i.e. '/path/(value)')
    .replace(reResolvedOptionalParams, '$1')
    // Remove all sequences containing at least one unresolved optional param
    .replace(reUnresolvedOptionalParams, '')
    // After everything related to RR syntax is removed, insert actual values
    .replace(reTokens, (match, token) => tokens[token])
    // Remove repeating slashes
    .replace(reRepeatingSlashes, '/')
    // Always remove ending slash for consistency
    .replace(/\/+$/, '')
    // If there was a single slash only, keep it
    .replace(/^$/, '/');
};

/**
 * Get a named url query parameter from given or current url.
 *
 * Taken from here:
 * https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 *
 * @param name
 * @param url
 * @returns {string}
 */
export const getUrlParameterByName = (name: string, url?: string) => {
  if (url == null || url === '') url = window.location.href;
  name = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/** pre-req: either the target is an anchor or is the child of an anchor */
export const handleExternalLinkClick = (event: MouseEvent) => {
  event.preventDefault();
  let target = event.target;
  while (!(target instanceof HTMLAnchorElement)) {
    if (!(target instanceof Element)) {
      return;
    }
    target = target.parentNode;
  }
  if (target instanceof HTMLAnchorElement) {
    window.open(target.href, '_blank');
  }
};
