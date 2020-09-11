// @flow

import buildManifest from './manifest.template';
import {
  genCSP,
} from './constants';
import { version } from '../package.json';

export default (isDebug: boolean): * => buildManifest({
  description: '[dev] Cardano ADA wallet',
  defaultTitle: '[dev] Yoroi',
  contentSecurityPolicy: genCSP({
    isDev: isDebug,
    additional: Object.freeze({
    }),
  }),
  version,
  extensionKey: 'pojejnpjgcacmnpkdiklhlnlbkjechfh',
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
  enableProtocolHandlers: true,
});
