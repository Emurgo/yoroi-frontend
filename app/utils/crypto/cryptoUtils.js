import { HdWallet, Payload, Blake2b } from 'rust-cardano-crypto';
import { Buffer } from 'safe-buffer';
import bs58 from 'bs58';
import { mnemonicToSeedImpl } from './BIP39';

const DERIVATION_PATH = [0, 1, 2];

export const generateWallet = function (secretWords) {
  const seed = mnemonicToSeedImpl(secretWords);

  const prv = HdWallet.fromSeed(seed);
  const d1 = HdWallet.derivePrivate(prv, DERIVATION_PATH[0]);
  const d2 = HdWallet.derivePrivate(d1, DERIVATION_PATH[1]);

  const xpub = HdWallet.toPublic(prv);
  const hdpKey = Payload.initialise(xpub);
  const derivationPath = Payload.encrypt_derivation_path(
    hdpKey,
    new Uint32Array(DERIVATION_PATH)
  );
  const address = HdWallet.publicKeyToAddress(xpub, hdpKey, derivationPath);
  return {
    xprv: d2,
    address: bs58.encode(address)
  };
};

export const derivePublic = HdWallet.toPublic;

export const signTransaction = function (encodedTransaction, xprv) {
  const hashed = Blake2b.blake2b_256(encodedTransaction);
  return HdWallet.sign(hashed, xprv);
};

export const toPublicHex = function (address) {
  const pkHex = Buffer.from(address).toString('hex');
  return `0x${pkHex}`;
};
