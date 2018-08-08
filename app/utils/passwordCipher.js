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

  const encryptedBytes = getOrFail(
    PasswordProtect.encryptWithPassword(password, salt, nonce, bytes));
  const encryptedHex = Buffer.from(encryptedBytes).toString('hex');
  return encryptedHex;
}

export function decryptWithPassword(
  password: string,
  encryptedHex: string
): Uint8Array {
  const encryptedBytes = new Buffer(encryptedHex, 'hex');
  // FIXME: null or false is returned on invalid password
  const decryptedBytes: any = PasswordProtect.decryptWithPassword(password, encryptedBytes);
  if (!decryptedBytes) {
    throw new WrongPassphraseError();
  } else {
    return decryptedBytes;
  }
}
