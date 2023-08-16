// @flow

import cryptoRandomString from 'crypto-random-string';
import { RustModule } from '../api/ada/lib/cardanoCrypto/rustLoader';
import { WrongPassphraseError } from '../api/ada/lib/cardanoCrypto/cryptoErrors';

export function encryptWithPassword(
  password: string,
  bytes: Uint8Array
): string {
  const saltHex = cryptoRandomString({ length: 2 * 32 });
  const nonceHex = cryptoRandomString({ length: 2 * 12 });
  const passwordHex = Buffer.from(password).toString('hex');
  const dataHex = Buffer.from(bytes).toString('hex');
  return RustModule.WalletV4.encrypt_with_password(passwordHex, saltHex, nonceHex, dataHex);
}

export function decryptWithPassword(
  password: string,
  encryptedHex: string
): Uint8Array {
  const passwordHex = Buffer.from(password).toString('hex');
  try {
    const decryptedHex = RustModule.WalletV4.decrypt_with_password(passwordHex, encryptedHex);
    return Buffer.from(decryptedHex, 'hex');
  } catch (err) {
    throw new WrongPassphraseError();
  }
}
