// @flow

import bip39 from 'bip39';
import createHmac from 'create-hmac';

import { Blake2b, Wallet } from 'rust-cardano-crypto';
import { Buffer } from 'safe-buffer';
import {
  encryptWithPassword,
  decryptWithPassword
} from '../../../../utils/passwordCipher';
import { getOrFail } from './cryptoUtils';

import type { ConfigType } from '../../../../../config/config-types';

export type WalletSeed = {
  encryptedSeed: string,
  hmac: string,
};

declare var CONFIG: ConfigType;

const protocolMagic = CONFIG.network.protocolMagic;


function seedHMac(password: string, seed: Uint8Array): string {
  const hmac = createHmac('sha512', Buffer.from(password));
  hmac.update(new TextDecoder("utf-8").decode(seed));
  return hmac.digest('hex');
}

function decryptSeed(walletSeed: WalletSeed, password: string): Uint8Array {
  const seed = decryptWithPassword(password, walletSeed.encryptedSeed);
  const decryptedHmac = seedHMac(password, seed);
  if (decryptedHmac !== walletSeed.hmac) {
    throw new Error('Passphrase doesn\'t match');
  }
  return seed;
}

function encryptWalletSeed(seed: Uint8Array, password: string) {
  return {
    encryptedSeed: encryptWithPassword(password, seed),
    hmac: seedHMac(password, seed),
  };
}

export const generateAdaMnemonic = () => bip39.generateMnemonic(160).split(' ');

export const isValidAdaMnemonic = (
  phrase: string,
  numberOfWords: ?number = 15
) =>
  phrase.split(' ').length === numberOfWords && bip39.validateMnemonic(phrase);

export function generateWalletSeed(secretWords: string, password: string): WalletSeed {
  const entropy = bip39.mnemonicToEntropy(secretWords);
  const seed: Uint8Array = Blake2b.blake2b_256(entropy);
  return encryptWalletSeed(seed, password);  
}

export function updateWalletSeedPassword(
  walletSeed: WalletSeed,
  oldPassword: string,
  newPassword: string
): WalletSeed {
  const seed = decryptSeed(walletSeed, oldPassword);
  return encryptWalletSeed(seed, newPassword);
}

export function getCryptoWalletFromSeed(
  walletSeed: WalletSeed,
  password: string
): CryptoWallet {
  const seed = decryptSeed(walletSeed, password);
  const seedAsArray = Object.values(seed);
  const wallet = Wallet.fromSeed(seedAsArray).result;
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
