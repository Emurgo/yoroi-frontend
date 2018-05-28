// @flow

import bip39 from 'bip39';
import { Blake2b, Wallet } from 'cardano-crypto';
import {
  encryptWithPassword,
  decryptWithPassword
} from '../../../utils/crypto/cryptoUtils';
import {
  blockchainNetworkConfig,
  NETWORK_MODE,
} from '../../../config/blockchainNetworkConfig';

export type WalletSeed = {
  seed: string | Uint8Array; // Encrypted seed or Plain seed array
};

export const generateAdaMnemonic = () => bip39.generateMnemonic(128).split(' ');

export const isValidAdaMnemonic = (
  phrase: string,
  numberOfWords: number = 12
) =>
  phrase.split(' ').length === numberOfWords && bip39.validateMnemonic(phrase);

export function generateWalletSeed(secretWords: string, password: ?string): WalletSeed {
  const entropy = bip39.mnemonicToEntropy(secretWords);
  const seed: Uint8Array = Blake2b.blake2b_256(entropy);
  return {
    seed: password ? encryptWithPassword(password, seed) : seed
  };
}

/* @note: Crypto wallet is the abstraction provide for JS-wasm-cardano module */
export function getCryptoWalletFromSeed(walletSeed: WalletSeed, password: ?string) {
  const seed = password ? decryptWithPassword(password, walletSeed.seed) : walletSeed.seed;
  const seedAsArray = Object.values(seed);
  const wallet = Wallet.fromSeed(seedAsArray).result;
  wallet.config.protocol_magic = blockchainNetworkConfig[NETWORK_MODE].PROTOCOL_MAGIC;
  return wallet;
}
