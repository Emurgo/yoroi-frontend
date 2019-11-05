// @flow
import LocalizableError from './LocalizableError';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  unableToLoad: {
    id: 'app.errors.unableToLoad',
    defaultMessage: '!!!Unable to load!',
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
