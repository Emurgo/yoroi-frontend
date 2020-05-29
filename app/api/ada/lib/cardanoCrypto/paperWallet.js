// @flow

import cryptoRandomString from 'crypto-random-string';
import {
  entropyToMnemonic,
  mnemonicToEntropy,
  wordlists,
} from 'bip39';

import { Logger, stringifyError } from '../../../../utils/logging';

import * as unorm from 'unorm';
import { pbkdf2Sync as pbkdf2 } from 'pbkdf2';

import { RustModule } from './rustLoader';
import {
  isValidBip39Mnemonic
} from '../../../common/lib/crypto/wallet';
import config from '../../../../config';

/**
 * Variation of the mnemonic to seed as defined by BIP39
 * https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki#from-mnemonic-to-seed
 */
const mnemonicToSeedHex = (mnemonic: string, password: ?string): string => {
  const mnemonicBuffer = Buffer.from(unorm.nfkd(mnemonic), 'utf8');
  const salt = 'mnemonic' + (unorm.nfkd(password) || '');
  const saltBuffer = Buffer.from(salt, 'utf8');
  // note: we use a 32-byte key length instead of 64 like in the bip39 specification
  return pbkdf2(mnemonicBuffer, saltBuffer, 2048, 32, 'sha512').toString('hex');
};

/** Check validity of paper mnemonic (including checksum) */
export const isValidEnglishAdaPaperMnemonic = (
  phrase: string,
  numberOfWords: number
): boolean => {
  // Any password will return some valid unscrambled mnemonic
  // so we just pass a fake password to pass downstream validation
  const fakePassword = numberOfWords === config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT
    ? 'xxx'
    : undefined;
  const [unscrambled, unscrambledLen] =
    unscramblePaperAdaMnemonic(phrase, numberOfWords, fakePassword);
  if (unscrambled != null && unscrambledLen) {
    return isValidBip39Mnemonic(unscrambled, unscrambledLen);
  }
  return false;
};


/** Check validity of paper mnemonic (including checksum) */
export const unscramblePaperAdaMnemonic = (
  phrase: string,
  numberOfWords: number,
  password?: string,
): [?string, number] => {
  const words = phrase.split(' ');
  if (words.length === numberOfWords) {
    if (numberOfWords === config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT) {
      if (password != null) {
        throw new Error(
          `Password is not expected for a ${config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT}-word paper!`
        );
      }
      const [scrambledMnemonics, passwordMnemonics] = [words.slice(0, 18), words.slice(18)];
      try {
        password = mnemonicToSeedHex(passwordMnemonics.join(' '));
        const entropy = mnemonicToEntropy(
          scrambledMnemonics.join(' ')
        );
        const newEntropy = RustModule.WalletV2.paper_wallet_unscramble(
          Buffer.from(entropy, 'hex'),
          password
        );

        return [
          newEntropy.to_english_mnemonics(),
          config.wallets.DAEDALUS_RECOVERY_PHRASE_WORD_COUNT
        ];
      } catch (e) {
        Logger.error('Failed to unscramble paper mnemonic! ' + stringifyError(e));
        return [undefined, 0];
      }
    }
    if (numberOfWords === config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT) {
      if (password == null) {
        throw new Error(
          `Password is expected for a ${config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT}-word paper!`
        );
      }
      try {
        const entropy = mnemonicToEntropy(phrase);
        const newEntropy = RustModule.WalletV2.paper_wallet_unscramble(
          Buffer.from(entropy, 'hex'),
          password
        );
        return [
          newEntropy.to_english_mnemonics(),
          config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT
        ];
      } catch (e) {
        Logger.error('Failed to unscramble paper mnemonic! ' + stringifyError(e));
        return [undefined, 0];
      }
    }
  }
  return [undefined, 0];
};

/** Scramble provided mnemonic with the provided password */
export const scramblePaperAdaMnemonic = (
  phrase: string,
  password: string,
): string => {
  const salt = new Uint8Array(Buffer.from(cryptoRandomString({ length: 2 * 8 }), 'hex'));
  const entropy = RustModule.WalletV2.Entropy.from_english_mnemonics(phrase);
  const bytes = RustModule.WalletV2.paper_wallet_scramble(entropy, salt, password);
  return entropyToMnemonic(Buffer.from(bytes), wordlists.ENGLISH);
};
