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
import { networks, getCardanoHaskellStaticConfig } from '../../database/prepackaged/networks';

const privateDeriverPassword = 'greatest_password_ever';

export async function setup(
  db: lf$Database,
  walletMnemonic: string,
  purposeForTest: WalletTypePurposeT,
): Promise<PublicDeriver<>> {
  if (purposeForTest === WalletTypePurpose.BIP44) {
    return setupBip44(db, walletMnemonic);
  }
  throw new Error(`${nameof(setup)} Unexpected purpose ` + purposeForTest);
}

export async function setupBip44(
  db: lf$Database,
  walletMnemonic: string,
): Promise<PublicDeriver<>> {
  await RustModule.load();

  const staticConfigs = getCardanoHaskellStaticConfig(networks.ByronMainnet);
  if (staticConfigs == null) throw new Error('Should never happen');
  const settings = RustModule.WalletV2.BlockchainSettings.from_json({
    protocol_magic: staticConfigs.ByronNetworkId,
  });
  const entropy = RustModule.WalletV2.Entropy.from_english_mnemonics(walletMnemonic);
  const rootPk = RustModule.WalletV2.Bip44RootPrivateKey.recover(entropy, '');

  const state = await createStandardBip44Wallet({
    db,
    settings,
    rootPk,
    password: privateDeriverPassword,
    accountIndex: HARD_DERIVATION_START + 0,
    walletName: 'My Test Wallet',
    accountName: '',
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
