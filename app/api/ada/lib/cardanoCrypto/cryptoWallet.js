// @flow

import bip39 from 'bip39';

import { HdWallet, Wallet } from 'rust-cardano-crypto';
import { encryptWithPassword, decryptWithPassword } from '../../../../utils/passwordCipher';
import { getResultOrFail } from './cryptoUtils';

import type { ConfigType } from '../../../../../config/config-types';

declare var CONFIG : ConfigType;

const protocolMagic = CONFIG.network.protocolMagic;

export const generateAdaMnemonic = () => bip39.generateMnemonic(160).split(' ');

export const isValidAdaMnemonic = (
  phrase: string,
  numberOfWords: ?number = 15
) =>
  phrase.split(' ').length === numberOfWords && bip39.validateMnemonic(phrase);

export function generateWalletMasterKey(secretWords : string, password : string): string {
  const entropy = new Buffer(bip39.mnemonicToEntropy(secretWords), 'hex');
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

/* FIXME: Should be pass a encrypted mnemonic and also the password to decrypt it*/
export function getCryptoDaedalusWalletFromMnemonics(
  secretWords: string,
): CryptoDaedalusWallet {
  const wallet = getResultOrFail(Wallet.fromDaedalusMnemonic(secretWords));
  wallet.config.protocol_magic = protocolMagic;
  return wallet;
}
