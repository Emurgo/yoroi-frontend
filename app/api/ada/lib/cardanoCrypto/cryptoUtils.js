// @flow
import { CardanoCryptoError } from './cryptoErrors';

export function getResultOrFail(
  result: any
): any {
  if (result.failed) {
    throw new CardanoCryptoError(result.msg);
  }
  return result.result;
}
