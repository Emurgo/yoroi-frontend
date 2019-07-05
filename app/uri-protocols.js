// @flow

import { ROUTES } from './routes-config';
import { Logger, stringifyError } from './utils/logging';
import environment from './environment';


const cardanoURI = {
  PROTOCOL: 'web+cardano',
  URL: 'main_window.html#' + ROUTES.SEND_FROM_URI.ROOT + '?q=%s',
  TITLE: 'Yoroi',
};

const registerProtocols = () => {
  if (!environment.userAgentInfo.isExtension) {
    Logger.error(`uri-protocols:registerProtocols URI Scheme not supported if not an extension`);
  }
  // protocol is automatically registered by manifest in Firefox
  if (environment.userAgentInfo.isChrome) {
    try {
      navigator.registerProtocolHandler(
        cardanoURI.PROTOCOL,
        cardanoURI.URL,
        cardanoURI.TITLE
      );
    } catch (err) {
      Logger.error(`uri-protocols:registerProtocols ${stringifyError(err)}`);
    }
  }
};

export default registerProtocols;
