// @flow
import ExtendableError from 'es6-error';

export const WRONG_PASSPHRASE_ERROR_MESSAGE = 'Passphrase doesn\'t match';

export class WrongPassphraseError extends ExtendableError {

  static get defaultMessage(): string {
    return WRONG_PASSPHRASE_ERROR_MESSAGE;
  }

  constructor() {
    super(WrongPassphraseError.defaultMessage);
  }
}

export class SeedWithInvalidLengthError extends ExtendableError {
  constructor(message: ?string = 'Seed has an invalid length') {
    super(message);
  }
}
