// @flow
import ExtendableError from 'es6-error';

export class WrongPassphraseError extends ExtendableError {
  constructor(message: ?string = 'Passphrase doesn\'t match') {
    super(message);
  }
}

export class SeedWithInvalidLengthError extends ExtendableError {
  constructor(message: ?string = 'Seed has an invalid length') {
    super(message);
  }
}
export class CreateRedeemTransactionError extends ExtendableError {
  constructor(message: ?string = 'Error while creating redeem transaction') {
    super(message);
  }
}
