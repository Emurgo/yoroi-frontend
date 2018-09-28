// @flow

import { PasswordProtect } from 'rust-cardano-crypto';
import cryptoRandomString from 'crypto-random-string';
import { getOrFail } from '../api/ada/lib/cardanoCrypto/cryptoUtils';
import { WrongPassphraseError } from '../api/ada/lib/cardanoCrypto/cryptoErrors';

export function encryptWithPassword(
  password: string,
  bytes: Uint8Array
): string {
  const salt = new Buffer(cryptoRandomString(2 * 32), 'hex');
  const nonce = new Buffer(cryptoRandomString(2 * 12), 'hex');
  const formattedPassword: Uint8Array = new TextEncoder().encode(password);
  const encryptedBytes = getOrFail(
    PasswordProtect.encryptWithPassword(formattedPassword, salt, nonce, bytes));
  const encryptedHex = Buffer.from(encryptedBytes).toString('hex');
  return encryptedHex;
}

export function decryptWithPassword(
  password: string,
  encryptedHex: string
): Uint8Array {
  const encryptedBytes = new Buffer(encryptedHex, 'hex');
  const formattedPassword: Uint8Array = new TextEncoder().encode(password);
  // FIXME: null or false is returned on invalid password
  const decryptedBytes: ?Uint8Array | false =
    PasswordProtect.decryptWithPassword(formattedPassword, encryptedBytes);
  if (!decryptedBytes) {
    throw new WrongPassphraseError();
  } else {
    return decryptedBytes;
  }
}
