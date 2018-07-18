// @flow

import bip39 from 'bip39';
import pbkdf2 from 'pbkdf2';
import aesjs from 'aes-js';
import cryptoRandomString from 'crypto-random-string';

import { Blake2b, Wallet } from 'rust-cardano-crypto';
import { encryptWithPassword, decryptWithPassword } from '../../../../utils/passwordCipher';
import { getOrFail } from './cryptoUtils';

import { WrongPassphraseError } from './cryptoErrors';
import type { ConfigType } from '../../../../../config/config-types';

export type WalletSeed = {
  encryptedSeed: string,
  passwordVerifier: string,
  passwordSalt: string,
};

declare var CONFIG : ConfigType;

const protocolMagic = CONFIG.network.protocolMagic;

function calculatePasswordVerifier(password : string, salt: string) : string {
  const derivedKey = pbkdf2.pbkdf2Sync(password, salt, 5000, 32, 'sha512');
  return aesjs
    .utils
    .hex
    .fromBytes(derivedKey);
}

function decryptSeed(walletSeed : WalletSeed, password : string) : Uint8Array {
  const passwordVerifier = calculatePasswordVerifier(password, walletSeed.passwordSalt);
  if (passwordVerifier !== walletSeed.passwordVerifier) {
    throw new WrongPassphraseError();
  }
  return decryptWithPassword(password, walletSeed.encryptedSeed);
}

function encryptWalletSeed(seed : Uint8Array, password : string) {
  const passwordSalt = cryptoRandomString(32);
  return {
    encryptedSeed: encryptWithPassword(password, seed),
    passwordVerifier: calculatePasswordVerifier(password, passwordSalt),
    passwordSalt,
  };
}

export const generateAdaMnemonic = () => bip39.generateMnemonic(160).split(' ');

export const isValidAdaMnemonic = (
  phrase: string,
  numberOfWords: ?number = 15
) =>
  phrase.split(' ').length === numberOfWords && bip39.validateMnemonic(phrase);

export function generateWalletSeed(secretWords : string, password : string) : WalletSeed {
  const entropy = bip39.mnemonicToEntropy(secretWords);
  const seed: Uint8Array = Blake2b.blake2b_256(entropy);
  return encryptWalletSeed(seed, password);
}

export function updateWalletSeedPassword(
  walletSeed : WalletSeed,
  oldPassword : string,
  newPassword : string
): WalletSeed {
  const seed = decryptSeed(walletSeed, oldPassword);
  return encryptWalletSeed(seed, newPassword);
}

export function getCryptoWalletFromSeed(walletSeed : WalletSeed, password : string) : CryptoWallet {
  const seed = decryptSeed(walletSeed, password);
  const seedAsArray = Object.values(seed);
  const wallet = Wallet
    .fromSeed(seedAsArray)
    .result;
  wallet.config.protocol_magic = protocolMagic;
  return wallet;
}

/* FIXME: Should be pass a encrypted mnemonic and also the password to decrypt it*/
export function getCryptoDaedalusWalletFromMnemonics(
  secretWords: string,
): CryptoDaedalusWallet {
  const wallet = getOrFail(Wallet.fromDaedalusMnemonic(secretWords));
  wallet.config.protocol_magic = protocolMagic;
  return wallet;
}
