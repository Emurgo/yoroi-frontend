// @flow

import * as CoinSelection from './coinSelection'
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { MultiToken } from '../../../common/lib/MultiToken';
import { createMultiToken } from '../utils';
import { UtxoDescriptor } from './coinSelection';
import type { RemoteUnspentOutput } from '../../lib/state-fetch/types';
import { NotEnoughMoneyToSendError } from '../../../common/errors';

const POLICY_ID_1 = 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26';
const POLICY_ID_2 = 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb27';
const POLICY_ID_3 = 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb28';

function withMockRandom<T>(r: number, f: () => T): T {
  try {
    jest.spyOn(global.Math, 'random').mockReturnValue(r);
    return f();
  } finally {
    jest.spyOn(global.Math, 'random').mockRestore();
  }
}

function multiToken(
  amount: number | string,
  assets: Array<{ assetId: string, amount: string }> = [],
): MultiToken {
  return createMultiToken(String(amount), assets || [], 0);
}

function utxosFromDescriptors(
  ds: Array<UtxoDescriptor>,
): Array<RemoteUnspentOutput> {
  return ds.map(d => d.utxo);
}

function coinsPerUtxoWork(v: number | string = 500): RustModule.WalletV4.BigNum {
  return RustModule.WalletV4.BigNum.from_str(String(v));
}

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
    assetId: `${POLICY_ID_2}.abcd2`,
    policyId: POLICY_ID_2,
    name: 'abcd2',
  }, {
    amount: '54',
    assetId: `${POLICY_ID_3}.abcd3`,
    policyId: POLICY_ID_3,
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
      .describeUtxos(utxos, new Set([`${POLICY_ID_2}.abcd2`]), coinsPerUtxoWord);
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
        `${POLICY_ID_2}.abcd2`,
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
    const coinsPerUtxoWord = coinsPerUtxoWork();
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
    const coinsPerUtxoWord = coinsPerUtxoWork();
    const descriptors = CoinSelection
      .describeUtxos(utxos, new Set([`${POLICY_ID_2}.abcd2`]), coinsPerUtxoWord);
    const classification =
      CoinSelection.classifyUtxoDescriptors(descriptors);
    expect(classification.withRequiredAssets).toEqual([descriptors[3]]);
    expect(classification.withOnlyRequiredAssets).toEqual([]);
    expect(classification.dirty).toEqual([descriptors[2]]);
    expect(classification.collateralReserve).toEqual([descriptors[0]]);
    expect(classification.pure).toEqual([descriptors[1]]);
  });

  it('classify with one required asset contained in multiple utxos', () => {
    const coinsPerUtxoWord = coinsPerUtxoWork();
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
    const coinsPerUtxoWord = coinsPerUtxoWork();
    const descriptors = CoinSelection
      .describeUtxos(utxos, new Set([
        `${POLICY_ID_1}.abcd1`,
        `${POLICY_ID_2}.abcd2`,
        `${POLICY_ID_3}.abcd3`,
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
    const coinsPerUtxoWord = coinsPerUtxoWork();
    const pureUtxos = utxos.map(u => ({ ...u, assets: [] }));
    const descriptors = CoinSelection
      .describeUtxos(pureUtxos, new Set(), coinsPerUtxoWord);

    const classification1 = withMockRandom(0.1,
      () => CoinSelection.classifyUtxoDescriptors(descriptors));

    const classification2 = withMockRandom(0.9,
      () => CoinSelection.classifyUtxoDescriptors(descriptors));

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

describe('classifyUtxoForValues', () => {

  it('ADA value does not matter', () => {
    /*
     * Classification only uses asset information from the required values
     * ADA amounts change absolutely nothing.
     */
    const coinsPerUtxoWord = coinsPerUtxoWork();
    const classification1 = CoinSelection.classifyUtxoForValues(
      utxos,
      [multiToken(3_000_000)],
      coinsPerUtxoWord,
    );
    const classification2 = CoinSelection.classifyUtxoForValues(
      utxos,
      [multiToken(30_000_000), multiToken(330_000_000)],
      coinsPerUtxoWord,
    );
    expect(classification1.withRequiredAssets).toEqual([]);
    expect(classification2.withRequiredAssets).toEqual([]);
    expect(classification1.withOnlyRequiredAssets).toEqual([]);
    expect(classification2.withOnlyRequiredAssets).toEqual([]);
    expect(utxosFromDescriptors(classification1.dirty)).toEqual([utxos[3], utxos[2]]);
    expect(utxosFromDescriptors(classification2.dirty)).toEqual([utxos[3], utxos[2]]);
    expect(utxosFromDescriptors(classification1.pure)).toEqual([utxos[1]]);
    expect(utxosFromDescriptors(classification2.pure)).toEqual([utxos[1]]);
    expect(utxosFromDescriptors(classification1.collateralReserve)).toEqual([utxos[0]]);
    expect(utxosFromDescriptors(classification2.collateralReserve)).toEqual([utxos[0]]);
  });

  it('Multiple values with same assets', () => {
    const coinsPerUtxoWord = coinsPerUtxoWork();
    const classification = CoinSelection.classifyUtxoForValues(
      utxos,
      [
        multiToken(0, [{ assetId: `${POLICY_ID_3}.abcd3`, amount: '1' }]),
        multiToken(0, [{ assetId: `${POLICY_ID_3}.abcd3`, amount: '2' }]),
      ],
      coinsPerUtxoWord,
    );
    expect(utxosFromDescriptors(classification.withRequiredAssets)).toEqual([utxos[3]]);
    expect(utxosFromDescriptors(classification.withOnlyRequiredAssets)).toEqual([]);
    expect(utxosFromDescriptors(classification.dirty)).toEqual([utxos[2]]);
    expect(utxosFromDescriptors(classification.pure)).toEqual([utxos[1]]);
    expect(utxosFromDescriptors(classification.collateralReserve)).toEqual([utxos[0]]);
  });

  it('Multiple values with assets', () => {
    const coinsPerUtxoWord = coinsPerUtxoWork();
    // First classification is for two values, one real asset each
    const classification1 = CoinSelection.classifyUtxoForValues(
      utxos,
      [
        multiToken(0, [{ assetId: `${POLICY_ID_1}.abcd1`, amount: '1' }]),
        multiToken(0, [{ assetId: `${POLICY_ID_2}.abcd2`, amount: '1' }]),
      ],
      coinsPerUtxoWord,
    );
    // Second classification is for two values, first with two same real assets,
    // and the second one with a single non-existing asset, and different asset amounts
    const classification2 = CoinSelection.classifyUtxoForValues(
      utxos,
      [
        multiToken(0, [
          { assetId: `${POLICY_ID_1}.abcd1`, amount: '2' },
          { assetId: `${POLICY_ID_2}.abcd2`, amount: '2' },
        ]),
        multiToken(0, [
          { assetId: `${POLICY_ID_1}.abcd9999`, amount: '2' },
        ]),
      ],
      coinsPerUtxoWord,
    );
    // The point is that the classification results are same
    expect(utxosFromDescriptors(classification1.withRequiredAssets)).toEqual([utxos[3]]);
    expect(utxosFromDescriptors(classification2.withRequiredAssets)).toEqual([utxos[3]]);
    expect(utxosFromDescriptors(classification1.withOnlyRequiredAssets)).toEqual([utxos[2]]);
    expect(utxosFromDescriptors(classification2.withOnlyRequiredAssets)).toEqual([utxos[2]]);
    expect(utxosFromDescriptors(classification1.dirty)).toEqual([]);
    expect(utxosFromDescriptors(classification2.dirty)).toEqual([]);
    expect(utxosFromDescriptors(classification1.pure)).toEqual([utxos[1]]);
    expect(utxosFromDescriptors(classification2.pure)).toEqual([utxos[1]]);
    expect(utxosFromDescriptors(classification1.collateralReserve)).toEqual([utxos[0]]);
    expect(utxosFromDescriptors(classification2.collateralReserve)).toEqual([utxos[0]]);
  });
});

describe('takeUtxosForValues', () => {

  it('always takes at least one utxo, even for zero required value', () => {
    const { utxoTaken, utxoRemaining } = CoinSelection.takeUtxosForValues(
      utxos,
      [multiToken(0)],
      coinsPerUtxoWork(),
      0,
    );
    expect(utxoTaken).toEqual([utxos[0]]);
    expect(utxoRemaining).toEqual(utxos.slice(1));
  });

  it('fails in case of no utxos as not enough funds', () => {
    expect(() => CoinSelection.takeUtxosForValues(
      [],
      [multiToken(0)],
      coinsPerUtxoWork(),
      0,
    )).toThrow(NotEnoughMoneyToSendError);
  });

  it('taking single utxo when enough', () => {
    const { utxoTaken, utxoRemaining } = CoinSelection.takeUtxosForValues(
      utxos,
      [multiToken(1_000_000)],
      coinsPerUtxoWork(),
      0,
    );
    expect(utxoTaken).toEqual([utxos[0]]);
    expect(utxoRemaining).toEqual(utxos.slice(1));
  });

  it('taking first two utxos when enough', () => {
    const { utxoTaken, utxoRemaining } = CoinSelection.takeUtxosForValues(
      utxos,
      [multiToken(2_000_000)],
      coinsPerUtxoWork(),
      0,
    );
    expect(utxoTaken).toEqual([utxos[0], utxos[1]]);
    expect(utxoRemaining).toEqual(utxos.slice(2));
  });

  it('taking until asset, when required', () => {
    const { utxoTaken, utxoRemaining } = CoinSelection.takeUtxosForValues(
      utxos,
      [multiToken(1_000_000, [{ assetId: `${POLICY_ID_1}.abcd1`, amount: '1' }])],
      coinsPerUtxoWork(),
      0,
    );
    expect(utxoTaken).toEqual([utxos[0], utxos[1], utxos[2]]);
    expect(utxoRemaining).toEqual(utxos.slice(3));
  });

  it('taking until specific asset, when required', () => {
    const { utxoTaken, utxoRemaining } = CoinSelection.takeUtxosForValues(
      utxos,
      [multiToken(1_000_000, [{ assetId: `${POLICY_ID_2}.abcd2`, amount: '1' }])],
      coinsPerUtxoWork(),
      0,
    );
    expect(utxoTaken).toEqual([utxos[0], utxos[1], utxos[2], utxos[3]]);
    expect(utxoRemaining).toEqual([]);
  });

  it('taking until asset amount is satisfied, when required', () => {
    const { utxoTaken, utxoRemaining } = CoinSelection.takeUtxosForValues(
      utxos,
      [multiToken(1_000_000, [{ assetId: `${POLICY_ID_1}.abcd1`, amount: '70' }])],
      coinsPerUtxoWork(),
      0,
    );
    expect(utxoTaken).toEqual([utxos[0], utxos[1], utxos[2], utxos[3]]);
    expect(utxoRemaining).toEqual([]);
  });

  it('taking more utxos when already taken satisfy the ADA value but have extra assets', () => {

    // In this case the first utxo is enough to satisfy the ADA, but there are excessive assets
    // The remaining ADA plus the second utxo is enough for min required ADA to store assets
    const take1 = CoinSelection.takeUtxosForValues(
      [utxos[2], utxos[0], utxos[1]],
      [multiToken(1_500_000)],
      coinsPerUtxoWork(30_000),
      0,
    );
    expect(take1.utxoTaken).toEqual([utxos[2], utxos[0]]);
    expect(take1.utxoRemaining).toEqual([utxos[1]]);

    // In this case the remaining ADA from first utxo is lower
    // So even plus the second utxo is not enough for min required ADA
    // The third utxo is taken then
    const take2 = CoinSelection.takeUtxosForValues(
      [utxos[2], utxos[0], utxos[1]],
      [multiToken(1_990_000)],
      coinsPerUtxoWork(30_000),
      0,
    );
    expect(take2.utxoTaken).toEqual([utxos[2], utxos[0], utxos[1]]);
    expect(take2.utxoRemaining).toEqual([]);
  });

  it('taking more utxos when added utxo adds more excessive assets', () => {

    // In this case the first utxo contains excessive asset
    // and the second utxo is enough to cover the min required ADA for it
    const mappedUtxos1 = [utxos[2], utxos[0], { ...utxos[3], amount: '1000000' }, utxos[1]];

    // In this case the second utxo itself contains even more excessive assets
    // The third utxo is enough so together they cover the min required ADA
    const mappedUtxos2 = [utxos[2], { ...utxos[3], amount: '1000000' }, utxos[0], utxos[1]];

    // In first case it takes only first two utxos
    const take1 = CoinSelection.takeUtxosForValues(
      mappedUtxos1,
      [multiToken(1_830_000)],
      coinsPerUtxoWork(30_000),
      0,
    );
    expect(take1.utxoTaken).toEqual([mappedUtxos1[0], mappedUtxos1[1]]);
    expect(take1.utxoRemaining).toEqual(mappedUtxos1.slice(2));

    // In second case it takes three utxos for same required value
    // Even tho the ADA value of the second utxo is same in both cases
    // In this case it does not cover the total required ADA of excessive assets
    const take2 = CoinSelection.takeUtxosForValues(
      mappedUtxos2,
      [multiToken(1_830_000)],
      coinsPerUtxoWork(30_000),
      0,
    );
    expect(take2.utxoTaken).toEqual([mappedUtxos2[0], mappedUtxos2[1], mappedUtxos2[2]]);
    expect(take2.utxoRemaining).toEqual(mappedUtxos2.slice(3));
  });
});
