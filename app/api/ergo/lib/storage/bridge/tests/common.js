// @flow

import type { lf$Database } from 'lovefield';
import {
  Bip44Wallet,
} from '../../../../../ada/lib/storage/models/Bip44Wallet/wrapper';
import {
  PublicDeriver,
} from '../../../../../ada/lib/storage/models/PublicDeriver/index';
import { createStandardBip44Wallet } from '../../../walletBuilder/builder';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
} from '../../../../../../config/numbersConfig';
import type { WalletTypePurposeT } from '../../../../../../config/numbersConfig';
import { RustModule } from '../../../../../ada/lib/cardanoCrypto/rustLoader';
import { networks } from '../../../../../ada/lib/storage/database/prepackaged/networks';
import type { NetworkRow } from '../../../../../ada/lib/storage/database/primitives/tables';
import { generateWalletRootKey } from '../../../crypto/wallet';

const privateDeriverPassword = 'greatest_password_ever';

export async function setup(
  db: lf$Database,
  walletMnemonic: string,
  purposeForTest: WalletTypePurposeT,
): Promise<PublicDeriver<>> {
  if (purposeForTest === WalletTypePurpose.BIP44) {
    return setupBip44(db, walletMnemonic, networks.ErgoMainnet);
  }
  throw new Error(`${nameof(setup)} Unexpected purpose ` + purposeForTest);
}

export async function setupBip44(
  db: lf$Database,
  walletMnemonic: string,
  network: $ReadOnly<NetworkRow>,
): Promise<PublicDeriver<>> {
  await RustModule.load();
  const rootPk = generateWalletRootKey(walletMnemonic);

  const state = await createStandardBip44Wallet({
    db,
    rootPk,
    password: privateDeriverPassword,
    accountIndex: HARD_DERIVATION_START + 0,
    walletName: 'My Test Wallet',
    accountName: '',
    network
  });

  const bipWallet = await Bip44Wallet.createBip44Wallet(
    db,
    state.bip44WrapperRow,
  );

  const publicDeriver = await PublicDeriver.createPublicDeriver(
    state.publicDeriver[0].publicDeriverResult,
    bipWallet,
  );

  return publicDeriver;
}
