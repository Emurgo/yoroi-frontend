// @flow
import LocalizableError from './LocalizableError';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  unableToLoad: {
    id: 'app.errors.unableToLoad',
    defaultMessage: '!!!Unable to load!',
  },
  storageLoadError: {
    id: 'app.errors.storageLoadError',
    defaultMessage: '!!!Failed to access storage. Yoroi needs to access to storage ("IndexedDB") to properly manage wallets. Your browser may either not support IndexedDB or it may be disabled due to your privacy settings (such as private browsing)',
  },
});

export class UnableToLoadError extends LocalizableError {
  constructor() {
    super({
      id: messages.unableToLoad.id,
      defaultMessage: messages.unableToLoad.defaultMessage || '',
    });
  }
}

export class StorageLoadError extends LocalizableError {
  constructor() {
    super({
      id: messages.storageLoadError.id,
      defaultMessage: messages.storageLoadError.defaultMessage || '',
    });
  }
}
