// @flow

import { PasswordProtect } from 'rust-cardano-crypto';
import cryptoRandomString from 'crypto-random-string';
import { WrongPassphraseError, CardanoCryptoError } from '../api/ada/lib/cardanoCrypto/cryptoErrors';

export function encryptWithPassword(
  password: string,
  bytes: Uint8Array
): string {
  const salt = Buffer.from(cryptoRandomString(2 * 32), 'hex');
  const nonce = Buffer.from(cryptoRandomString(2 * 12), 'hex');
  const formattedPassword: Uint8Array = new TextEncoder().encode(password);
  const encryptedBytes = PasswordProtect.encryptWithPassword(formattedPassword, salt, nonce, bytes);
  if (!encryptedBytes) {
    throw new CardanoCryptoError('Result not defined');
  }
  const encryptedHex = Buffer.from(encryptedBytes).toString('hex');
  return encryptedHex;
}

export function decryptWithPassword(
  password: string,
  encryptedHex: string
): Uint8Array {
  const encryptedBytes = Buffer.from(encryptedHex, 'hex');
  const formattedPassword: Uint8Array = new TextEncoder().encode(password);
  const decryptedBytes: ?Uint8Array | false =
    PasswordProtect.decryptWithPassword(formattedPassword, encryptedBytes);
  if (!decryptedBytes) {
    throw new WrongPassphraseError();
  } else {
    return decryptedBytes;
  }
}
