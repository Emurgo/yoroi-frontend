// @flow

import { asGetPublicKey } from '../ada/lib/storage/models/PublicDeriver/traits';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { isCardanoHaskell } from '../ada/lib/storage/database/prepackaged/networks';
import { Bip44Wallet } from '../ada/lib/storage/models/Bip44Wallet/wrapper';
import { legacyWalletChecksum, walletChecksum } from '@emurgo/cip4-js';

/**
 * Make browser to download the specified blob of bytes as a file with the specified name
 * TODO: https://github.com/Emurgo/yoroi-frontend/issues/250
 */
export async function sendFileToUser(data: Blob, fileName: string): Promise<void> {
  const a = window.document.createElement('a');
  a.download = fileName;
  a.href = window.URL.createObjectURL(data);
  const body = document.body;
  if (body) {
    body.appendChild(a);
    a.click();
    body.removeChild(a);
  } else {
    throw Error('Cannot send file to user! No `document.body` available!');
  }
}

export async function getWalletChecksum(
  publicDeriver: ReturnType<typeof asGetPublicKey>,
): Promise<WalletChecksum> {
  if (publicDeriver == null) {
    throw new Error('getWalletChecksum gets unexpected null');
  }
  const hash = (await publicDeriver.getPublicKey()).Hash;

  const isLegacyWallet =
    isCardanoHaskell(publicDeriver.getParent().getNetworkInfo()) &&
    publicDeriver.getParent() instanceof Bip44Wallet;
  return isLegacyWallet
    ? legacyWalletChecksum(hash)
    : walletChecksum(hash);
}
