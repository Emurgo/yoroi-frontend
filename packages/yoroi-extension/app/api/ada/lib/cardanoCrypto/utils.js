// @flow

import { RustModule } from './rustLoader';
import type {
  Addressing,
} from '../storage/models/PublicDeriver/interfaces';
import { PublicDeriver } from '../storage/models/PublicDeriver';
import { generateWalletRootKey as cardanoGenerateWalletRootKey } from './cryptoWallet';
import { generateWalletRootKey as ergoGenerateWalletRootKey } from '../../../ergo/lib/crypto/wallet'
import { ChainDerivations, CoinTypes, WalletTypePurpose } from '../../../../config/numbersConfig';
import type { NetworkRow } from '../storage/database/primitives/tables'
import { isErgo } from '../storage/database/prepackaged/networks';
import { asPrivateKeyInstance, derivePath } from '../../../common/lib/crypto/keys/keyRepository';
import { asGetPublicKey } from '../storage/models/PublicDeriver/traits'

export function v4SecretToV2(
  v4Key: RustModule.WalletV4.Bip32PrivateKey,
): RustModule.WalletV2.PrivateKey {
  return RustModule.WalletV2.PrivateKey.from_hex(
    Buffer.from(v4Key.as_bytes()).toString('hex')
  );
}
export function v4PublicToV2(
  v4Key: RustModule.WalletV4.Bip32PublicKey,
): RustModule.WalletV2.PublicKey {
  return RustModule.WalletV2.PublicKey.from_hex(
    Buffer.from(v4Key.as_bytes()).toString('hex')
  );
}

export function derivePublicByAddressing(request: {|
  addressing: $PropertyType<Addressing, 'addressing'>,
  startingFrom: {|
    key: RustModule.WalletV4.Bip32PublicKey,
    level: number,
  |},
|}): RustModule.WalletV4.Bip32PublicKey {
  if (request.startingFrom.level + 1 < request.addressing.startLevel) {
    throw new Error(`${nameof(derivePublicByAddressing)} keyLevel < startLevel`);
  }
  let derivedKey = request.startingFrom.key;
  for (
    let i = request.startingFrom.level - request.addressing.startLevel + 1;
    i < request.addressing.path.length;
    i++
  ) {
    derivedKey = derivedKey.derive(
      request.addressing.path[i]
    );
  }
  return derivedKey;
}
export function derivePrivateByAddressing(request: {|
  addressing: $PropertyType<Addressing, 'addressing'>,
  startingFrom: {|
    key: RustModule.WalletV4.Bip32PrivateKey,
    level: number,
  |},
|}): RustModule.WalletV4.Bip32PrivateKey {
  if (request.startingFrom.level + 1 < request.addressing.startLevel) {
    throw new Error(`${nameof(derivePrivateByAddressing)} keyLevel < startLevel`);
  }
  let derivedKey = request.startingFrom.key;
  for (
    let i = request.startingFrom.level - request.addressing.startLevel + 1;
    i < request.addressing.path.length;
    i++
  ) {
    derivedKey = derivedKey.derive(
      request.addressing.path[i]
    );
  }
  return derivedKey;
}

export async function isWalletExist(
  publickDerivers: Array<PublicDeriver<>>,
  mode: 'bip44' | 'cip1852',
  recoveryPhrase: string,
  accountIndex: number,
  selectedNetwork: $ReadOnly<NetworkRow>
): Promise<PublicDeriver<> | void> {

  if ((mode !== 'bip44') && (mode !== 'cip1852')) {
    throw new Error(`${nameof(isWalletExist)} unknown restoration mode`);
  }
  let publicKey;
  if(isErgo(selectedNetwork)){
    const ergoWalletRootPK = ergoGenerateWalletRootKey(recoveryPhrase)
    const chainKey = derivePath(
      ergoWalletRootPK,
      [
        WalletTypePurpose.BIP44,
        CoinTypes.ERGO,
        accountIndex,
        ChainDerivations.EXTERNAL,
      ]
    )
    const privateKey = asPrivateKeyInstance(chainKey);
    if (!privateKey) {
      throw new Error(`${nameof(isWalletExist)} No private key found.`);
    }
    publicKey =privateKey.toPublic().toBuffer().toString('hex')
  } else {
    const rootPk = cardanoGenerateWalletRootKey(recoveryPhrase);
    const purpose = mode === 'cip1852' ? WalletTypePurpose.CIP1852 : WalletTypePurpose.BIP44
    const accountPublicKey = rootPk
    .derive(purpose)
    .derive(CoinTypes.CARDANO)
    .derive(accountIndex)
    .to_public();
    publicKey = Buffer.from(accountPublicKey.as_bytes()).toString('hex')
  }

  for (const deriver of publickDerivers) {
    const withPubKey = asGetPublicKey(deriver);
    if (withPubKey == null) return
    const existedPublicKey = await withPubKey.getPublicKey()
    const walletNetwork = deriver.getParent().getNetworkInfo()
    /**
     * We will still allow to restore the wallet on a different networks even they are
     * sharing the same recovery phrase but we are treating them differently
     */
    if (
      (publicKey === existedPublicKey.Hash) &&
      (walletNetwork.NetworkId === selectedNetwork.NetworkId)) return deriver
  }
}
