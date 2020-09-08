// @flow

import buildManifest from './manifest.template';
import {
  genCSP,
} from './constants';
import { version } from '../package.json';

export default (isDebug: boolean): * => buildManifest({
  description: '[testnet] Cardano ADA wallet',
  defaultTitle: '[testnet] Yoroi',
  contentSecurityPolicy: genCSP({
    isDev: isDebug,
    additional: Object.freeze({
    }),
  }),
  version,
  versionName: 'tn-1.10.0',
  geckoKey: '{530f7c6c-6077-4703-8f71-cb368c663e35}',
  enableProtocolHandlers: false,
});
