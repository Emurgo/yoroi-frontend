// @flow

import { defineMessages } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';

const messages = defineMessages({
  serverStatusError: {
    id: 'api.errors.serverStatusError',
    defaultMessage: '!!!Connection to the server failed. Please check your internet connection or our Twitter account (https://twitter.com/YoroiWallet).',
  },
  currentCoinPriceError: {
    id: 'api.errors.currentCoinPriceError',
    defaultMessage: '!!!Current coin price data not available now.',
  },
  historicalCoinPriceError: {
    id: 'api.errors.histoicalCoinPriceError',
    defaultMessage: '!!!Historical coin price data not available now.',
  },
  genericApiError: {
    id: 'api.errors.GenericApiError',
    defaultMessage: '!!!An error occurred, please try again later.',
  },
  incorrectWalletPasswordError: {
    id: 'api.errors.IncorrectPasswordError',
    defaultMessage: '!!!Incorrect wallet password.',
  },
  walletAlreadyRestoredError: {
    id: 'api.errors.WalletAlreadyRestoredError',
    defaultMessage: '!!!Wallet you are trying to restore already exists.',
  },
  reportRequestError: {
    id: 'api.errors.ReportRequestError',
    defaultMessage: '!!!There was a problem sending the support request.',
  },
  unusedAddressesError: {
    id: 'api.errors.unusedAddressesError',
    defaultMessage: '!!!You cannot generate more than 20 consecutive unused addresses.',
  },
});

export class ServerStatusError extends LocalizableError {
  constructor() {
    super({
      id: messages.serverStatusError.id,
      defaultMessage: messages.serverStatusError.defaultMessage || '',
    });
  }
}

export class CurrentCoinPriceError extends LocalizableError {
  constructor() {
    super({
      id: messages.currentCoinPriceError.id,
      defaultMessage: messages.currentCoinPriceError.defaultMessage || '',
    });
  }
}

export class HistoricalCoinPriceError extends LocalizableError {
  constructor() {
    super({
      id: messages.historicalCoinPriceError.id,
      defaultMessage: messages.historicalCoinPriceError.defaultMessage || '',
    });
  }
}

export class GenericApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.genericApiError.id,
      defaultMessage: messages.genericApiError.defaultMessage || '',
    });
  }
}

export class IncorrectWalletPasswordError extends LocalizableError {
  constructor() {
    super({
      id: messages.incorrectWalletPasswordError.id,
      defaultMessage: messages.incorrectWalletPasswordError.defaultMessage || '',
    });
  }
}

export class WalletAlreadyRestoredError extends LocalizableError {
  constructor() {
    super({
      id: messages.walletAlreadyRestoredError.id,
      defaultMessage: messages.walletAlreadyRestoredError.defaultMessage || '',
    });
  }
}

export class ReportRequestError extends LocalizableError {
  constructor() {
    super({
      id: messages.reportRequestError.id,
      defaultMessage: messages.reportRequestError.defaultMessage || '',
    });
  }
}

export class UnusedAddressesError extends LocalizableError {
  constructor() {
    super({
      id: messages.unusedAddressesError.id,
      defaultMessage: messages.unusedAddressesError.defaultMessage || '',
    });
  }
}
