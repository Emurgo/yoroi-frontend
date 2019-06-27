// @flow

import LocalizableError, { UnexpectedError } from '../i18n/LocalizableError';
import globalMessages from '../i18n/global-messages';
import { defineMessages } from 'react-intl';

import {
  Logger,
} from '../utils/logging';

const messages = defineMessages({
  signTxError101: {
    id: 'wallet.send.ledger.error.101',
    defaultMessage: '!!!Signing cancelled on Ledger device. Please retry or reconnect device.',
  },
});

export function convertToLocalizableError(error: Error): LocalizableError {
  let localizableError: ?LocalizableError = null;

  if (error instanceof LocalizableError) {
    // It means some API Error has been thrown
    localizableError = error;
  } else if (error && error.message) {
    // Ledger device related error happend, convert then to LocalizableError
    switch (error.message) {
      case 'TransportError: Failed to sign with Ledger device: U2F TIMEOUT':
        localizableError = new LocalizableError(globalMessages.ledgerError101);
        break;
      case 'TransportStatusError: Ledger device: Action rejected by user':
        localizableError = new LocalizableError(messages.signTxError101);
        break;
      default:
        /** we are not able to figure out why Error is thrown
          * make it, Something unexpected happened */
        Logger.error(`LedgerSendStore::_convertToLocalizableError::error: ${error.message}`);
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
