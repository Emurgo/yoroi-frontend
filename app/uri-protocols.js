// @flow

import { ROUTES } from './routes-config';
import { Logger, stringifyError } from './utils/logging';


const cardanoURI = {
  PROTOCOL: 'web+cardano',
  URL: 'main_window.html#' + ROUTES.SEND_FROM_URI.ROOT + '?q=%s',
  TITLE: 'Yoroi',
};

const registerProtocols = () => {

  // $FlowFixMe InstallTrigger is a global from the browser
  const isFirefox = typeof InstallTrigger !== 'undefined';
  const isChrome = !!window.chrome &&
    (!!window.chrome.webstore || !!window.chrome.runtime) &&
    !isFirefox;
  if (isChrome) {
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
