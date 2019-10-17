// @flow
/* eslint-disable camelcase */

// Utility functions for handling the private master key

import cryptoRandomString from 'crypto-random-string';
import { validateMnemonic, generateMnemonic, entropyToMnemonic, wordlists } from 'bip39';

import { Logger, stringifyError } from '../../../../utils/logging';

import { encryptWithPassword, decryptWithPassword } from '../../../../utils/passwordCipher';

import * as unorm from 'unorm';
import { pbkdf2Sync as pbkdf2 } from 'pbkdf2';

import { RustModule } from './rustLoader';
import type { GenerateAddressFunc } from '../adaAddressProcessing';
import { genAddressBatchFunc } from '../../restoreAdaWallet';
import blakejs from 'blakejs';
import crc32 from 'buffer-crc32';
import type { WalletAccountNumberPlate } from '../storage/models/PublicDeriver/interfaces';
import { HARD_DERIVATION_START } from '../../../../config/numbersConfig';


/** Generate a random mnemonic based on 160-bits of entropy (15 words) */
export const generateAdaMnemonic: void => Array<string> = () => generateMnemonic(160).split(' ');

/** Check validty of mnemonic (including checksum) */
export const isValidEnglishAdaMnemonic = (
  phrase: string,
  numberOfWords: ?number = 15
) => {
  // Note: splitting on spaces will not work for Japanese-encoded mnemonics who use \u3000 instead
  // We only use English mnemonics in Yoroi so this is okay.
  const split = phrase.split(' ');
  if (split.length !== numberOfWords) {
    return false;
  }
  return validateMnemonic(phrase);
};

/** Check validty of paper mnemonic (including checksum) */
export const isValidEnglishAdaPaperMnemonic = (
  phrase: string,
  numberOfWords: ?number = 27
) => {
  // Any password will return some valid unscrambled mnemonic
  // so we just pass a fake password to pass downstream validation
  const fakePassword = numberOfWords === 21 ? 'xxx' : undefined;
  const [unscrambled, unscrambledLen] =
    unscramblePaperAdaMnemonic(phrase, numberOfWords, fakePassword);
  if (unscrambled != null && unscrambledLen) {
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
      if (password != null) {
        throw new Error('Password is not expected for a 27-word paper!');
      }
      const [scrambledMnemonics, passwordMnemonics] = [words.slice(0, 18), words.slice(18)];
      try {
        password = mnemonicToSeedHex(passwordMnemonics.join(' '));
        const entropy = RustModule.WalletV2.Entropy.from_english_mnemonics(
          scrambledMnemonics.join(' ')
        );
        const newEntropy = RustModule.WalletV2.paper_wallet_unscramble(
          entropy.to_array(),
          password
        );

        return [newEntropy.to_english_mnemonics(), 12];
      } catch (e) {
        Logger.error('Failed to unscramble paper mnemonic! ' + stringifyError(e));
        return [undefined, 0];
      }
    }
    if (numberOfWords === 21) {
      if (password == null) {
        throw new Error('Password is expected for a 21-word paper!');
      }
      try {
        const entropy = RustModule.WalletV2.Entropy.from_english_mnemonics(phrase);
        const newEntropy = RustModule.WalletV2.paper_wallet_unscramble(
          entropy.to_array(),
          password
        );
        return [newEntropy.to_english_mnemonics(), 15];
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

const mnemonicToSeedHex = (mnemonic: string, password: ?string) => {
  const mnemonicBuffer = Buffer.from(unorm.nfkd(mnemonic), 'utf8');
  const salt = 'mnemonic' + (unorm.nfkd(password) || '');
  const saltBuffer = Buffer.from(salt, 'utf8');
  return pbkdf2(mnemonicBuffer, saltBuffer, 2048, 32, 'sha512').toString('hex');
};

export function generateWalletRootKey(
  mnemonic: string
): RustModule.WalletV2.Bip44RootPrivateKey {
  const entropy = RustModule.WalletV2.Entropy.from_english_mnemonics(mnemonic);

  /**
 * there is no wallet entropy password in yoroi
 * the PASSWORD here is the password to add more _randomness_
 * when deriving the wallet root key from the entropy
 * it is NOT the spending PASSWORD
 */
  const EMPTY_PASSWORD = '';
  const rootKey = RustModule.WalletV2.Bip44RootPrivateKey.recover(
    entropy,
    EMPTY_PASSWORD
  );
  return rootKey;
}

/** Generate and encrypt HD wallet */
export function generateWalletMasterKey(mnemonic: string, password : string): string {
  const rootKey = generateWalletRootKey(mnemonic);
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

export function getCryptoWalletFromEncryptedMasterKey(
  encryptedMasterKey: string,
  password: string
): RustModule.WalletV2.Bip44RootPrivateKey {
  const masterKeyBytes = decryptWithPassword(password, encryptedMasterKey);
  const masterKeyHex = Buffer.from(masterKeyBytes).toString('hex');
  return getCryptoWalletFromMasterKey(masterKeyHex);
}
export function getCryptoWalletFromMasterKey(
  masterKeyHex: string,
): RustModule.WalletV2.Bip44RootPrivateKey {
  const privateKey = RustModule.WalletV2.PrivateKey.from_hex(masterKeyHex);
  const cryptoWallet = RustModule.WalletV2.Bip44RootPrivateKey.new(
    privateKey,
    RustModule.WalletV2.DerivationScheme.v2()
  );
  return cryptoWallet;
}

export function createAccountPlate(accountPubHash: string): WalletAccountNumberPlate {
  const hash = blakejs.blake2bHex(accountPubHash);
  const [a, b, c, d] = crc32(hash);
  const alpha = `ABCDEJHKLNOPSTXZ`;
  const letters = x => `${alpha[Math.floor(x / 16)]}${alpha[x % 16]}`;
  const numbers = `${((c << 8) + d) % 10000}`.padStart(4, '0');
  const id = `${letters(a)}${letters(b)}-${numbers}`;
  return { hash, id };
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

export const generateStandardPlate = (
  mnemonic: string,
  accountIndex: number,
  count: number,
  protocolMagic: number,
): { addresses: Array<string>, accountPlate: WalletAccountNumberPlate } => {
  const masterKey = generateWalletMasterKey(mnemonic, '');
  const cryptoWallet = getCryptoWalletFromEncryptedMasterKey(masterKey, '');
  const account = cryptoWallet.bip44_account(
    RustModule.WalletV2.AccountIndex.new(accountIndex + HARD_DERIVATION_START)
  );
  const accountPublic = account.public();

  return mnemonicsToAddresses(
    genAddressBatchFunc(
      accountPublic.bip44_chain(false),
      protocolMagic,
    ),
    accountPublic.key(),
    count
  );
};

const mnemonicsToAddresses = (
  generateAddressFunc: GenerateAddressFunc,
  pubKey: RustModule.WalletV2.PublicKey,
  count: number,
): { addresses: Array<string>, accountPlate: WalletAccountNumberPlate } => {
  const accountPlate = createAccountPlate(pubKey.to_hex());

  const addresses = generateAddressFunc([...Array(count).keys()]);
  return { addresses, accountPlate };
};
