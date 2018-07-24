// @flow

import bip39 from 'bip39';
import pbkdf2 from 'pbkdf2';
import aesjs from 'aes-js';
import cryptoRandomString from 'crypto-random-string';

import { HdWallet, Wallet } from 'rust-cardano-crypto';
import { encryptWithPassword, decryptWithPassword } from '../../../../utils/passwordCipher';
import { getOrFail } from './cryptoUtils';

import { WrongPassphraseError } from './cryptoErrors';
import type { ConfigType } from '../../../../../config/config-types';

export type WalletMasterKey = {
  encryptedMasterKey: string,
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

function decryptMasterKey(walletMasterKey : WalletMasterKey, password : string) : Uint8Array {
  const passwordVerifier = calculatePasswordVerifier(password, walletMasterKey.passwordSalt);
  if (passwordVerifier !== walletMasterKey.passwordVerifier) {
    throw new WrongPassphraseError();
  }
  return decryptWithPassword(password, walletMasterKey.encryptedMasterKey);
}

function encryptWalletMasterKey(masterKey : Uint8Array, password : string) {
  const passwordSalt = cryptoRandomString(32);
  return {
    encryptedMasterKey: encryptWithPassword(password, masterKey),
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

export function generateWalletMasterKey(secretWords : string, password : string) : WalletMasterKey {
  const entropy = new Buffer(bip39.mnemonicToEntropy(secretWords), 'hex');
  const masterKey: Uint8Array = HdWallet.fromEnhancedEntropy(entropy, '');
  return encryptWalletMasterKey(masterKey, password);
}

export function updateWalletMasterKeyPassword(
  walletMasterKey : WalletMasterKey,
  oldPassword : string,
  newPassword : string
): WalletMasterKey {
  const masterKey = decryptMasterKey(walletMasterKey, oldPassword);
  return encryptWalletMasterKey(masterKey, newPassword);
}

export function getCryptoWalletFromMasterKey(
  walleMasterKey: WalletMasterKey,
  password: string
): CryptoWallet {
  const masterKey = decryptMasterKey(walleMasterKey, password);
  const wallet = Wallet
    .fromMasterKey(masterKey)
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
