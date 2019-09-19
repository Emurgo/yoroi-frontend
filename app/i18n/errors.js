// @flow
import LocalizableError from './LocalizableError';

export class InvalidMnemonicError extends LocalizableError {
  constructor() {
    super({
      id: 'api.errors.invalidMnemonicError',
      defaultMessage: '!!!Invalid phrase entered, please check.',
    });
  }
}

export class InvalidEmailError extends LocalizableError {
  constructor() {
    super({
      id: 'global.errors.invalidEmail',
      defaultMessage: '!!!Invalid email entered, please check.',
    });
  }
}

export class FieldRequiredError extends LocalizableError {
  constructor() {
    super({
      id: 'global.errors.fieldIsRequired',
      defaultMessage: '!!!This field is required.',
    });
  }
}

export class AdaRedemptionCertificateParseError extends LocalizableError {
  constructor() {
    super({
      id: 'api.errors.AdaRedemptionCertificateParseError',
      defaultMessage: '!!!The ADA redemption code could not be parsed from the given document.',
    });
  }
}

export class UnableToLoadError extends LocalizableError {
  constructor() {
    super({
      id: 'app.errors.unableToLoad',
      defaultMessage: '!!!Unable to load!',
    });
  }
}
