// @flow

import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { WalletAuthEntry } from '../../../chrome/extension/connector/types';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { asGetSigningKey } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { cip8Sign } from '../../api/ada';
import { bytesToHex, hexToBytes, utfToBytes } from '../../coreUtils';


type CreateAuthEntryParams = {|
  appAuthID: ?string,
  deriver: PublicDeriver<>,
  checksum: ?WalletChecksum,
  password: string,
|};

export const createAuthEntry: CreateAuthEntryParams => Promise<?WalletAuthEntry>
  = async (params) => {
    return RustModule.WasmScope(Scope => _createAuthEntry(Scope, params));
  };

export const _createAuthEntry: (
    WasmScope: typeof RustModule,
    params: CreateAuthEntryParams
  ) => Promise<?WalletAuthEntry> = async (
      WasmScope,
      { appAuthID, deriver, checksum, password }
    ) => {
      if (appAuthID == null) return null;
      if (checksum == null) throw new Error(`[createAuthEntry] app auth is requested but wallet-checksum does not exist`)

      const withSigningKey = asGetSigningKey(deriver);
      if (!withSigningKey) throw new Error(`[createAuthEntry] no signing key`);

      const signingKeyFromStorage = await withSigningKey.getSigningKey();
      const normalizedKey = await withSigningKey.normalizeKey({
        ...signingKeyFromStorage,
        password,
      });
      const signingKey = WasmScope.WalletV4.Bip32PrivateKey.from_hex(normalizedKey.prvKeyHex);
      const derivedSignKey = signingKey.derive(0).derive(0).to_raw_key();
      const stakingKey = signingKey.derive(2).derive(0).to_raw_key();

      const address = WasmScope.WalletV4.BaseAddress.new(
        deriver.getParent().networkInfo.NetworkId,
        WasmScope.WalletV4.Credential.from_keyhash(
          derivedSignKey.to_public().hash()
        ),
        WasmScope.WalletV4.Credential.from_keyhash(
          stakingKey.to_public().hash()
        )
      ).to_address();
      const entropy = (await cip8Sign(
        Buffer.from(address.to_bytes()),
        derivedSignKey,
        utfToBytes(`DAPP_LOGIN: ${appAuthID}`),
      )).signature();

      const appPrivKey = WasmScope.WalletV4.Bip32PrivateKey.from_bip39_entropy(
        entropy,
        Buffer.from(''),
      ).to_raw_key();
      const appPubKey = appPrivKey.to_public();

      return {
        walletId: checksum.ImagePart,
        pubkey: bytesToHex(appPubKey.as_bytes()),
        privkey: bytesToHex(appPrivKey.as_bytes()),
      };
    };

export const authSignHexPayload: ({|
  privKey: string,
  payloadHex: string,
|}) => Promise<string> = async ({ privKey, payloadHex }) => {
  const appPrivKey = RustModule.WalletV4.PrivateKey.from_extended_bytes(hexToBytes(privKey));
  return appPrivKey.sign(hexToBytes(payloadHex)).to_hex();
}
