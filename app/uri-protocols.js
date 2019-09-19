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
  if (!environment.userAgentInfo.canRegisterProtocol()) {
    Logger.error(`uri-protocols:registerProtocols cannot use registerProtocolHandler on this page`);
    return;
  }
  try {
    // Unregistering the protocol before calling register again will make the browser
    // to always show the allow/block dialog.
    // $FlowFixMe
    navigator.unregisterProtocolHandler(
      cardanoURI.PROTOCOL,
      cardanoURI.URL,
    );
  } catch (err) {
    Logger.error(`uri-protocols:unregisterProtocols ${stringifyError(err)}`);
  }
  try {
    navigator.registerProtocolHandler(
      cardanoURI.PROTOCOL,
      cardanoURI.URL,
      cardanoURI.TITLE
    );
  } catch (err) {
    Logger.error(`uri-protocols:registerProtocols ${stringifyError(err)}`);
  }
};

export default registerProtocols;
