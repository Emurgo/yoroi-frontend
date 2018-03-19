import { HdWallet } from 'rust-cardano-crypto';
import { Buffer } from 'safe-buffer';
import { mnemonicToSeedImpl } from './BIP39';

export const generateWallet = function (secretWords) {
  const seed = mnemonicToSeedImpl(secretWords);
  // We need to derive twice a hardened wallet before using a
  // non-hardned
  const xprv = HdWallet.fromSeed(seed);
  const d1 = HdWallet.derivePrivate(xprv, 0);
  return HdWallet.derivePrivate(d1, 1);
};

export const toPublicHex = function (wallet) {
  const pk = HdWallet.toPublic(wallet);
  const pkHex = Buffer.from(pk).toString('hex');
  return `0x${pkHex}`;
};
