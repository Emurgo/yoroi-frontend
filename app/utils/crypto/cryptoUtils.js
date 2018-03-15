import { HdWallet } from 'rust-cardano-crypto';
import { Buffer } from 'safe-buffer';
import { mnemonicToSeedImpl } from './BIP39';

export const generateWallet = function (secretWords) {
  const seed = mnemonicToSeedImpl(secretWords);
  return HdWallet.fromSeed(seed);
};

export const toPublicHex = function (wallet) {
  const pk = HdWallet.toPublic(wallet);
  const pkHex = Buffer.from(pk).toString('hex');
  return `0x${pkHex}`;
};
