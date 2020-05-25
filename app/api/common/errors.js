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
