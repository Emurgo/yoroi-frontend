// @flow
/* eslint-disable camelcase */

// Utility functions for handling the private master key

import {
  validateMnemonic,
  generateMnemonic,
  mnemonicToEntropy
} from 'bip39';

import { RustModule } from './rustLoader';

/** Generate a random mnemonic based on 160-bits of entropy (15 words) */
export const generateAdaMnemonic: void => Array<string> = () => generateMnemonic(160).split(' ');

/** Check validty of mnemonic (including checksum) */
export const isValidEnglishAdaMnemonic = (
  phrase: string,
  numberOfWords: number
) => {
  // Note: splitting on spaces will not work for Japanese-encoded mnemonics who use \u3000 instead
  // We only use English mnemonics in Yoroi so this is okay.
  const split = phrase.split(' ');
  if (split.length !== numberOfWords) {
    return false;
  }
  return validateMnemonic(phrase);
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
