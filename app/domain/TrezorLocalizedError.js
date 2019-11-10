// @flow

import LocalizableError, { UnexpectedError } from '../i18n/LocalizableError';
import globalMessages from '../i18n/global-messages';
import { defineMessages } from 'react-intl';

import {
  Logger,
} from '../utils/logging';

const messages = defineMessages({
  signTxError101: {
    id: 'wallet.send.trezor.error.101',
    defaultMessage: '!!!Signing cancelled on Trezor device. Please retry.',
  },
});

/** Converts error(from API or Trezor API) to LocalizableError */
export function convertToLocalizableError(error: Error): LocalizableError {
  let localizableError: ?LocalizableError = null;

  if (error instanceof LocalizableError) {
    // It means some API Error has been thrown
    localizableError = error;
  } else if (error && error.message) {
    // Trezor device related error happend, convert then to LocalizableError
    switch (error.message) {
      case 'Iframe timeout':
        localizableError = new LocalizableError(globalMessages.trezorError101);
        break;
      case 'Permissions not granted':
        localizableError = new LocalizableError(globalMessages.hwError101);
        break;
      case 'Cancelled':
      case 'Popup closed':
        localizableError = new LocalizableError(globalMessages.trezorError103);
        break;
      case 'Signing cancelled':
        localizableError = new LocalizableError(messages.signTxError101);
        break;
      default:
        /** we are not able to figure out why Error is thrown
          * make it, Something unexpected happened */
        Logger.error(`TrezorSendStore::_convertToLocalizableError::error: ${error.message}`);
        localizableError = new UnexpectedError();
        break;
    }
  }

  if (!localizableError) {
    /** we are not able to figure out why Error is thrown
      * make it, Something unexpected happened */
    localizableError = new UnexpectedError();
  }

  return localizableError;
}
