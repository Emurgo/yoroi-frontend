// @flow

import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { WalletAuthEntry } from '../../../chrome/extension/ergo-connector/types';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import blake2b from 'blake2b';
import { asGetSigningKey } from '../../api/ada/lib/storage/models/PublicDeriver/traits';

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

// return the hex string representation of the COSESign1
const cip8Sign = async (
  deriver: PublicDeriver<>,
  password: string,
  payload: Buffer,
): Promise<string> => {
  const withSigningKey = asGetSigningKey(deriver);
  if (!withSigningKey) {
    throw new Error(`[createAuthEntry] no signing key`);
  }
  const signingKeyFromStorage = await withSigningKey.getSigningKey();
  const normalizedKey = await withSigningKey.normalizeKey({
    ...signingKeyFromStorage,
    password,
  });
  const signingKey = RustModule.WalletV4.Bip32PrivateKey.from_bytes(
    Buffer.from(normalizedKey.prvKeyHex, 'hex')
  );
  const derivedSignKey = signingKey.derive(0).derive(0).to_raw_key();

  const protectedHeader = RustModule.MessageSigning.HeaderMap.new();
  const protectedSerialized = RustModule.MessageSigning.ProtectedHeaderMap.new(protectedHeader);
  const unprotected = RustModule.MessageSigning.HeaderMap.new();
  const headers = RustModule.MessageSigning.Headers.new(protectedSerialized, unprotected);
  const builder = RustModule.MessageSigning.COSESign1Builder.new(headers, payload, false);
  const toSign = builder.make_data_to_sign().to_bytes();
  const signedSigStruct = derivedSignKey.sign(toSign).to_bytes();
  const coseSign1 = builder.build(signedSigStruct);
  return Buffer.from(coseSign1.to_bytes()).toString('hex');
}

const cip8Verify = async (
  publicKey: RustModule.WalletV4.PublicKey,
  coseSign1Hex: string,
): Promise<boolean> => {
  const coseSign1 = RustModule.MessageSigning.COSESign1.from_bytes(
    Buffer.from(coseSign1Hex, 'hex')
  );
  const sigStructReconstructed = coseSign1.signed_data().to_bytes();
  const signature = RustModule.WalletV4.Ed25519Signature.from_bytes(coseSign1.signature());

  return publicKey.verify(sigStructReconstructed, signature);
}
