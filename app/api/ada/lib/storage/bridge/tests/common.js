// @flow

import type { lf$Database } from 'lovefield';
import {
  Bip44Wallet,
} from '../../models/Bip44Wallet';
import {
  PublicDeriver,
} from '../../models/PublicDeriver/index';
import {
  createStandardBip44Wallet,
} from '../walletHelper';
import {
  HARD_DERIVATION_START,
} from '../../../../../../config/numbersConfig';

import { RustModule } from '../../../cardanoCrypto/rustLoader';

const mnemonic = 'prevent company field green slot measure chief hero apple task eagle sunset endorse dress seed';

const privateDeriverPassword = 'greatest_password_ever';

const protocolMagic = 1097911063; // testnet

export async function setup(
  db: lf$Database,
  walletMnemonic: string = mnemonic,
): Promise<PublicDeriver> {
  await RustModule.load();

  const settings = RustModule.Wallet.BlockchainSettings.from_json({
    protocol_magic: protocolMagic
  });
  const entropy = RustModule.Wallet.Entropy.from_english_mnemonics(walletMnemonic);
  const rootPk = RustModule.Wallet.Bip44RootPrivateKey.recover(entropy, '');

  const firstAccountIndex = 0 + HARD_DERIVATION_START;
  const firstAccountPk = rootPk.bip44_account(
    RustModule.Wallet.AccountIndex.new(firstAccountIndex)
  );

  const state = await createStandardBip44Wallet({
    db,
    settings,
    rootPk,
    password: privateDeriverPassword,
    accountPublicKey: firstAccountPk.public(),
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
  // const toPrint = [];
  // for (let i = 0; i < 60; i++) {
  //   const chain = firstAccountPk.bip44_chain(false);
  //   const addressPk = chain.address_key(RustModule.Wallet.AddressKeyIndex.new(i));
  //   const address = addressPk.public().bootstrap_era_address(settings).to_base58();
  //   toPrint.push(address);
  // }
  // console.log(toPrint);

  return publicDeriver;
}

export function mockDate() {
  const time = [0];
  // $FlowFixMe flow doesn't like that we override built-in functions.
  Date.now = jest.spyOn(Date, 'now').mockImplementation(() => time[0]++);
}

export function filterDbSnapshot(
  dump: any,
  keys: Array<string>
) {
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
