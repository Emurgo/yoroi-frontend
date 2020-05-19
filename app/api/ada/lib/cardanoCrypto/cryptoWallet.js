// @flow
/* eslint-disable camelcase */

// Utility functions for handling the private master key

import {
  validateMnemonic,
  generateMnemonic,
  mnemonicToEntropy,
  mnemonicToSeedSync,
} from 'bip39';
import * as crypto from 'crypto';

import { RustModule } from './rustLoader';

/** Generate a random mnemonic based on 160-bits of entropy (15 words) */
export const generateAdaMnemonic: void => Array<string> = () => generateMnemonic(160).split(' ');

/** Check validity of mnemonic (including checksum) */
export const isValidEnglishAdaMnemonic = (
  phrase: string,
  numberOfWords: number
): boolean => {
  // Note: splitting on spaces will not work for Japanese-encoded mnemonics who use \u3000 instead
  // We only use English mnemonics in Yoroi so this is okay.
  const split = phrase.split(' ');
  if (split.length !== numberOfWords) {
    return false;
  }
  return validateMnemonic(phrase);
};

export const hashRepeatedly = (seed: Buffer): [Buffer, Buffer] => {
  let currSeed = seed;
  let I;
  let IL;
  let IR;
  do {
    I = crypto.createHmac('sha512', Buffer.from('ed25519 seed', 'utf8'))
      .update(currSeed)
      .digest();
    currSeed = I;
    IL = I.slice(0, 32);
    IR = I.slice(32);
  } while ((IL[31] & 0b00100000) !== 0);

  return [IL, IR];
};

/**
  * Based on https://github.com/satoshilabs/slips/blob/master/slip-0010.md
  */
export const generateLedgerWalletRootKey = (
  mnemonic: string
): RustModule.WalletV3.Bip32PrivateKey => {
  // Generate a seed byte sequence S of 512 bits according to BIP-0039.
  const seed = mnemonicToSeedSync(mnemonic);

  // note: prefix 1 and sha256 (not 512)
  const chainCode = crypto.createHmac('sha256', Buffer.from('ed25519 seed', 'utf8'))
    .update(Buffer.concat([Buffer.of(1), seed], 1 + seed.length))
    .digest();

  const [IL, IR] = hashRepeatedly(seed);

  // As described in [RFC 8032 - 5.1.5](https://tools.ietf.org/html/rfc8032#section-5.1.5)

  // Clear the lowest 3 bits of the first byte
  IL[0] &= 248;
  // Clear highest bit and set the second highest bit of the last byte
  IL[31] &= 63;
  IL[31] |= 64;

  const buffer = Buffer.concat(
    [IL, IR, chainCode],
    IL.length + IR.length + chainCode.length
  );
  return RustModule.WalletV3.Bip32PrivateKey.from_bytes(buffer);
};

export function generateWalletRootKey(
  mnemonic: string
): RustModule.WalletV3.Bip32PrivateKey {
  const bip39entropy = mnemonicToEntropy(mnemonic);
  /**
 * there is no wallet entropy password in yoroi
 * the PASSWORD here is the password to add more _randomness_
 * when deriving the wallet root key from the entropy
 * it is NOT the spending PASSWORD
 */
  const EMPTY_PASSWORD = Buffer.from('');
  const rootKey = RustModule.WalletV3.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(bip39entropy, 'hex'),
    EMPTY_PASSWORD
  );
  return rootKey;
}

/** Generate a Daedalus /wallet/ to create transactions. Do not save this. Regenerate every time. */
export function getCryptoDaedalusWalletFromMnemonics(
  mnemonic: string,
): RustModule.WalletV2.DaedalusWallet {
  const entropy = RustModule.WalletV2.Entropy.from_english_mnemonics(mnemonic);
  const wallet = RustModule.WalletV2.DaedalusWallet.recover(entropy);
  return wallet;
}

/** Generate a Daedalus /wallet/ to create transactions. Do not save this. Regenerate every time.
 * Note: key encoded as hex-string
 */
export function getCryptoDaedalusWalletFromMasterKey(
  masterKeyHex: string,
): RustModule.WalletV2.DaedalusWallet {
  const privateKey = RustModule.WalletV2.PrivateKey.from_hex(masterKeyHex);
  const wallet = RustModule.WalletV2.DaedalusWallet.new(privateKey);
  return wallet;
}
