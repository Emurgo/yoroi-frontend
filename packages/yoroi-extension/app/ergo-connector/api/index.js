// @flow

import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { WalletAuthEntry } from '../../../chrome/extension/ergo-connector/types';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { asGetSigningKey } from '../../api/ada/lib/storage/models/PublicDeriver/traits';

export const createAuthEntry: ({|
  appAuthID: ?string,
  deriver: PublicDeriver<>,
  checksum: ?WalletChecksum,
  password: string,
|}) => Promise<?WalletAuthEntry> = async ({ appAuthID, deriver, checksum, password }) => {
  if (appAuthID == null) {
    return null;
  }
  if (checksum == null) {
    throw new Error(`[createAuthEntry] app auth is requested but wallet-checksum does not exist`)
  }
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
  const stakingKey = signingKey.derive(2).derive(0).to_raw_key();

  const address = RustModule.WalletV4.BaseAddress.new(
    deriver.getParent().networkInfo.NetworkId,
    RustModule.WalletV4.StakeCredential.from_keyhash(
      derivedSignKey.to_public().hash()
    ),
    RustModule.WalletV4.StakeCredential.from_keyhash(
      stakingKey.to_public().hash()
    )
  ).to_address();
  const entropy = await cip8Sign(
    Buffer.from(address.to_bytes()),
    derivedSignKey,
    Buffer.from(`DAPP_LOGIN: ${appAuthID}`, 'utf8'),
  );

  const appPrivKey = RustModule.WalletV4.Bip32PrivateKey.from_bip39_entropy(
    entropy,
    Buffer.from(''),
  ).to_raw_key();
  const appPubKey = appPrivKey.to_public();

  return {
    walletId: checksum.ImagePart,
    pubkey: Buffer.from(appPubKey.as_bytes()).toString('hex'),
    privkey: Buffer.from(appPrivKey.as_bytes()).toString('hex'),
  };
};

export const authSignHexPayload: ({|
  privKey: string,
  payloadHex: string,
|}) => Promise<string> = async ({ privKey, payloadHex }) => {
  const appPrivKey = RustModule.WalletV4.PrivateKey.from_extended_bytes(
    Buffer.from(privKey, 'hex')
  );
  return appPrivKey.sign(Buffer.from(payloadHex, 'hex')).to_hex();
}

// return the hex string representation of the COSESign1
const cip8Sign = async (
  address: Buffer,
  signKey: RustModule.WalletV4.PrivateKey,
  payload: Buffer,
): Promise<Buffer> => {
  const protectedHeader = RustModule.MessageSigning.HeaderMap.new();
  protectedHeader.set_algorithm_id(
    RustModule.MessageSigning.Label.from_algorithm_id(
      RustModule.MessageSigning.AlgorithmId.EdDSA
    )
  );
  protectedHeader.set_header(
    RustModule.MessageSigning.Label.new_text('address'),
    RustModule.MessageSigning.CBORValue.new_bytes(address)
  );
  const protectedSerialized = RustModule.MessageSigning.ProtectedHeaderMap.new(protectedHeader);
  const unprotected = RustModule.MessageSigning.HeaderMap.new();
  const headers = RustModule.MessageSigning.Headers.new(protectedSerialized, unprotected);
  const builder = RustModule.MessageSigning.COSESign1Builder.new(headers, payload, false);
  const toSign = builder.make_data_to_sign().to_bytes();
  const signedSigStruct = signKey.sign(toSign).to_bytes();
  const coseSign1 = builder.build(signedSigStruct);
  return Buffer.from(coseSign1.signature());
}
