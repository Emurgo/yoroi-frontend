// @flow

import cryptoRandomString from 'crypto-random-string';
import { RustModule } from '../api/ada/lib/cardanoCrypto/rustLoader';
import { WrongPassphraseError } from '../api/ada/lib/cardanoCrypto/cryptoErrors';

export function encryptWithPassword(
  password: string,
  bytes: Uint8Array
): string {
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
  const encryptedBytes = Buffer.from(encryptedHex, 'hex');
  let decryptedBytes;
  try {
    decryptedBytes = RustModule.Wallet.password_decrypt(password, encryptedBytes);
  } catch (err) {
    throw new WrongPassphraseError();
  }
  return decryptedBytes;
}
