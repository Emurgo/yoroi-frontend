// @flow

import type { lf$Database } from 'lovefield';
import {
  Bip44Wallet,
} from '../../models/Bip44Wallet/wrapper';
import {
  PublicDeriver,
} from '../../models/PublicDeriver/index';
import {
  createStandardBip44Wallet,
} from '../walletBuilder/byron';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
} from '../../../../../../config/numbersConfig';
import type { WalletTypePurposeT } from '../../../../../../config/numbersConfig';

import { RustModule } from '../../../cardanoCrypto/rustLoader';
import { networks } from '../../database/prepackaged/networks';
import type { NetworkRow } from '../../database/primitives/tables';

const privateDeriverPassword = 'greatest_password_ever';

// <TODO:PENDING_REMOVAL> bip44
export async function setup(
  db: lf$Database,
  walletMnemonic: string,
  purposeForTest: WalletTypePurposeT,
): Promise<PublicDeriver<>> {
  if (purposeForTest === WalletTypePurpose.BIP44) {
    return setupBip44(db, walletMnemonic, networks.CardanoMainnet);
  }
  throw new Error(`${nameof(setup)} Unexpected purpose ` + purposeForTest);
}

// <TODO:PENDING_REMOVAL> bip44
export async function setupBip44(
  db: lf$Database,
  walletMnemonic: string,
  network: $ReadOnly<NetworkRow>,
): Promise<PublicDeriver<>> {
  await RustModule.load();

  const entropy = RustModule.WalletV2.Entropy.from_english_mnemonics(walletMnemonic);
  const rootPk = RustModule.WalletV2.Bip44RootPrivateKey.recover(entropy, '');

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
