// @flow

// Utility functions for handling the private master key

import bip39 from 'bip39';

import { Logger, stringifyError } from '../../../../utils/logging';

import { encryptWithPassword, decryptWithPassword } from '../../../../utils/passwordCipher';

import type { ConfigType } from '../../../../../config/config-types';
import * as unorm from 'unorm';
import { pbkdf2Sync as pbkdf2 } from 'pbkdf2';

import { RustModule } from './rustLoader';

declare var CONFIG : ConfigType;

/** Generate a random mnemonic based on 160-bits of entropy (15 words) */
export const generateAdaMnemonic = () => bip39.generateMnemonic(160).split(' ');

/** Check validty of mnemonic (including checksum) */
export const isValidEnglishAdaMnemonic = (
  phrase: string,
  numberOfWords: ?number = 15
) => (
  // Note: splitting on spaces will not work for Japanese-encoded mnemonics who use \u3000 instead
  // We only use English mnemonics in Yoroi so this is okay.
  phrase.split(' ').length === numberOfWords && bip39.validateMnemonic(phrase)
);

/** Check validty of paper mnemonic (including checksum) */
export const isValidEnglishAdaPaperMnemonic = (
  phrase: string,
  numberOfWords: ?number = 27
) => {
  const [unscrambled, unscrambledLen] = unscramblePaperAdaMnemonic(phrase, numberOfWords);
  if (unscrambled && unscrambledLen) {
    return isValidEnglishAdaMnemonic(unscrambled, unscrambledLen);
  }
  return false;
};

/** Check validty of paper mnemonic (including checksum) */
export const unscramblePaperAdaMnemonic = (
  phrase: string,
  numberOfWords: ?number = 27
): [?string, number] => {
  const words = phrase.split(' ');
  if (words.length === numberOfWords) {
    if (numberOfWords === 27) {
      const [scrambledMnemonics, passwordMnemonics] = [words.slice(0, 18), words.slice(18)];
      try {
        const password = mnemonicToSeedHex(passwordMnemonics.join(' '));
        const entropy = RustModule.Wallet.Entropy.from_english_mnemonics(
          scrambledMnemonics.join(' ')
        );
        // TODO fix unscramble
        const newEntropy = RustModule.Wallet.paper_wallet_unscramble(
          entropy.to_array(),
          password
        );

        return [newEntropy.to_english_mnemonics(), 12];
      } catch (e) {
        Logger.error('Failed to unscramble paper mnemonic! ' + stringifyError(e));
        return [undefined, 0];
      }
    }
  }
  return [undefined, 0];
};

const mnemonicToSeedHex = (mnemonic: string, password: ?string) => {
  const mnemonicBuffer = Buffer.from(unorm.nfkd(mnemonic), 'utf8');
  const salt = 'mnemonic' + (unorm.nfkd(password) || '');
  const saltBuffer = Buffer.from(salt, 'utf8');
  return pbkdf2(mnemonicBuffer, saltBuffer, 2048, 32, 'sha512').toString('hex');
};

/** Generate and encrypt HD wallet */
export function generateWalletMasterKey(mnemonic : string, password : string): string {
  const entropy = RustModule.Wallet.Entropy.from_english_mnemonics(mnemonic);

  /**
 * there is no wallet entropy password in yoroi
 * the PASSWORD here is the password to add more _randomness_
 * when deriving the wallet root key from the entropy
 * it is NOT the spending PASSWORD
 */
  const EMPTY_PASSWORD = '';
  const rootKey = RustModule.Wallet.Bip44RootPrivateKey.recover(
    entropy,
    EMPTY_PASSWORD
  );
  const masterKey = rootKey.key().to_hex();
  const encodedMasterKey = Buffer.from(masterKey, 'hex');
  return encryptWithPassword(password, encodedMasterKey);
}

export function updateWalletMasterKeyPassword(
  encryptedMasterKey : string,
  oldPassword : string,
  newPassword : string
): string {
  const masterKey = decryptWithPassword(oldPassword, encryptedMasterKey);
  return encryptWithPassword(newPassword, masterKey);
}

/** Decrypt a /wallet/ to create transactions. Do not save this. Regenerate every time. */
export function getCryptoWalletFromMasterKey(
  encryptedMasterKey: string,
  password: string
): RustModule.Wallet.Bip44RootPrivateKey {
  const masterKeyBytes = decryptWithPassword(password, encryptedMasterKey);
  const masterKeyHex = Buffer.from(masterKeyBytes).toString('hex');
  const privateKey = RustModule.Wallet.PrivateKey.from_hex(masterKeyHex);
  const cryptoWallet = RustModule.Wallet.Bip44RootPrivateKey.new(
    privateKey,
    RustModule.Wallet.DerivationScheme.v2()
  );
  return cryptoWallet;
}

/** Generate a Daedalus /wallet/ to create transactions. Do not save this. Regenerate every time. */
export function getCryptoDaedalusWalletFromMnemonics(
  mnemonic: string,
): RustModule.Wallet.DaedalusWallet {
  const entropy = RustModule.Wallet.Entropy.from_english_mnemonics(mnemonic);
  const wallet = RustModule.Wallet.DaedalusWallet.recover(entropy);
  return wallet;
}

/** Generate a Daedalus /wallet/ to create transactions. Do not save this. Regenerate every time.
 * Note: key encoded as hex-string
 */
export function getCryptoDaedalusWalletFromMasterKey(
  masterKeyHex: string,
): RustModule.Wallet.DaedalusWallet {
  const privateKey = RustModule.Wallet.PrivateKey.from_hex(masterKeyHex);
  const wallet = RustModule.Wallet.DaedalusWallet.new(privateKey);
  return wallet;
}
