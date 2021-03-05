// @flow

import type { lf$Database } from 'lovefield';
import {
  Cip1852Wallet,
} from '../../../../../ada/lib/storage/models/Cip1852Wallet/wrapper';
import {
  PublicDeriver,
} from '../../../../../ada/lib/storage/models/PublicDeriver/index';
import {
  createStandardCip1852Wallet
} from '../walletBuilder/jormungandr';
import {
  setupBip44
} from '../../../../../ada/lib/storage/bridge/tests/common';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
} from '../../../../../../config/numbersConfig';
import {
  mnemonicToEntropy
} from 'bip39';
import type { WalletTypePurposeT } from '../../../../../../config/numbersConfig';
import { networks, } from '../../../../../ada/lib/storage/database/prepackaged/networks';
import type { NetworkRow } from '../../../../../ada/lib/storage/database/primitives/tables';
import { RustModule } from '../../../../../ada/lib/cardanoCrypto/rustLoader';

const privateDeriverPassword = 'greatest_password_ever';

export async function setup(
  db: lf$Database,
  walletMnemonic: string,
  purposeForTest: WalletTypePurposeT,
): Promise<PublicDeriver<>> {
  if (purposeForTest === WalletTypePurpose.BIP44) {
    return setupBip44(db, walletMnemonic, networks.JormungandrMainnet);
  }
  if (purposeForTest === WalletTypePurpose.CIP1852) {
    return setupCip1852(db, walletMnemonic, networks.JormungandrMainnet);
  }
  throw new Error('setup Unexpected purpose ' + purposeForTest);
}

async function setupCip1852(
  db: lf$Database,
  walletMnemonic: string,
  network: $ReadOnly<NetworkRow>,
): Promise<PublicDeriver<>> {
  await RustModule.load();

  const bip39entropy = mnemonicToEntropy(walletMnemonic);
  const EMPTY_PASSWORD = Buffer.from('');
  const rootPk = RustModule.WalletV3.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(bip39entropy, 'hex'),
    EMPTY_PASSWORD
  );
  const state = await createStandardCip1852Wallet({
    db,
    discrimination: RustModule.WalletV3.AddressDiscrimination.Production,
    rootPk,
    password: privateDeriverPassword,
    accountIndex: HARD_DERIVATION_START + 0,
    walletName: 'My Test Wallet',
    accountName: '',
    network,
  });

  const bipWallet = await Cip1852Wallet.createCip1852Wallet(
    db,
    state.cip1852WrapperRow,
  );

  const publicDeriver = await PublicDeriver.createPublicDeriver(
    state.publicDeriver[0].publicDeriverResult,
    bipWallet,
  );

  return publicDeriver;
}
