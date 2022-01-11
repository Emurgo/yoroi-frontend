// @flow

import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { WalletAuthEntry } from '../../../chrome/extension/ergo-connector/types';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import blake2b from 'blake2b';


export const createAuthEntry: ({|
  appAuthID: ?string,
  deriver: PublicDeriver<>,
  checksum: ?WalletChecksum,
|}) => Promise<?WalletAuthEntry> = async ({ appAuthID, deriver, checksum }) => {
  if (appAuthID == null) {
    return null;
  }
  if (checksum == null) {
    throw new Error(`[createAuthEntry] app auth is requested but wallet-checksum does not exist`)
  }
  // <TODO:AUTH> this is a temporary insecure dev stub using the deriver public key
  // $FlowFixMe[prop-missing]
  const walletPubKey = (await deriver.getPublicKey()).Hash;
  const appPubKey = RustModule.WalletV4.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(walletPubKey, 'hex'),
    Buffer.from(
      blake2b(64)
        .update(Buffer.from(appAuthID))
        .digest('binary'),
    ),
  ).to_raw_key().to_public();
  return {
    walletId: checksum.ImagePart,
    pubkey: Buffer.from(appPubKey.as_bytes()).toString('hex'),
  };
};

export const authSignHexPayload: ({|
  appAuthID: ?string,
  deriver: PublicDeriver<>,
  payloadHex: string,
|}) => Promise<string> = async ({ appAuthID, deriver, payloadHex }) => {
  if (appAuthID == null) {
    throw new Error(`[authSignHexPayload] app auth sign is requested but no auth is present in connection`)
  }
  // $FlowFixMe[prop-missing]
  const walletPubKey = (await deriver.getPublicKey()).Hash;
  const appPrivKey = RustModule.WalletV4.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(walletPubKey, 'hex'),
    Buffer.from(
      blake2b(64)
        .update(Buffer.from(appAuthID))
        .digest('binary'),
    ),
  ).to_raw_key();
  return appPrivKey.sign(Buffer.from(payloadHex, 'hex')).to_hex();
}