// @flow
import CardanoCryptoError from './cryptoErrors';

export function getResultOrFail(
  result: any
): any {
  if (result.failed) {
    throw new CardanoCryptoError(result.msg);
  }
  return result.result;
}

export function getOrFail(
  result: ?any
): any {
  if (!result) {
    throw new CardanoCryptoError('Result not defined');
  }
  return result;
}
