// @flow

import LocalizableError from '../i18n/LocalizableError';
import { defineMessages } from 'react-intl';

const errors: * = defineMessages({
  transactionHashMismatchError: {
    id: 'wallet.hw.tx.hash.error',
    defaultMessage: '!!!The transaction hash computed by Yoroi extension and that by the device mismatch.',
  },
  unsupportedTransactionError: {
    id: 'wallet.hw.tx.unsupported.error',
    defaultMessage: '!!!Signing this transaction with hardware wallet is not supported.',
  },
  trezorSignDataUnsupportedError: {
    id: 'wallet.hw.trezor.data.sign.unsupported.error',
    defaultMessage: '!!!Trezor does not support data signing at this memoment',
  },
  unknownAddressError: {
    id: 'wallet.hw.data.sign.unkown.address',
    defaultMessage: '!!!The requested signing address is not found in this wallet',
  },
});

export const transactionHashMismatchError: LocalizableError = new LocalizableError(
  errors.transactionHashMismatchError
);

export const unsupportedTransactionError: LocalizableError = new LocalizableError(
  errors.unsupportedTransactionError
);

export const trezorSignDataUnsupportedError: LocalizableError = new LocalizableError(
  errors.trezorSignDataUnsupportedError
);

export const unknownAddressError: LocalizableError = new LocalizableError(
  errors.unknownAddressError
);
