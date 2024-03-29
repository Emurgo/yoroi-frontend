// @flow

import { RustModule } from './rustLoader';
import { PublicDeriver } from '../storage/models/PublicDeriver';
import { generateWalletRootKey as cardanoGenerateWalletRootKey } from './cryptoWallet';
import { CoinTypes, WalletTypePurpose } from '../../../../config/numbersConfig';
import type { NetworkRow } from '../storage/database/primitives/tables';
import { asGetPublicKey } from '../storage/models/PublicDeriver/traits';

export function v4PublicToV2(
  v4Key: RustModule.WalletV4.Bip32PublicKey
): RustModule.WalletV2.PublicKey {
  return RustModule.WalletV2.PublicKey.from_hex(Buffer.from(v4Key.as_bytes()).toString('hex'));
}

export async function isWalletExist(
  publicDerivers: Array<PublicDeriver<>>,
  recoveryPhrase: string,
  accountIndex: number,
  selectedNetwork: $ReadOnly<NetworkRow>
): Promise<PublicDeriver<> | void> {
  const rootPk = cardanoGenerateWalletRootKey(recoveryPhrase);
  const accountPublicKey = rootPk
    .derive(WalletTypePurpose.CIP1852)
    .derive(CoinTypes.CARDANO)
    .derive(accountIndex)
    .to_public();
  const publicKey = Buffer.from(accountPublicKey.as_bytes()).toString('hex');

  for (const deriver of publicDerivers) {
    const withPubKey = asGetPublicKey(deriver);
    if (withPubKey == null) return;
    const existedPublicKey = await withPubKey.getPublicKey();
    const walletNetwork = deriver.getParent().getNetworkInfo();
    /**
     * We will still allow to restore the wallet on a different networks even they are
     * sharing the same recovery phrase but we are treating them differently
     */
    if (
      publicKey === existedPublicKey.Hash &&
      walletNetwork.NetworkId === selectedNetwork.NetworkId
    )
      return deriver;
  }
}
