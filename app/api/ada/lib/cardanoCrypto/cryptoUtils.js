// @flow
import CardanoCryptoError from './cryptoErrors';

/* TODO: All cardano crypto methods should use this util */
export function getOrFail(
  result: any
): any {
  if (result.failed) {
    throw new CardanoCryptoError(result.msg);
  }
  return result.result;
}
