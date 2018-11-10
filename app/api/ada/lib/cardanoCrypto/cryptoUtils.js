// @flow
import { CardanoCryptoError } from './cryptoErrors';

// TODO: turn "any" into a templated type once we upgrade our packages enough to allow this
export function getResultOrFail(
  result: any
): any {
  if (result.failed) {
    throw new CardanoCryptoError(result.msg);
  }
  return result.result;
}
