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
import stableStringify from 'json-stable-stringify';
import {
  mnemonicToEntropy
} from 'bip39';

import { RustModule } from '../../../cardanoCrypto/rustLoader';
import { networks } from '../../database/prepackaged/networks';

export const TX_TEST_MNEMONIC_1 = 'prevent company field green slot measure chief hero apple task eagle sunset endorse dress seed';
export const ABANDON_SHARE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon share';

const privateDeriverPassword = 'greatest_password_ever';

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
    protocol_magic: Number.parseInt(networks.ByronMainnet.NetworkMagic, 10),
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
  );

  const publicDeriver = await PublicDeriver.createPublicDeriver(
    state.publicDeriver[0].publicDeriverResult,
    bipWallet,
  );

  return publicDeriver;
}

export function mockDate(): void {
  const time = [0];
  // $FlowExpectedError[cannot-write] flow doesn't like that we override built-in functions.
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

/**
 * We want to compare the test result with a snapshot of the database
 * However, the diff is too big to reasonably compare with your eyes
 * Therefore, we test each table separately
 */
export function compareObject(
  obj1: { tables: any, ... },
  obj2: { tables: any, ... },
  filter: Set<string> = new Set(),
): void {
  const obj1FilteredKeys = Object.keys(obj1).filter(key => filter.has(key));
  const obj2FilteredKeys = Object.keys(obj2).filter(key => filter.has(key));
  for (const prop of obj1FilteredKeys) {
    if (obj1[prop] !== undefined && obj2[prop] === undefined) {
      expect(stableStringify(obj1)).toEqual(stableStringify(obj2));
    }
  }
  for (const prop of obj2FilteredKeys) {
    if (obj2[prop] !== undefined && obj1[prop] === undefined) {
      expect(stableStringify(obj1)).toEqual(stableStringify(obj2));
    }
  }

  const obj2KeySet = new Set(obj2FilteredKeys);
  const keysInBoth = obj1FilteredKeys.filter(key => obj2KeySet.has(key));
  for (const key of keysInBoth) {
    if (key === 'tables') {
      compareObject(obj1[key], obj2[key]);
    } else {
      expect(stableStringify(obj1[key])).toEqual(stableStringify(obj2[key]));
    }
  }
}
