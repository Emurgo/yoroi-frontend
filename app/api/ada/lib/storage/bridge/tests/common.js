// @flow

import type { lf$Database } from 'lovefield';
import {
  Bip44Wallet,
} from '../../models/Bip44Wallet/wrapper';
import {
  Cip1852Wallet,
} from '../../models/Cip1852Wallet/wrapper';
import {
  PublicDeriver,
} from '../../models/PublicDeriver/index';
import {
  createStandardBip44Wallet,
} from '../walletBuilder/byron';
import {
  createStandardCip1852Wallet
} from '../walletBuilder/shelley';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
} from '../../../../../../config/numbersConfig';
import type { WalletTypePurposeT } from '../../../../../../config/numbersConfig';
import {
  mnemonicToEntropy
} from 'bip39';


import { RustModule } from '../../../cardanoCrypto/rustLoader';

export const TX_TEST_MNEMONIC_1 = 'prevent company field green slot measure chief hero apple task eagle sunset endorse dress seed';
export const ABANDON_SHARE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon share';

const privateDeriverPassword = 'greatest_password_ever';

const protocolMagic = 764824073; // mainnet

export async function setup(
  db: lf$Database,
  walletMnemonic: string,
  purposeForTest: WalletTypePurposeT,
): Promise<PublicDeriver<>> {
  if (purposeForTest === WalletTypePurpose.BIP44) {
    return setupBip44(db, walletMnemonic);
  }
  if (purposeForTest === WalletTypePurpose.CIP1852) {
    return setupCip1852(db, walletMnemonic);
  }
  throw new Error('setup Unexpected purpose ' + purposeForTest);
}

async function setupBip44(
  db: lf$Database,
  walletMnemonic: string,
): Promise<PublicDeriver<>> {
  await RustModule.load();

  const settings = RustModule.WalletV2.BlockchainSettings.from_json({
    protocol_magic: protocolMagic
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
    protocolMagic,
  );

  const publicDeriver = await PublicDeriver.createPublicDeriver(
    state.publicDeriver[0].publicDeriverResult,
    bipWallet,
  );

  return publicDeriver;
}
async function setupCip1852(
  db: lf$Database,
  walletMnemonic: string,
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
  });

  const bipWallet = await Cip1852Wallet.createCip1852Wallet(
    db,
    state.cip1852WrapperRow,
    protocolMagic,
  );

  const publicDeriver = await PublicDeriver.createPublicDeriver(
    state.publicDeriver[0].publicDeriverResult,
    bipWallet,
  );

  return publicDeriver;
}

export function getAddressString(
  mnemonic: string,
  path: Array<number>,
): string {
  const bip39entropy = mnemonicToEntropy(mnemonic);
  const EMPTY_PASSWORD = Buffer.from('');
  const rootKey = RustModule.WalletV3.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(bip39entropy, 'hex'),
    EMPTY_PASSWORD
  );
  let currKey = rootKey;
  for (let i = 0; i < path.length; i++) {
    currKey = currKey.derive(path[i]);
  }
  if (path[0] === WalletTypePurpose.BIP44) {
    const v2Key = RustModule.WalletV2.PublicKey.from_hex(
      Buffer.from(currKey.to_public().as_bytes()).toString('hex')
    );
    const settings = RustModule.WalletV2.BlockchainSettings.from_json({
      protocol_magic: protocolMagic
    });
    const addr = v2Key.bootstrap_era_address(settings);
    const hex = addr.to_base58();
    return hex;
  }
  if (path[0] === WalletTypePurpose.CIP1852) {
    const addr = RustModule.WalletV3.Address.single_from_public_key(
      currKey.to_public().to_raw_key(),
      RustModule.WalletV3.AddressDiscrimination.Production,
    );
    return Buffer.from(addr.as_bytes()).toString('hex');
  }
  throw new Error('Unexpected purpose');
}

export function mockDate(): void {
  const time = [0];
  // $FlowFixMe flow doesn't like that we override built-in functions.
  Date.now = jest.spyOn(Date, 'now').mockImplementation(() => time[0]++);
}

export function filterDbSnapshot(
  dump: any,
  keys: Array<string>
): void {
  // 1) test all keys we care about are present
  keys.sort();

  const keySet = new Set(keys);
  const keysMatched = Object.keys(dump).filter(key => keySet.has(key));
  keysMatched.sort();

  expect(keysMatched).toEqual(keys);

  // 2) compare content of keys to snapshot
  const filteredDump = keys.map(filterKey => ({
    [filterKey]: dump[filterKey]
  }));

  expect(filteredDump).toMatchSnapshot();
}
