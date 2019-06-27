// @flow
import aesjs from 'aes-js';
import { validateMnemonic } from 'bip39';
import blakejs from 'blakejs';
import crypto from 'crypto';
import validWords from 'bip39/src/wordlists/english.json';
import { RustModule } from './cardanoCrypto/rustLoader';

const isBase64 = (string: string) => {
  const criteria = '(?:^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$)';
  const regex = new RegExp(`(?:^${criteria}?$)`);

  return regex.test(string);
};

const iv = Buffer.alloc(16); // it's iv = 0 simply

function decryptWithAES(aesKey, bytes) {
  return new aesjs.ModeOfOperation.ctr(aesKey, new aesjs.Counter(iv)).decrypt(bytes); // eslint-disable-line
}

const blake2b = (data) => blakejs.blake2b(data, null, 32);

const fromMnemonic = (words: string) => {
  const entropy = RustModule.Wallet.Entropy.from_english_mnemonics(words);
  return new Uint8Array(entropy.to_array());
};

export const isValidMnemonic = (
  phrase: string,
  numberOfWords: number = 9
) => (
  (phrase.split(' ').length === numberOfWords && validateMnemonic(phrase, validWords))
);

const hashData = (data) => {
  const hash = crypto.createHash('sha256');
  hash.update(data, 'utf8');
  // The hash is digested with hex enoding, so slice can be applied afterwards instead of hexSlice
  return hash.digest('hex');
};

export const decryptRegularVend = (
  key: string,
  data: string | Uint8Array,
) => decryptWithAES(blake2b(fromMnemonic(key)), data);
export const decryptForceVend = (
  key: Array<string>,
  data: string | Uint8Array
) => (
  decryptWithAES(blake2b(key[0].trim().toLowerCase() +
    hashData(key[1].trim()) + key[2].trim()), data)
);

// Recovery service certificates decryption
export const decryptRecoveryRegularVend = decryptRegularVend;
export const decryptRecoveryForceVend = (
  key: string,
  data: string | Uint8Array
) => {
  // There are 3 possible decryption key formats:
  // 1) base64 string (most common)
  // 2) hex string
  // 3) numeric array
  // ...therefore we need to try all 3 decryption methods

  const trimmedKey = key.trim();
  let decryptedData = null;
  let bufferKey;

  // 1) base64 string: "qXQWDxI3JrlFRtC4SeQjeGzLbVXWBomYPbNO1Vfm1T4="
  try {
    const decodedKey = trimmedKey.replace(/-/g, '+').replace(/_/g, '/');

    if (isBase64(decodedKey)) {
      bufferKey = Buffer.from(decodedKey, 'base64');
      decryptedData = decryptWithAES(bufferKey, data);
    }
  } catch (e) {} // eslint-disable-line

  // 2) hex string: "A974160F123726B94546D0B849E423786CCB6D55D60689983DB34ED557E6D53E"
  if (decryptedData === null) {
    try {
      bufferKey = Buffer.from(trimmedKey, 'hex');
      decryptedData = decryptWithAES(bufferKey, data);
    } catch (e) {} // eslint-disable-line
  }

  // eslint-disable-next-line max-len
  // 3) numeric array: "[ 169, 116, 22, 15, 18, 55, 38, 185, 69, 70, 208, 184, 73, 228, 35, 120, 108, 203, 109, 85, 214, 6, 137, 152, 61, 179, 78, 213, 87, 230, 213, 62 ]"
  if (decryptedData === null) {
    try {
      const arrayKey = JSON.parse(trimmedKey);
      bufferKey = Buffer.from(arrayKey);
      decryptedData = decryptWithAES(bufferKey, data);
    } catch (e) {} // eslint-disable-line
  }

  if (decryptedData === null) {
    throw new Error('Invalid decryption key');
  } else {
    return decryptedData;
  }
};
