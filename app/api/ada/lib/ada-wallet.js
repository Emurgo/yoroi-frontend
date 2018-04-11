import bip39 from 'bip39';
import { Buffer } from 'safe-buffer';
import bs58 from 'bs58';
import { HdWallet, Payload, Blake2b } from 'rust-cardano-crypto';
import type NewAdaWalletParams from '../ada-methods';
import type {
  AdaWallet,
  AdaWallets,
  AdaWalletInitData,
  AdaWalletRecoveryPhraseResponse
} from '../types';

export type PersistentWallet = {
  wallet: AdaWallet,
  mnemonic: []
};

export const generateAdaMnemonic = () => bip39.generateMnemonic(128).split(' ');

export const isValidAdaMnemonic = (
  phrase: string,
  numberOfWords: number = 12
) =>
  phrase.split(' ').length === numberOfWords && bip39.validateMnemonic(phrase);

export function toWallet(walletInitData: AdaWalletInitData): PersistentWallet {
  const wallet = {
    cwAccountsNumber: 1,
    cwAmount: {
      getCCoin: 0
    },
    cwHasPassphrase: true,
    cwId: '1111111111111111',
    cwMeta: {
      cwAssurance: walletInitData.cwAssurance,
      cwName: walletInitData.cwName,
      csUnit: walletInitData.cwUnit
    },
    cwPassphraseLU: new Date()
  };

  return {
    wallet,
    mnemonic: walletInitData.cwBackupPhrase.bpToList
  };
}

export function generateAccount(secretWords) {
  const DERIVATION_PATH = [0, 1];

  const entropy = bip39.mnemonicToEntropy(secretWords);
  const seed = Blake2b.blake2b_256(entropy);

  const prv = HdWallet.fromSeed(seed);
  const d1 = HdWallet.derivePrivate(prv, DERIVATION_PATH[0]);
  const d2 = HdWallet.derivePrivate(d1, DERIVATION_PATH[1]);
  const d2Pub = HdWallet.toPublic(d2);

  const xpub = HdWallet.toPublic(prv);
  const hdpKey = Payload.initialise(xpub);
  const derivationPath = Payload.encrypt_derivation_path(
    hdpKey,
    new Uint32Array(DERIVATION_PATH)
  );
  const address = HdWallet.publicKeyToAddress(d2Pub, derivationPath);
  return {
    xprv: d2,
    address: bs58.encode(address)
  };
}
