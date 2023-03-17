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
  ledgerSignDataUnsupportedError: {
    id: 'wallet.hw.ledger.data.sign.unsupported.error',
    defaultMessage: '!!!The Ledger Cardano app does not support data signing at this memoment',
  },
});

export const transactionHashMismatchError: LocalizableError = new LocalizableError(
  errors.transactionHashMismatchError
);

export const unsupportedTransactionError: LocalizableError = new LocalizableError(
  errors.unsupportedTransactionError
);

export const ledgerSignDataUnsupportedError: LocalizableError = new LocalizableError(
  errors.ledgerSignDataUnsupportedError
);
