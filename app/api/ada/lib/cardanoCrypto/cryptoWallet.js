// @flow

// Utility functions for handling the private master key

import bip39 from 'bip39';

import { Logger, stringifyError } from '../../../../utils/logging';

// $FlowFixMe
import { HdWallet, Wallet, PaperWallet } from 'rust-cardano-crypto';
import { encryptWithPassword, decryptWithPassword } from '../../../../utils/passwordCipher';
import { getResultOrFail } from './cryptoUtils';

import type { ConfigType } from '../../../../../config/config-types';
import * as unorm from 'unorm';
import { pbkdf2Sync as pbkdf2 } from 'pbkdf2';

declare var CONFIG : ConfigType;

const protocolMagic = CONFIG.network.protocolMagic;

/** Generate a random mnemonic based on 160-bits of entropy (15 words) */
export const generateAdaMnemonic = () => bip39.generateMnemonic(160).split(' ');

/** Generate a random mnemonic based on 96-bits of entropy (9 words), and also return hexed seed */
export const generatePasswordAndMnemonic = () => {
  const mnemonic = bip39.generateMnemonic(96);
  const words = mnemonic.split(' ');
  const seed = mnemonicToSeedHex(mnemonic);
  return { words, seed };
};

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
  const fakePassword = numberOfWords === 21 ? 'xxx' : undefined;
  const [unscrambled, unscrambledLen] = unscramblePaperAdaMnemonic(phrase, numberOfWords, fakePassword);
  if (unscrambled && unscrambledLen) {
    return isValidEnglishAdaMnemonic(unscrambled, unscrambledLen);
  }
  return false;
};

/** Check validty of paper mnemonic (including checksum) */
export const unscramblePaperAdaMnemonic = (
  phrase: string,
  numberOfWords: ?number = 27,
  password?: string,
): [?string, number] => {
  const words = phrase.split(' ');
  if (words.length === numberOfWords) {
    if (numberOfWords === 27) {
      if (password) {
        throw new Error('Password is not expected for a 27-word paper!');
      }
      const [scrambledMnemonics, passwordMnemonics] = [words.slice(0, 18), words.slice(18)];
      try {
        password = mnemonicToSeedHex(passwordMnemonics.join(' '));
        return [PaperWallet.unscrambleStrings(password, scrambledMnemonics.join(' ')), 12];
      } catch (e) {
        Logger.error('Failed to unscramble paper mnemonic! ' + stringifyError(e));
        return [undefined, 0];
      }
    }
    if (numberOfWords === 30) {
      if (password) {
        throw new Error('Password is not expected for a 30-word paper!');
      }
      const [scrambledMnemonics, passwordMnemonics] = [words.slice(0, 21), words.slice(21)];
      try {
        password = mnemonicToSeedHex(passwordMnemonics.join(' '));
        return [PaperWallet.unscrambleStrings(password, scrambledMnemonics.join(' ')), 15];
      } catch (e) {
        Logger.error('Failed to unscramble paper mnemonic! ' + stringifyError(e));
        return [undefined, 0];
      }
    }
    if (numberOfWords === 21) {
      if (!password) {
        throw new Error('Password is expected for a 21-word paper!');
      }
      try {
        return [PaperWallet.unscrambleStrings(password, words.join(' ')), 15];
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
  const iv = new Uint8Array(8);
  window.crypto.getRandomValues(iv);
  return PaperWallet.scrambleStrings(iv, password, phrase);
};

const mnemonicToSeedHex = (mnemonic: string, password: ?string) => {
  const mnemonicBuffer = Buffer.from(unorm.nfkd(mnemonic), 'utf8');
  const salt = 'mnemonic' + (unorm.nfkd(password) || '');
  const saltBuffer = Buffer.from(salt, 'utf8');
  return pbkdf2(mnemonicBuffer, saltBuffer, 2048, 32, 'sha512').toString('hex');
};

/** Generate and encrypt HD wallet */
export function generateWalletMasterKey(secretWords : string, password : string): string {
  const entropy = Buffer.from(bip39.mnemonicToEntropy(secretWords), 'hex');
  const masterKey: Uint8Array = HdWallet.fromEnhancedEntropy(entropy, '');
  return encryptWithPassword(password, masterKey);
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
): CryptoWallet {
  const masterKey = decryptWithPassword(password, encryptedMasterKey);
  const wallet = Wallet
    .fromMasterKey(masterKey)
    .result;
  wallet.config.protocol_magic = protocolMagic;
  return wallet;
}

/** Generate a Daedalus /wallet/ to create transactions. Do not save this. Regenerate every time. */
export function getCryptoDaedalusWalletFromMnemonics(
  secretWords: string,
): CryptoDaedalusWallet {
  // TODO: Should use an encrypted mnemonic and also a password to decrypt it
  const wallet: CryptoDaedalusWallet = getResultOrFail(Wallet.fromDaedalusMnemonic(secretWords));
  wallet.config.protocol_magic = protocolMagic;
  return wallet;
}

/** Generate a Daedalus /wallet/ to create transactions. Do not save this. Regenerate every time.
 * Note: key encoded as hex-string
 */
export function getCryptoDaedalusWalletFromMasterKey(
  masterKey: string,
): CryptoDaedalusWallet {
  const encodedKey = Buffer.from(masterKey, 'hex');

  const wallet: CryptoDaedalusWallet = getResultOrFail(Wallet.fromDaedalusMasterKey(encodedKey));
  wallet.config.protocol_magic = protocolMagic;
  return wallet;
}

export const mnemonicsToAddresses = (
  mnemonic: string,
  count?: number = 1,
  type?: AddressType = 'External'
): Array<string> => {
  const masterKey = generateWalletMasterKey(mnemonic, '');
  const wallet = getCryptoWalletFromMasterKey(masterKey, '');
  const { result: account } = Wallet.newAccount(wallet, 0);
  const { result: addresses } = Wallet.generateAddresses(account, type, [...Array(count).keys()]);
  return addresses;
};
