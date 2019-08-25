// @flow

import cryptoRandomString from 'crypto-random-string';
import { RustModule } from '../api/ada/lib/cardanoCrypto/rustLoader';
import { WrongPassphraseError } from '../api/ada/lib/cardanoCrypto/cryptoErrors';

import environment from '../environment';

export function encryptWithPassword(
  password: string,
  bytes: Uint8Array
): string {
  // we need a constant password for tests.
  // password_encrypt generates a random seed inside the function so we can't use it
  if (environment.isJest()) {
    const rawKeyHex = Buffer.from(bytes).toString('hex');
    const passwordHex = Buffer.from(password).toString('hex');
    return rawKeyHex + passwordHex;
  }
  const salt = Buffer.from(cryptoRandomString({ length: 2 * 32 }), 'hex');
  const nonce = Buffer.from(cryptoRandomString({ length: 2 * 12 }), 'hex');
  const encryptedBytes = RustModule.Wallet.password_encrypt(password, salt, nonce, bytes);
  const encryptedHex = Buffer.from(encryptedBytes).toString('hex');
  return encryptedHex;
}

export function decryptWithPassword(
  password: string,
  encryptedHex: string
): Uint8Array {
  // we need a constant password for tests.
  // password_encrypt generates a random seed inside the function so we can't use it
  if (environment.isJest()) {
    const expectedSuffix = Buffer.from(password).toString('hex');
    if (!encryptedHex.endsWith(expectedSuffix)) {
      throw new WrongPassphraseError();
    }
    const rawKey = encryptedHex.slice(0, encryptedHex.length - expectedSuffix.length);
    return Buffer.from(rawKey, 'hex');
  }
  const encryptedBytes = Buffer.from(encryptedHex, 'hex');
  let decryptedBytes;
  try {
    decryptedBytes = RustModule.Wallet.password_decrypt(password, encryptedBytes);
  } catch (err) {
    throw new WrongPassphraseError();
  }
  return decryptedBytes;
}
