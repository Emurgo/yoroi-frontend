// @flow

import * as CoinSelection from './coinSelection'
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

const POLICY_ID_1 = 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26';

beforeAll(async () => {
  await RustModule.load();
});

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
  amount: '3500000',
  assets: [],
}, {
  utxo_id: 'abcd2',
  tx_hash: 'abcd',
  tx_index: 2,
  receiver: 'addr1abcd',
  amount: '2000000',
  assets: [{
    amount: '42',
    assetId: `${POLICY_ID_1}.abcd1`,
    policyId: POLICY_ID_1,
    name: 'abcd1',
  }],
}, {
  utxo_id: 'abcd3',
  tx_hash: 'abcd',
  tx_index: 3,
  receiver: 'addr1abcd',
  amount: '5000000',
  assets: [{
    amount: '52',
    assetId: `${POLICY_ID_1}.abcd1`,
    policyId: POLICY_ID_1,
    name: 'abcd1',
  }, {
    amount: '53',
    assetId: `${POLICY_ID_1}.abcd2`,
    policyId: POLICY_ID_1,
    name: 'abcd2',
  }, {
    amount: '54',
    assetId: `${POLICY_ID_1}.abcd3`,
    policyId: POLICY_ID_1,
    name: 'abcd3',
  }],
}];

describe('describeUtxos', () => {

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
      isPure: true,
      hasRequiredAssets: false,
      countExtraAssets: 0,
      spendableValue: 3500000,
      isCollateralReserve: false,
    }, {
      utxo: utxos[2],
      isPure: false,
      hasRequiredAssets: false,
      countExtraAssets: 1,
      spendableValue: 1000000,
      isCollateralReserve: false,
    }, {
      utxo: utxos[3],
      isPure: false,
      hasRequiredAssets: false,
      countExtraAssets: 3,
      spendableValue: 4000000,
      isCollateralReserve: false,
    }])
  });

  it('when requiring one asset available in one utxo', () => {
    const coinsPerUtxoWord: RustModule.WalletV4.BigNum
      = RustModule.WalletV4.BigNum.from_str('500');
    const descriptors = CoinSelection
      .describeUtxos(utxos, new Set([`${POLICY_ID_1}.abcd2`]), coinsPerUtxoWord);
    expect(descriptors).toEqual([{
      utxo: utxos[0],
      isPure: true,
      hasRequiredAssets: false,
      countExtraAssets: 0,
      spendableValue: 1000000,
      isCollateralReserve: true,
    }, {
      utxo: utxos[1],
      isPure: true,
      hasRequiredAssets: false,
      countExtraAssets: 0,
      spendableValue: 3500000,
      isCollateralReserve: false,
    }, {
      utxo: utxos[2],
      isPure: false,
      hasRequiredAssets: false,
      countExtraAssets: 1,
      spendableValue: 1000000,
      isCollateralReserve: false,
    }, {
      utxo: utxos[3],
      isPure: false,
      hasRequiredAssets: true,
      countExtraAssets: 2,
      spendableValue: 4000000,
      isCollateralReserve: false,
    }])
  });

  it('when requiring one asset available in multiple utxos', () => {
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
      isPure: true,
      hasRequiredAssets: false,
      countExtraAssets: 0,
      spendableValue: 3500000,
      isCollateralReserve: false,
    }, {
      utxo: utxos[2],
      isPure: false,
      hasRequiredAssets: true,
      countExtraAssets: 0,
      spendableValue: 1000000,
      isCollateralReserve: false,
    }, {
      utxo: utxos[3],
      isPure: false,
      hasRequiredAssets: true,
      countExtraAssets: 2,
      spendableValue: 4000000,
      isCollateralReserve: false,
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
      isPure: true,
      hasRequiredAssets: false,
      countExtraAssets: 0,
      spendableValue: 3500000,
      isCollateralReserve: false,
    }, {
      utxo: utxos[2],
      isPure: false,
      hasRequiredAssets: true,
      countExtraAssets: 0,
      spendableValue: 1000000,
      isCollateralReserve: false,
    }, {
      utxo: utxos[3],
      isPure: false,
      hasRequiredAssets: true,
      countExtraAssets: 1,
      spendableValue: 4000000,
      isCollateralReserve: false,
    }])
  });
});

describe('classifyUtxoDescriptors', () => {

  it('classify with no required assets', () => {
    const coinsPerUtxoWord: RustModule.WalletV4.BigNum
      = RustModule.WalletV4.BigNum.from_str('500');
    const descriptors = CoinSelection
      .describeUtxos(utxos, new Set(), coinsPerUtxoWord);
    const classification =
      CoinSelection.classifyUtxoDescriptors(descriptors);
    expect(classification.withRequiredAssets).toEqual([]);
    expect(classification.withOnlyRequiredAssets).toEqual([]);
    expect(classification.dirty)
      .toEqual([descriptors[3], descriptors[2]]); // ordered by spendable value
    expect(classification.collateralReserve).toEqual([descriptors[0]]);
    expect(classification.pure).toEqual([descriptors[1]]);
  });

  it('classify with one required asset contained in one utxo', () => {
    const coinsPerUtxoWord: RustModule.WalletV4.BigNum
      = RustModule.WalletV4.BigNum.from_str('500');
    const descriptors = CoinSelection
      .describeUtxos(utxos, new Set([`${POLICY_ID_1}.abcd2`]), coinsPerUtxoWord);
    const classification =
      CoinSelection.classifyUtxoDescriptors(descriptors);
    expect(classification.withRequiredAssets).toEqual([descriptors[3]]);
    expect(classification.withOnlyRequiredAssets).toEqual([]);
    expect(classification.dirty).toEqual([descriptors[2]]);
    expect(classification.collateralReserve).toEqual([descriptors[0]]);
    expect(classification.pure).toEqual([descriptors[1]]);
  });

  it('classify with one required asset contained in multiple utxos', () => {
    const coinsPerUtxoWord: RustModule.WalletV4.BigNum
      = RustModule.WalletV4.BigNum.from_str('500');
    const descriptors = CoinSelection
      .describeUtxos(utxos, new Set([`${POLICY_ID_1}.abcd1`]), coinsPerUtxoWord);
    const classification =
      CoinSelection.classifyUtxoDescriptors(descriptors);
    expect(classification.withRequiredAssets).toEqual([descriptors[3]]);
    expect(classification.withOnlyRequiredAssets).toEqual([descriptors[2]]);
    expect(classification.dirty).toEqual([]);
    expect(classification.collateralReserve).toEqual([descriptors[0]]);
    expect(classification.pure).toEqual([descriptors[1]]);
  });

  it('classify with multiple required assets', () => {
    const coinsPerUtxoWord: RustModule.WalletV4.BigNum
      = RustModule.WalletV4.BigNum.from_str('500');
    const descriptors = CoinSelection
      .describeUtxos(utxos, new Set([
        `${POLICY_ID_1}.abcd1`,
        `${POLICY_ID_1}.abcd2`,
        `${POLICY_ID_1}.abcd3`,
        `${POLICY_ID_1}.abcd9999`, // non-existing
      ]), coinsPerUtxoWord);
    const classification =
      CoinSelection.classifyUtxoDescriptors(descriptors);
    expect(classification.withRequiredAssets).toEqual([]);
    expect(classification.withOnlyRequiredAssets)
      .toEqual([descriptors[3], descriptors[2]]); // ordered by spendable value
    expect(classification.dirty).toEqual([]);
    expect(classification.collateralReserve).toEqual([descriptors[0]]);
    expect(classification.pure).toEqual([descriptors[1]]);
  });

  it('classify with multiple pure utxos', () => {
    const coinsPerUtxoWord: RustModule.WalletV4.BigNum
      = RustModule.WalletV4.BigNum.from_str('500');
    const pureUtxos = utxos.map(u => ({ ...u, assets: [] }));
    const descriptors = CoinSelection
      .describeUtxos(pureUtxos, new Set(), coinsPerUtxoWord);

    jest.spyOn(global.Math, 'random').mockReturnValue(0.1);

    const classification1 =
      CoinSelection.classifyUtxoDescriptors(descriptors);

    jest.spyOn(global.Math, 'random').mockReturnValue(0.9);

    const classification2 =
      CoinSelection.classifyUtxoDescriptors(descriptors);

    jest.spyOn(global.Math, 'random').mockRestore();

    expect(classification1.withRequiredAssets).toEqual([]);
    expect(classification2.withRequiredAssets).toEqual([]);
    expect(classification1.withOnlyRequiredAssets).toEqual([]);
    expect(classification2.withOnlyRequiredAssets).toEqual([]);
    expect(classification1.dirty).toEqual([]);
    expect(classification2.dirty).toEqual([]);
    expect(classification1.collateralReserve).toEqual([descriptors[2], descriptors[0]]);
    expect(classification2.collateralReserve).toEqual([descriptors[2], descriptors[0]]);

    // Pure utxos are ordered randomly
    expect(classification1.pure).toEqual([descriptors[3], descriptors[1]]);
    expect(classification2.pure).toEqual([descriptors[1], descriptors[3]]);
  });
});
