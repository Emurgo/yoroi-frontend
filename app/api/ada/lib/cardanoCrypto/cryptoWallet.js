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
        return [PaperWallet.unscrambleStrings(password, scrambledMnemonics.join(' ')), 12];
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
