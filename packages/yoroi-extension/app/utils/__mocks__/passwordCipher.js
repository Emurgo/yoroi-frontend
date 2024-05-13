// @flow
/* eslint-disable  import/no-unused-modules */

import { WrongPassphraseError } from '../../api/ada/lib/cardanoCrypto/cryptoErrors';

/**
 * we need a constant password for tests.
  but real psasword generation uses a random seed so we need to mock it
 */

export function encryptWithPassword(
  password: string,
  bytes: Uint8Array
): string {
  const rawKeyHex = Buffer.from(bytes).toString('hex');
  const passwordHex = Buffer.from(password).toString('hex');
  return rawKeyHex + passwordHex;
}

export function decryptWithPassword(
  password: string,
  encryptedHex: string
): Uint8Array {
  const expectedSuffix = Buffer.from(password).toString('hex');
  if (!encryptedHex.endsWith(expectedSuffix)) {
    throw new WrongPassphraseError();
  }
  const rawKey = encryptedHex.slice(0, encryptedHex.length - expectedSuffix.length);
  return Buffer.from(rawKey, 'hex');
}
