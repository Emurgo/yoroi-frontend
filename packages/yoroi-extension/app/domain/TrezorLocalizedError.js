// @flow

import LocalizableError, { UnexpectedError } from '../i18n/LocalizableError';
import globalMessages from '../i18n/global-messages';
import { defineMessages } from 'react-intl';

import { Logger } from '../utils/logging';

const messages = defineMessages({
  signTxError101: {
    id: 'wallet.send.trezor.error.101',
    defaultMessage: '!!!Signing cancelled on Trezor device. Please retry.',
  },
  firmwareCatalystSupportError: {
    id: 'wallet.send.tezor.error.firmwareCatalystSupport',
    defaultMessage: '!!!Registering for Catalyst voting requires Trezor firmware 2.4.1',
  },
  noWitnessError: {
    id: 'wallet.send.trezor.error.noWitness',
    defaultMessage:
      '!!!Could not sign the transaction. Please ensure the passphrase you entered is the passhprase used to create this wallet.',
  },
});

/** Converts error(from API or Trezor API) to LocalizableError */
export function convertToLocalizableError(error: Error): LocalizableError {
  let localizableError: ?LocalizableError = null;

  if (error instanceof LocalizableError) {
    // It means some API Error has been thrown
    localizableError = error;
  } else if (error && error.message) {
    if (error.message.includes('no witness for')) {
      // from `buildSignedTransaction()`, the only realistic cause being passphrase mismatch
      localizableError = new LocalizableError(messages.noWitnessError);
    } else if (/Cancelled/.test(error.message)) {
      localizableError = new LocalizableError(messages.signTxError101);
    } else {
      // Trezor device related error happend, convert then to LocalizableError
      switch (error.message) {
        case 'Iframe timeout':
          localizableError = new LocalizableError(globalMessages.trezorError101);
          break;
        case 'Trezor signing error: Permissions not granted':
          localizableError = new LocalizableError(globalMessages.hwError101);
          break;
        case 'Trezor signing error: Popup closed (code=Method_Interrupted)':
          localizableError = new LocalizableError(globalMessages.trezorError103);
          break;
        case "Trezor signing error: Failed to execute 'transferIn' on 'USBDevice': A transfer error has occurred. (code=19)":
          localizableError = new LocalizableError(messages.signTxError101);
          break;
        case 'Feature AuxiliaryData not supported by device firmware':
          localizableError = new LocalizableError(messages.firmwareCatalystSupportError);
          break;
        default:
          /** we are not able to figure out why Error is thrown
           * make it, Something unexpected happened */
          Logger.error(`TrezorLocalizedError::${nameof(convertToLocalizableError)}::error: ${error.message}`);
          localizableError = new UnexpectedError();
          break;
      }
    }
  }

  if (!localizableError) {
    /** we are not able to figure out why Error is thrown
     * make it, Something unexpected happened */
    localizableError = new UnexpectedError();
  }

  return localizableError;
}
