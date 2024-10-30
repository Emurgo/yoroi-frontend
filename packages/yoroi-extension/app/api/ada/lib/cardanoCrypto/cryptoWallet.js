// @flow
/* eslint-disable camelcase */

// Utility functions for handling the private master key

import {
  generateMnemonic,
  mnemonicToEntropy,
  mnemonicToSeedSync,
} from 'bip39';
import * as crypto from 'crypto';

import { RustModule } from './rustLoader';
import { hexToBytes, utfToBytes } from '../../../../coreUtils';

/** Generate a random mnemonic based on 160-bits of entropy (15 words) */
export const generateAdaMnemonic: void => Array<string> = () => generateMnemonic(160).split(' ');

export const hashRepeatedly = (seed: Buffer): [Buffer, Buffer] => {
  let currSeed = seed;
  let I;
  let IL;
  let IR;
  do {
    I = crypto.createHmac('sha512', utfToBytes('ed25519 seed'))
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
): RustModule.WalletV4.Bip32PrivateKey => {
  // Generate a seed byte sequence S of 512 bits according to BIP-0039.
  const seed = mnemonicToSeedSync(mnemonic);

  // note: prefix 1 and sha256 (not 512)
  const chainCode = crypto.createHmac('sha256', utfToBytes('ed25519 seed'))
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
  return RustModule.WalletV4.Bip32PrivateKey.from_bytes(buffer);
};

export function generateWalletRootKey(
  mnemonic: string
): RustModule.WalletV4.Bip32PrivateKey {
  const bip39entropy = mnemonicToEntropy(mnemonic);
  /**
 * there is no wallet entropy password in yoroi
 * the PASSWORD here is the password to add more _randomness_
 * when deriving the wallet root key from the entropy
 * it is NOT the spending PASSWORD
 */
  const EMPTY_PASSWORD = Buffer.from('');
  const rootKey = RustModule.WalletV4.Bip32PrivateKey.from_bip39_entropy(
    hexToBytes(bip39entropy),
    EMPTY_PASSWORD
  );
  return rootKey;
}

/**
 * Generate catalyst private key for QR code
 */

export function generatePrivateKeyForCatalyst(): RustModule.WalletV4.Bip32PrivateKey {
  const mnemonic = generateMnemonic(160);
  const bip39entropy = mnemonicToEntropy(mnemonic);
  const EMPTY_PASSWORD = Buffer.from('');
  const rootKey = RustModule.WalletV4.Bip32PrivateKey.from_bip39_entropy(
    hexToBytes(bip39entropy),
    EMPTY_PASSWORD
  );
  return rootKey;
}
