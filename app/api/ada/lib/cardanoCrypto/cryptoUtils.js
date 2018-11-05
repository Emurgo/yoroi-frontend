// @flow
import CardanoCryptoError from './cryptoErrors';

export function getResultOrFail<T>(
  arg: { result: T, failed: boolean, msg: ?string }
): T {
  if (arg.failed) {
    throw new CardanoCryptoError(arg.msg);
  }
  return arg.result;
}

export function getOrFail<T>(
  result: ?T | false
): T {
  if (!result) {
    throw new CardanoCryptoError('Result not defined');
  }
  return result;
}
