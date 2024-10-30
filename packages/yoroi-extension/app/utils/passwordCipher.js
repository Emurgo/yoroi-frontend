// @flow

import cryptoRandomString from 'crypto-random-string';
import { RustModule } from '../api/ada/lib/cardanoCrypto/rustLoader';
import { WrongPassphraseError } from '../api/ada/lib/cardanoCrypto/cryptoErrors';
import { bytesToHex, hexToBytes } from '../coreUtils';

export function encryptWithPassword(
  password: string,
  bytes: Uint8Array
): string {
  const saltHex = cryptoRandomString({ length: 2 * 32 });
  const nonceHex = cryptoRandomString({ length: 2 * 12 });
  const passwordHex = bytesToHex(password);
  const dataHex = bytesToHex(bytes);
  return RustModule.WalletV4.encrypt_with_password(passwordHex, saltHex, nonceHex, dataHex);
}

export function decryptWithPassword(
  password: string,
  encryptedHex: string
): Uint8Array {
  const passwordHex = bytesToHex(password);
  try {
    const decryptedHex = RustModule.WalletV4.decrypt_with_password(passwordHex, encryptedHex);
    return hexToBytes(decryptedHex);
  } catch (err) {
    throw new WrongPassphraseError();
  }
}
