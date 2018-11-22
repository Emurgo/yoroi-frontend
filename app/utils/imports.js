// @flow
import environment from '../environment';

/** Loads a file relative to the app directory.
 * If a currency-specific version of the file exists, we take that one.
 * Otherwise, we resolve the path as-is from the app folders
 *
 * @example (if currency-specific) resolver('containers/Foo') -> app/containers/ada/Foo
 * @example (if currency agnostic) resolver('containers/Foo') -> app/containers/Foo */
const resolver = (path: string) => {
  const envPathSubdir = environment.API;
  const envPathSegments = path.split('/');
  envPathSegments.splice(-1, 0, envPathSubdir);
  const envPath = envPathSegments.join('/');
  let file;
  try {
    file = require(`../${envPath}.js`); // eslint-disable-line
  } catch (e) {
    file = require(`../${path}.js`); // eslint-disable-line
  }
  return (
    file.default // handle both ES6 modules also
    || file
  );
};

export default resolver;
