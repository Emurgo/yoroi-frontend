// @flow
import ExtendableError from 'es6-error';

class CardanoCryptoError extends ExtendableError {
  constructor(message: ?string = 'Cardano crypto error') {
    super(message);
  }
}

export default CardanoCryptoError;
