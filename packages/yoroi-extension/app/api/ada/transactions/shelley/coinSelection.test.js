// @flow

import * as CoinSelection from './coinSelection'
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

const POLICY_ID_1 = 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26';

beforeAll(async () => {
  await RustModule.load();
});

describe('describeUtxos', () => {

  const utxos = [{
    utxo_id: 'abcd0',
    tx_hash: 'abcd',
    tx_index: 0,
    receiver: 'addr1abcd',
    amount: '1000000',
    assets: [],
  }, {
    utxo_id: 'abcd1',
    tx_hash: 'abcd',
    tx_index: 1,
    receiver: 'addr1abcd',
    amount: '2000000',
    assets: [{
      amount: '42',
      assetId: `${POLICY_ID_1}.abcd1`,
      policyId: POLICY_ID_1,
      name: 'abcd1',
    }],
  }, {
    utxo_id: 'abcd2',
    tx_hash: 'abcd',
    tx_index: 2,
    receiver: 'addr1abcd',
    amount: '3000000',
    assets: [{
      amount: '43',
      assetId: `${POLICY_ID_1}.abcd2`,
      policyId: POLICY_ID_1,
      name: 'abcd2',
    }, {
      amount: '44',
      assetId: `${POLICY_ID_1}.abcd3`,
      policyId: POLICY_ID_1,
      name: 'abcd3',
    }],
  }]

  it('when no required assets ', () => {
    const coinsPerUtxoWord: RustModule.WalletV4.BigNum
      = RustModule.WalletV4.BigNum.from_str('500');
    const descriptors = CoinSelection
      .describeUtxos(utxos, new Set(), coinsPerUtxoWord);
    expect(descriptors).toEqual([{
      utxo: utxos[0],
      isPure: true,
      hasRequiredAssets: false,
      countExtraAssets: 0,
      spendableValue: 1000000,
      isCollateralReserve: true,
    }, {
      utxo: utxos[1],
      isPure: false,
      hasRequiredAssets: false,
      countExtraAssets: 1,
      spendableValue: 1000000,
    }, {
      utxo: utxos[2],
      isPure: false,
      hasRequiredAssets: false,
      countExtraAssets: 2,
      spendableValue: 2000000,
    }])
  });

  it('when requiring one asset', () => {
    const coinsPerUtxoWord: RustModule.WalletV4.BigNum
      = RustModule.WalletV4.BigNum.from_str('500');
    const descriptors = CoinSelection
      .describeUtxos(utxos, new Set([`${POLICY_ID_1}.abcd1`]), coinsPerUtxoWord);
    expect(descriptors).toEqual([{
      utxo: utxos[0],
      isPure: true,
      hasRequiredAssets: false,
      countExtraAssets: 0,
      spendableValue: 1000000,
      isCollateralReserve: true,
    }, {
      utxo: utxos[1],
      isPure: false,
      hasRequiredAssets: true,
      countExtraAssets: 0,
      spendableValue: 1000000,
    }, {
      utxo: utxos[2],
      isPure: false,
      hasRequiredAssets: false,
      countExtraAssets: 2,
      spendableValue: 2000000,
    }])
  });

  it('when requiring multiple assets', () => {
    const coinsPerUtxoWord: RustModule.WalletV4.BigNum
      = RustModule.WalletV4.BigNum.from_str('500');
    const descriptors = CoinSelection
      .describeUtxos(utxos, new Set([
        `${POLICY_ID_1}.abcd1`,
        `${POLICY_ID_1}.abcd2`,
        `${POLICY_ID_1}.abcd9999`, // non-existing
      ]), coinsPerUtxoWord);
    expect(descriptors).toEqual([{
      utxo: utxos[0],
      isPure: true,
      hasRequiredAssets: false,
      countExtraAssets: 0,
      spendableValue: 1000000,
      isCollateralReserve: true,
    }, {
      utxo: utxos[1],
      isPure: false,
      hasRequiredAssets: true,
      countExtraAssets: 0,
      spendableValue: 1000000,
    }, {
      utxo: utxos[2],
      isPure: false,
      hasRequiredAssets: true,
      countExtraAssets: 1,
      spendableValue: 2000000,
    }])
  });
});