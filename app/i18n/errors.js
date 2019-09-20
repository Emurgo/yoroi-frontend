// @flow
import LocalizableError from './LocalizableError';

export class UnableToLoadError extends LocalizableError {
  constructor() {
    super({
      id: 'app.errors.unableToLoad',
      defaultMessage: '!!!Unable to load!',
    });
  }
}
