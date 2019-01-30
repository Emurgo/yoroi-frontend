// @flow
import ExtendableError from 'es6-error';

export class CardanoCryptoError extends ExtendableError {
  constructor(message: ?string = 'Cardano crypto error') {
    super(message);
  }
}

export class WrongPassphraseError extends CardanoCryptoError {
  constructor(message: ?string = 'Passphrase doesn\'t match') {
    super(message);
  }
}

export class SeedWithInvalidLengthError extends CardanoCryptoError {
  constructor(message: ?string = 'Seed has an invalid length') {
    super(message);
  }
}
