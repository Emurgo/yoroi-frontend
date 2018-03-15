// Reference taken from: https://github.com/input-output-hk/rust-cardano-crypto/blob/5957bc489c6ddc02431ba400add952f3e29a12b2/js-example/src/Components/Bindings/BIP39.js

import bip39 from 'bip39';
import { Buffer } from 'safe-buffer';
import { Blake2b } from 'rust-cardano-crypto';

export const validateMnemonic = bip39.validateMnemonic;

export const generateMnemonicImpl = function () {
  return bip39.generateMnemonic(128);
};

export const mnemonicToSeedImpl = function (m) {
  try {
    const e = bip39.mnemonicToEntropy(m);
    return Blake2b.blake2b_256(e);
  } catch (e) {
    console.error('BIP39 mnemonicToSeed error:', e);
    return null;
  }
};

export const mnemonicToEntropyImpl = function (m) {
  try {
    return Buffer.from(bip39.mnemonicToEntropy(m), 'hex');
  } catch (e) {
    console.error('BIP39 mnemonicToSeed error:', e);
    return null;
  }
};

export const entropyToMnemonicImpl = function (ent) {
  try {
    return bip39.entropyToMnemonic(ent);
  } catch (e) {
    console.error('BIP39 mnemonicToSeed error:', e);
    return null;
  }
};

function base16(u8) {
  let b16 = '';
  function pad2(str) {
    return (str.length < 2) ? '0' + str : str;
  }
  for (let x = 0; x < u8.length; x++) {
    b16 += pad2(u8[x].toString(16));
  }
  return b16;
}
export const seedToBase64Impl = function (seed) {
  try {
    return base16(seed);
  } catch (e) {
    console.error('BIP39 seedToHexImpl error:', e);
    return '';
  }
};
