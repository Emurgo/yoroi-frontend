// @flow

import pbkdf2 from 'pbkdf2';
import chacha from 'chacha';
import cryptoRandomString from 'crypto-random-string';

const PBKDF_ITERATIONS = 12983;
const KEY_SIZE = 32;
const DIGEST = 'sha512';
const PROTO_VERSION = Buffer.from('01', 'hex');

/*
	----------------------------------------------------------
	| 0x01 | SALT(16) | NONCE(12) | Encrypted Data | Tag(16) |
	----------------------------------------------------------
*/

const promisifyPbkdf2: (Uint8Array, Buffer) => Promise<Buffer> = (password, salt) => {
  return new Promise((resolve, reject) => {
    pbkdf2.pbkdf2(password, salt, PBKDF_ITERATIONS, KEY_SIZE, DIGEST, (err, key) => {
      if (err) return reject(err);
      resolve(key);
    });
  });
};

export async function encryptWithPassword(
  passwordBuf: Uint8Array,
  dataBytes: Uint8Array
): Promise<string> {
  const salt = Buffer.from(cryptoRandomString({ length: 2 * 16 }), 'hex');
  const nonce = Buffer.from(cryptoRandomString({ length: 2 * 12 }), 'hex');
  const data = Buffer.from(dataBytes);
  const aad = Buffer.from('', 'hex');

  const key = await promisifyPbkdf2(passwordBuf, salt);

  const cipher = chacha.createCipher(key, nonce);
  cipher.setAAD(aad, { plaintextLength: data.length });

  const head = cipher.update(data);
  const final = cipher.final();
  const tag = cipher.getAuthTag();

  const cipherText = Buffer.concat([PROTO_VERSION, salt, nonce, head, final, tag]);
  return cipherText.toString('hex');
}
