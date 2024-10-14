// @flow
import '../../lib/test-config.forTests';

import { schema } from 'lovefield';
import BigNumber from 'bignumber.js';
import type { CardanoAddressedUtxo, } from '../types';
import type { RemoteUnspentOutput } from '../../lib/state-fetch/types';
import {
  newAdaUnsignedTx,
  newAdaUnsignedTxFromUtxo,
  sendAllUnsignedTxFromUtxo,
  signTransaction,
} from './transactions';
import { AssetOverflowError, NoOutputsError, NotEnoughMoneyToSendError, } from '../../../common/errors';

import { loadLovefieldDB, } from '../../lib/storage/database/index';
import { Bip44DerivationLevels, } from '../../lib/storage/database/walletTypes/bip44/api/utils';
import type { Address, Addressing } from '../../lib/storage/models/PublicDeriver/interfaces';
import { byronAddrToHex, } from '../../lib/storage/bridge/utils';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import {
  CoinTypes,
  HARD_DERIVATION_START,
  STAKING_KEY_INDEX,
  WalletTypePurpose,
} from '../../../../config/numbersConfig';
import { defaultAssets, networks, } from '../../lib/storage/database/prepackaged/networks';
import { MultiToken, } from '../../../common/lib/MultiToken';
import { identifierSplit } from '../utils';
import { bytesToHex, iterateLenGetMap } from '../../../../coreUtils';

const network = networks.CardanoMainnet;
const defaultIdentifier = defaultAssets.filter(
  asset => asset.NetworkId === network.NetworkId
)[0].Identifier;

const testAssetId = 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26.6e69636f696e';

function bech32ToHex(s: string): string {
  return RustModule.WalletV4.Address.from_bech32(s).to_hex();
}

const genSampleUtxos: void => Array<RemoteUnspentOutput> = () => [
  {
    amount: '701',
    receiver: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
    tx_hash: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
    tx_index: 0,
    utxo_id: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f0',
    assets: [],
  },
  {
    amount: '1000001',
    receiver: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
    assets: [],
  },
  {
    amount: '10000001',
    receiver: byronAddrToHex('Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN'),
    tx_hash: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a173',
    tx_index: 0,
    utxo_id: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a1730',
    assets: [],
  },
  {
    amount: '30000000',
    receiver: bech32ToHex(
      // external addr 0, staking key 0
      'addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'
    ),
    tx_hash: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de5550',
    tx_index: 0,
    utxo_id: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de55500',
    assets: [],
  },
  {
    amount: '2000001',
    receiver: bech32ToHex(
      // external addr 0, staking key 0
      'addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'
    ),
    tx_hash: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de5550',
    tx_index: 1,
    utxo_id: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de55501',
    assets: [{
      amount: '1234',
      assetId: testAssetId,
      policyId: testAssetId.split('.')[0],
      name: testAssetId.split('.')[1],
    }],
  },
  {
    amount: '1000001',
    receiver: bech32ToHex(
      // external addr 0, staking key 0
      'addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'
    ),
    tx_hash: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de5550',
    tx_index: 2,
    utxo_id: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de55502',
    assets: [{
      amount: '18446744073709551615', // max u64
      assetId: testAssetId,
      policyId: testAssetId.split('.')[0],
      name: testAssetId.split('.')[1],
    }],
  },
];

const genSampleAdaAddresses: void => Array<{| ...Address, ...Addressing |}> = () => [
  {
    address: byronAddrToHex('Ae2tdPwUPEZEtwz7LKtJn9ub8y7ireuj3sq2yUCZ57ccj6ZkJKn7xEiApV9'),
    addressing: {
      path: [1, 11],
      startLevel: Bip44DerivationLevels.CHAIN.level,
    },
  },
  {
    address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
    addressing: {
      path: [0, 135],
      startLevel: Bip44DerivationLevels.CHAIN.level,
    },
  },
  {
    address: byronAddrToHex('Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN'),
    addressing: {
      path: [0, 134],
      startLevel: Bip44DerivationLevels.CHAIN.level,
    },
  },
  {
    address: bech32ToHex(
      'addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'
    ),
    addressing: {
      path: [0, 0],
      startLevel: Bip44DerivationLevels.CHAIN.level,
    },
  },
];
const genAddressedUtxos: void => Array<CardanoAddressedUtxo> = () => {
  const addressingMap = new Map<string, Addressing>();
  for (const address of genSampleAdaAddresses()) {
    addressingMap.set(address.address, { addressing: address.addressing });
  }
  return genSampleUtxos().map(utxo => {
    const addressing = addressingMap.get(utxo.receiver);
    if (addressing == null) throw new Error('Should never happen');
    return {
      ...utxo,
      ...addressing,
    };
  });
};

beforeAll(async () => {
  await RustModule.load();
  await loadLovefieldDB(schema.DataStoreType.MEMORY);
});

function getProtocolParams(): {|
  linearFeeCoefficient: string,
  linearFeeConstant: string,
  coinsPerUtxoByte: string,
  poolDeposit: string,
  keyDeposit: string,
  networkId: number,
|} {
  return {
    linearFeeCoefficient: '2',
    linearFeeConstant: '500',
    coinsPerUtxoByte: '1',
    poolDeposit: '500',
    keyDeposit: '500',
    networkId: Number(network.BaseConfig[0].ChainNetworkId),
  };
}

describe('Create unsigned TX from UTXO', () => {
  it('Should fail due to insufficient funds (bigger than all inputs)', async () => {
    const sampleUtxos = genSampleUtxos();
    const output = new MultiToken(
      [{
        // bigger than input including fees
        amount: new BigNumber(1900001),
        identifier: defaultIdentifier,
        networkId: network.NetworkId,
      }],
      {
        defaultIdentifier,
        defaultNetworkId: network.NetworkId,
      }
    );

    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[1]];
    await expect(newAdaUnsignedTxFromUtxo(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: output,
      }],
      undefined,
      utxos,
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      true,
      undefined,
      network.NetworkId,
    )).rejects.toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (no inputs)', async () => {
    const output = new MultiToken(
      [{
        // bigger than input including fees
        amount: new BigNumber(1000000),
        identifier: defaultIdentifier,
        networkId: network.NetworkId,
      }],
      {
        defaultIdentifier,
        defaultNetworkId: network.NetworkId,
      }
    );

    await expect(newAdaUnsignedTxFromUtxo(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: output,
      }],
      undefined,
      [],
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      true,
      undefined,
      network.NetworkId,
    )).rejects.toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (not enough to cover fees)', async () => {
    const sampleUtxos = genSampleUtxos();
    const output = new MultiToken(
      [{
        // bigger than input including fees
        amount: new BigNumber(1000000),
        identifier: defaultIdentifier,
        networkId: network.NetworkId,
      }],
      {
        defaultIdentifier,
        defaultNetworkId: network.NetworkId,
      }
    );

    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[0]];
    await expect(newAdaUnsignedTxFromUtxo(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: output,
      }],
      undefined,
      utxos,
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      true,
      undefined,
      network.NetworkId,
    )).rejects.toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (no outputs disallowed)', async () => {
    const sampleUtxos = genSampleUtxos();
    const sampleAdaAddresses = genSampleAdaAddresses();
    // should fail because we disallow burning extra ADA in fees
    await expect(newAdaUnsignedTxFromUtxo(
      [],
      sampleAdaAddresses[0],
      [sampleUtxos[1]],
      new BigNumber(0),
      {
        ...getProtocolParams(),
        // high enough that we can't send the remaining amount as change
        coinsPerUtxoByte: '12375',
      },
      [],
      [],
      false,
      undefined,
      network.NetworkId,
    )).rejects.toThrow(NotEnoughMoneyToSendError);
    // should avoid failing by consuming the second UTXO
    await expect(newAdaUnsignedTxFromUtxo(
      [],
      sampleAdaAddresses[0],
      [sampleUtxos[1], sampleUtxos[0]],
      new BigNumber(0),
      {
        ...getProtocolParams(),
        coinsPerUtxoByte: '3875',
      },
      [],
      [],
      false,
      undefined,
      network.NetworkId,
    )).resolves.not.toThrow(NotEnoughMoneyToSendError);
    // should pass because we can add a change
    await expect(newAdaUnsignedTxFromUtxo(
      [],
      sampleAdaAddresses[0],
      [sampleUtxos[1]],
      new BigNumber(0),
      {
        ...getProtocolParams(),
        coinsPerUtxoByte: '3750',
      },
      [],
      [],
      false,
      undefined,
      network.NetworkId,
    )).resolves.not.toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to no outputs', async () => {
    const sampleUtxos = genSampleUtxos();
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[1]];
    await expect(newAdaUnsignedTxFromUtxo(
      [],
      undefined,
      utxos,
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      false,
      undefined,
      network.NetworkId,
    )).rejects.toThrow(NoOutputsError);
  });

  it('Should pick random pure inputs when using input selection', async () => {
    const utxos: Array<RemoteUnspentOutput> = genSampleUtxos();
    const sampleAdaAddresses = genSampleAdaAddresses();

    const output = new MultiToken(
      [{
        // smaller than input
        amount: new BigNumber(1001),
        identifier: defaultIdentifier,
        networkId: network.NetworkId,
      }],
      {
        defaultIdentifier,
        defaultNetworkId: network.NetworkId,
      }
    );

    async function testTxConstruction(randomValues: number[], expected: {|
      inputs: any[],
      fee: string,
      sumInputs: string,
      sumOutputs: string,
    |}): Promise<void> {
      randomValues.reduce(
        (m, v) => m.mockReturnValueOnce(v),
        jest.spyOn(global.Math, 'random'),
      );

      const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(
        [{
          address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          amount: output,
        }],
        sampleAdaAddresses[0],
        [utxos[0], utxos[1], utxos[2], utxos[3]],
        new BigNumber(0),
        getProtocolParams(),
        [],
        [],
        true,
        undefined,
        network.NetworkId,
      );

      jest.spyOn(global.Math, 'random').mockRestore();

      const txBuilder = unsignedTxResponse.txBuilder;
      expect(unsignedTxResponse.senderUtxos).toEqual(expected.inputs);
      expect(txBuilder.min_fee().to_str()).toEqual(expected.fee);
      expect(txBuilder.get_explicit_input().coin().to_str()).toEqual(expected.sumInputs);
      expect(txBuilder.get_explicit_output().coin().to_str()).toEqual(expected.sumOutputs);
    }

    await testTxConstruction([0.2, 0.2, 0.2, 0.2, 0.2], {
      inputs: [utxos[3]],
      fee: '1330',
      sumInputs: '30000000',
      sumOutputs: '29998670',
    });

    await testTxConstruction([0.7, 0.7, 0.7, 0.7, 0.7], {
      inputs: [utxos[2]],
      fee: '1402',
      sumInputs: '10000001',
      sumOutputs: '9998599',
    });

    await testTxConstruction([0.7, 0.2, 0.7, 0.2, 0.7], {
      inputs: [utxos[2]],
      fee: '1402',
      sumInputs: '10000001',
      sumOutputs: '9998599',
    });
  });

  it('Should pick inputs with tokens when using input selection', async () => {
    const utxos: Array<RemoteUnspentOutput> = genSampleUtxos();
    const sampleAdaAddresses = genSampleAdaAddresses();

    const output = new MultiToken(
      [{
        // smaller than input
        amount: new BigNumber(1001),
        identifier: defaultIdentifier,
        networkId: network.NetworkId,
      }, {
        amount: new BigNumber(1000),
        identifier: testAssetId,
        networkId: network.NetworkId,
      }],
      {
        defaultIdentifier,
        defaultNetworkId: network.NetworkId,
      }
    );

    const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: output,
      }],
      sampleAdaAddresses[0],
      [utxos[0], utxos[1], utxos[2], utxos[3], utxos[4]],
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      true,
      undefined,
      network.NetworkId,
    );

    // always take utxos[4], take either utxos[2] or utxos[3] randomly
    try {
      expect(new Set([utxos[4], utxos[2]])).toEqual(new Set(unsignedTxResponse.senderUtxos));
      expect(unsignedTxResponse.txBuilder.get_explicit_input().coin().to_str()).toEqual('12000002');
      expect(unsignedTxResponse.txBuilder.get_explicit_output().coin().to_str()).toEqual('11998054');
      expect(unsignedTxResponse.txBuilder.min_fee().to_str()).toEqual('1948');
    } catch {
      expect(new Set([utxos[4], utxos[3]])).toEqual(new Set(unsignedTxResponse.senderUtxos));
      expect(unsignedTxResponse.txBuilder.get_explicit_input().coin().to_str()).toEqual('32000001');
      expect(unsignedTxResponse.txBuilder.get_explicit_output().coin().to_str()).toEqual('31998331');
      expect(unsignedTxResponse.txBuilder.min_fee().to_str()).toEqual('1670');
    }

    function assertMultiAsset(masset: any, policy: string, name: string, amount: string): void {
      const massetArray = iterateLenGetMap(masset).toArray();
      expect(massetArray.length).toEqual(1);
      expect(massetArray[0][0].to_hex()).toEqual(policy);
      const assetsArray = iterateLenGetMap(massetArray[0][1]).toArray();
      expect(assetsArray.length).toEqual(1);
      expect(bytesToHex(assetsArray[0][0].name())).toEqual(name);
      expect(assetsArray[0][1].to_str()).toEqual(amount);
    }

    const assetSplit = identifierSplit(testAssetId);
    assertMultiAsset(
      unsignedTxResponse.txBuilder.get_explicit_input().multiasset(),
      assetSplit.policyId,
      assetSplit.name,
      '1234',
    );

    const tx = unsignedTxResponse.txBuilder.build();
    assertMultiAsset(
      tx.outputs().get(4).amount().multiasset(),
      assetSplit.policyId,
      assetSplit.name,
      '234',
    );
  });

  it('Should fail when not enough ADA to avoid burning tokens', async () => {
    const utxos: Array<RemoteUnspentOutput> = genSampleUtxos();
    const sampleAdaAddresses = genSampleAdaAddresses();

    const output = new MultiToken(
      [{
        // smaller than input
        amount: new BigNumber(2000000),
        identifier: defaultIdentifier,
        networkId: network.NetworkId,
      }, {
        amount: new BigNumber(1000),
        identifier: testAssetId,
        networkId: network.NetworkId,
      }],
      {
        defaultIdentifier,
        defaultNetworkId: network.NetworkId,
      }
    );

    await expect(newAdaUnsignedTxFromUtxo(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: output,
      }],
      sampleAdaAddresses[0],
      [utxos[4]],
      new BigNumber(0),
      {
        ...getProtocolParams(),
        // high enough that we can't send the remaining amount as change
        coinsPerUtxoByte: '4310',
      },
      [],
      [],
      true,
      undefined,
      network.NetworkId,
    )).rejects.toThrow(NotEnoughMoneyToSendError);
  });

  it('Should succeed when not enough ADA to avoid burning tokens but is sending all', () => {
    const utxos: Array<RemoteUnspentOutput> = genSampleUtxos();
    expect(() => sendAllUnsignedTxFromUtxo(
      {
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4')
      },
      [utxos[4]],
      new BigNumber(0),
      {
        linearFee: RustModule.WalletV4.LinearFee.new(
          RustModule.WalletV4.BigNum.from_str('2'),
          RustModule.WalletV4.BigNum.from_str('500'),
        ),
        poolDeposit: RustModule.WalletV4.BigNum.from_str('500'),
        keyDeposit: RustModule.WalletV4.BigNum.from_str('500'),
        networkId: network.NetworkId,
        // high enough that we can't send the remaining amount as change
        coinsPerUtxoByte: RustModule.WalletV4.BigNum.from_str('4310'),
      },
      undefined,
      network.NetworkId,
    )).not.toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail when insufficient ADA when forcing change', async () => {
    const sampleUtxos = genSampleUtxos();
    const sampleAdaAddresses = genSampleAdaAddresses();
    const output = new MultiToken(
      [{
        // bigger than input including fees
        amount: new BigNumber(2900001),
        identifier: defaultIdentifier,
        networkId: network.NetworkId,
      }],
      {
        defaultIdentifier,
        defaultNetworkId: network.NetworkId,
      }
    );

    await  expect(newAdaUnsignedTxFromUtxo(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: output,
      }],
      sampleAdaAddresses[0],
      [sampleUtxos[4]],
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      true,
      undefined,
      network.NetworkId,
    )).rejects.toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail when sending all where sum of tokens > 2^64', () => {
    const sampleUtxos = genSampleUtxos();

    expect(() => sendAllUnsignedTxFromUtxo(
      {
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      },
      [sampleUtxos[4], sampleUtxos[5]],
      new BigNumber(0),
      {
        linearFee: RustModule.WalletV4.LinearFee.new(
          RustModule.WalletV4.BigNum.from_str('2'),
          RustModule.WalletV4.BigNum.from_str('500'),
        ),
        coinsPerUtxoByte: RustModule.WalletV4.BigNum.from_str('1'),
        poolDeposit: RustModule.WalletV4.BigNum.from_str('500'),
        keyDeposit: RustModule.WalletV4.BigNum.from_str('500'),
        networkId: network.NetworkId,
      },
      undefined,
      network.NetworkId,
    )).toThrow(AssetOverflowError);
  });

  it('Should fail when sending where sum of tokens > 2^64', async () => {
    const sampleUtxos = genSampleUtxos();
    const sampleAdaAddresses = genSampleAdaAddresses();
    const output = new MultiToken(
      [{
        // need to include both the input txs to satisfy this amount,
        // but the asset amount of them overflows when added
        amount: new BigNumber(3000000),
        identifier: defaultIdentifier,
        networkId: network.NetworkId,
      }],
      {
        defaultIdentifier,
        defaultNetworkId: network.NetworkId,
      }
    );

    await expect(newAdaUnsignedTxFromUtxo(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: output,
      }],
      sampleAdaAddresses[0],
      [sampleUtxos[4], sampleUtxos[5]],
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      true,
      undefined,
      network.NetworkId,
    )).rejects.toThrow(AssetOverflowError);
  });

  it('Should optimize away coin burn by using one extra input', async () => {
    const utxos = [
      {
        amount: '10831727',
        receiver: '82d818582183581ce3a1faa5b54bd1485a424d8f9b5e75296b328a2a624ef1d2f4c7b480a0001a88e5cdab',
        tx_hash: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
        tx_index: 0,
        utxo_id: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f0',
        assets: []
      },
      {
        amount: '1000000',
        receiver: '82d818582183581ce3a1faa5b54bd1485a424d8f9b5e75296b328a2a624ef1d2f4c7b480a0001a88e5cdab',
        tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
        tx_index: 0,
        utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
        assets: []
      },
    ];
    const sampleAdaAddresses = genSampleAdaAddresses();
    const output = new MultiToken(
      [{
        amount: new BigNumber(10000000),
        identifier: defaultIdentifier,
        networkId: network.NetworkId,
      }],
      {
        defaultIdentifier,
        defaultNetworkId: network.NetworkId,
      }
    );

    const result = await newAdaUnsignedTxFromUtxo(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: output,
      }],
      sampleAdaAddresses[0],
      utxos,
      new BigNumber(0),
      {
        ...getProtocolParams(),
        coinsPerUtxoByte: '4310',
      },
      [],
      [],
      true,
      undefined,
      network.NetworkId,
    );

    expect(result.senderUtxos.length).toEqual(2);
    expect(result.txBuilder.get_fee_if_set()?.to_str()).toEqual('1172');
  });
});

describe('Create unsigned TX from addresses', () => {
  it('Should create a valid transaction without change', async () => {
    const addressedUtxos = genAddressedUtxos();

    const output = new MultiToken(
      [{
        // smaller than input
        amount: new BigNumber(5001),
        identifier: defaultIdentifier,
        networkId: network.NetworkId,
      }],
      {
        defaultIdentifier,
        defaultNetworkId: network.NetworkId,
      }
    );
    const unsignedTxResponse = await newAdaUnsignedTx(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: output,
      }],
      undefined,
      [addressedUtxos[1]],
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      true,
      undefined,
      network.NetworkId,
    );
    expect(unsignedTxResponse.senderUtxos).toEqual([addressedUtxos[1]]);

    expect(unsignedTxResponse.txBuilder.get_explicit_input().coin().to_str()).toEqual('1000001');
    expect(unsignedTxResponse.txBuilder.get_explicit_output().coin().to_str()).toEqual('5001');
    expect(unsignedTxResponse.txBuilder.min_fee().to_str()).toEqual('994');
    // burns remaining amount
    expect(
      unsignedTxResponse.txBuilder.get_explicit_input().checked_sub(
        unsignedTxResponse.txBuilder.get_explicit_output()
      ).coin().to_str()
    ).toEqual(unsignedTxResponse.txBuilder.build().fee().to_str());
  });
});

describe('Create signed transactions', () => {
  it('Witness should match on valid private key', async () => {
    const addressedUtxos = genAddressedUtxos();

    const output = new MultiToken(
      [{
        // smaller than input
        amount: new BigNumber(5001),
        identifier: defaultIdentifier,
        networkId: network.NetworkId,
      }],
      {
        defaultIdentifier,
        defaultNetworkId: network.NetworkId,
      }
    );

    // Fix the random value to handle the pure inputs prioritisation properly
    jest.spyOn(global.Math, 'random').mockReturnValue(0.7);

    const unsignedTxResponse = await newAdaUnsignedTx(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: output,
      }],
      undefined,
      [addressedUtxos[0], addressedUtxos[1]],
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      true,
      undefined,
      network.NetworkId,
    );

    jest.spyOn(global.Math, 'random').mockRestore();

    const accountPrivateKey = RustModule.WalletV4.Bip32PrivateKey.from_hex(
      '70afd5ff1f7f551c481b7e3f3541f7c63f5f6bcb293af92565af3deea0bcd6481a6e7b8acbe38f3906c63ccbe8b2d9b876572651ac5d2afc0aca284d9412bb1b4839bf02e1d990056d0f06af22ce4bcca52ac00f1074324aab96bbaaaccf290d',
    );
    const signedTx = signTransaction(
      unsignedTxResponse.senderUtxos,
      unsignedTxResponse.txBuilder.build().to_bytes(),
      Bip44DerivationLevels.ACCOUNT.level,
      accountPrivateKey,
      new Set(),
      undefined,
    );
    const witnesses = signedTx.witness_set();

    expect(witnesses.vkeys()).toEqual(undefined);
    expect(witnesses.native_scripts()).toEqual(undefined);
    const bootstrapWits = witnesses.bootstraps();
    if (bootstrapWits == null) throw new Error('Bootstrap witnesses should not be null');
    expect(bootstrapWits.len()).toEqual(1);

    expect(bootstrapWits.get(0).to_hex()).toEqual(
      '8458208fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c0584029239c4ecf5123beb4256558be536c2745595a9be9348cede7e71138c03aaed70acdc6847165e51843e5e30d6a4bc96d3f68191d1ee35d04e5dfc0df0fd4ed0858202623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e6241a0'
    );
  });

  it('Witness should with addressing from root', () => {
    const accountPrivateKey = RustModule.WalletV4.Bip32PrivateKey.from_hex(
      '70afd5ff1f7f551c481b7e3f3541f7c63f5f6bcb293af92565af3deea0bcd6481a6e7b8acbe38f3906c63ccbe8b2d9b876572651ac5d2afc0aca284d9412bb1b4839bf02e1d990056d0f06af22ce4bcca52ac00f1074324aab96bbaaaccf290d',
    );
    const inputs = RustModule.WalletV4.TransactionInputs.new();
    inputs.add(
      RustModule.WalletV4.TransactionInput.new(
        RustModule.WalletV4.TransactionHash.from_hex('05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f'),
        0
      )
    );
    inputs.add(
      RustModule.WalletV4.TransactionInput.new(
        RustModule.WalletV4.TransactionHash.from_hex('6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe'),
        0
      )
    );
    const outputs = RustModule.WalletV4.TransactionOutputs.new();
    outputs.add(
      RustModule.WalletV4.TransactionOutput.new(
        RustModule.WalletV4.Address.from_hex(byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4')),
        RustModule.WalletV4.Value.new(RustModule.WalletV4.BigNum.from_str('5001'))
      )
    );
    const txBody = RustModule.WalletV4.TransactionBody.new(
      inputs,
      outputs,
      RustModule.WalletV4.BigNum.from_str('1000'),
      0,
    );

    const signedTx = signTransaction(
      [
        {
          amount: '7001',
          receiver: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          tx_hash: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
          tx_index: 0,
          utxo_id: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f0',
          addressing: {
            path: [WalletTypePurpose.BIP44, CoinTypes.CARDANO, HARD_DERIVATION_START + 0, 0, 135],
            startLevel: 1
          },
          assets: [],
        },
        {
          amount: '1000001',
          receiver: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
          tx_index: 0,
          utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
          addressing: {
            path: [WalletTypePurpose.BIP44, CoinTypes.CARDANO, HARD_DERIVATION_START + 0, 0, 135],
            startLevel: 1
          },
          assets: [],
        }
      ],
      txBody,
      Bip44DerivationLevels.ACCOUNT.level,
      accountPrivateKey,
      new Set(),
      undefined,
    );
    const witnesses = signedTx.witness_set();

    expect(witnesses.vkeys()).toEqual(undefined);
    expect(witnesses.native_scripts()).toEqual(undefined);
    const bootstrapWits = witnesses.bootstraps();
    if (bootstrapWits == null) throw new Error('Bootstrap witnesses should not be null');
    expect(bootstrapWits.len()).toEqual(1); // note: only one witness since we got rid of duplicates

    expect(bootstrapWits.get(0).to_hex()).toEqual(
      '8458208fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c058401edebb108c74a991bef5b28458778fc0713499349d77fb98acc63e4219cfcd1b51321ccaccdf2ce2e80d7c2687f3d79feea32daedcfbc19792dff0358af5950358202623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e6241a0'
    );
  });

  it('Transaction should support certificates', async () => {
    const accountPrivateKey = RustModule.WalletV4.Bip32PrivateKey.from_hex(
      '408a1cb637d615c49e8696c30dd54883302a20a7b9b8a9d1c307d2ed3cd50758c9402acd000461a8fc0f25728666e6d3b86d031b8eea8d2f69b21e8aa6ba2b153e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
    );
    const stakingKey = accountPrivateKey.derive(2).derive(STAKING_KEY_INDEX).to_raw_key();

    const addressedUtxos = genAddressedUtxos();

    const output = new MultiToken(
      [{
        // smaller than input
        amount: new BigNumber(5001),
        identifier: defaultIdentifier,
        networkId: network.NetworkId,
      }],
      {
        defaultIdentifier,
        defaultNetworkId: network.NetworkId,
      }
    );

    const unsignedTxResponse = await newAdaUnsignedTx(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: output,
      }],
      undefined,
      [addressedUtxos[3]],
      new BigNumber(0),
      getProtocolParams(),
      [
        RustModule.WalletV4.Certificate.new_stake_registration(
          RustModule.WalletV4.StakeRegistration.new(
            RustModule.WalletV4.Credential.from_keyhash(stakingKey.to_public().hash())
          )
        ),
        RustModule.WalletV4.Certificate.new_stake_delegation(
          RustModule.WalletV4.StakeDelegation.new(
            RustModule.WalletV4.Credential.from_keyhash(stakingKey.to_public().hash()),
            RustModule.WalletV4.Ed25519KeyHash.from_hex('1b268f4cba3faa7e36d8a0cc4adca2096fb856119412ee7330f692b5')
          )
        ),
      ],
      [],
      true,
      undefined,
      network.NetworkId,
    );
    const signedTx = signTransaction(
      unsignedTxResponse.senderUtxos,
      unsignedTxResponse.txBuilder.build().to_bytes(),
      Bip44DerivationLevels.ACCOUNT.level,
      accountPrivateKey,
      new Set([
        RustModule.WalletV4.make_vkey_witness(
          RustModule.WalletV4.hash_transaction(
            RustModule.WalletV4.TransactionBody.from_bytes(
              unsignedTxResponse.txBuilder.build().to_bytes(),
            ),
          ),
          stakingKey,
        ).to_hex()
      ]),
      undefined,
    );
    const witnesses = signedTx.witness_set();

    const vKeyWits = witnesses.vkeys();
    if (vKeyWits == null) throw new Error('Vkey witnesses should not be null');
    expect(vKeyWits.len()).toEqual(2);
    expect(witnesses.native_scripts()).toEqual(undefined);
    expect(witnesses.bootstraps()).toEqual(undefined);

    // set is used so order not defined so we sort the list
    const witArray = [
      vKeyWits.get(0).to_hex(),
      vKeyWits.get(1).to_hex(),
    ].sort();

    expect(witArray).toEqual([
      '82582001c01f8b958699ae769a246e9785db5a70e023977ea4b856dfacf23c23346caf58401b10a18433be709391e70a82c4de91d1c8b3cb27dfa7c7d19a247a4dfe5dea437a0ebefe3ced5f6f7ad2bc79b11c5556614f8bec19b87fc5145a13edc3ae320f',
      '82582038c14a0756e1743081a8ebfdb9169b11283a7bf6c38045c4c4a5e62a7689639d58403a56ed05738ec98589a1263281bfd33ec5f0bed3f90eafced8ed8652be65f3327487cb487dde0d26ca9a7ce568a4c05367630baec47a5d771ba7b184161b100d',
    ]);
  });

  it('Transaction should support withdrawals', async () => {
    const accountPrivateKey = RustModule.WalletV4.Bip32PrivateKey.from_hex(
      '408a1cb637d615c49e8696c30dd54883302a20a7b9b8a9d1c307d2ed3cd50758c9402acd000461a8fc0f25728666e6d3b86d031b8eea8d2f69b21e8aa6ba2b153e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
    );
    const stakingKey = accountPrivateKey.derive(2).derive(STAKING_KEY_INDEX).to_raw_key();
    const stakingKeyCredential = RustModule.WalletV4.Credential.from_keyhash(
      stakingKey.to_public().hash()
    );

    if (network.BaseConfig[0].ChainNetworkId == null) {
      throw new Error(`missing network id`);
    }

    const protocolParams = getProtocolParams();
    const withdrawAmount = '1000000';
    const addressedUtxos = genAddressedUtxos();
    const sampleAdaAddresses = genSampleAdaAddresses();
    const unsignedTxResponse = await newAdaUnsignedTx(
      [],
      sampleAdaAddresses[3],
      [addressedUtxos[3]],
      new BigNumber(0),
      protocolParams,
      [
        RustModule.WalletV4.Certificate.new_stake_deregistration(
          RustModule.WalletV4.StakeDeregistration.new(stakingKeyCredential)
        ),
      ],
      [{
        address: RustModule.WalletV4.RewardAddress.new(
          Number.parseInt(network.BaseConfig[0].ChainNetworkId, 10),
          stakingKeyCredential
        ),
        amount: RustModule.WalletV4.BigNum.from_str(withdrawAmount)
      }],
      true,
      undefined,
      network.NetworkId,
    );

    const signedTx = signTransaction(
      unsignedTxResponse.senderUtxos,
      unsignedTxResponse.txBuilder.build().to_bytes(),
      Bip44DerivationLevels.ACCOUNT.level,
      accountPrivateKey,
      new Set([
        RustModule.WalletV4.make_vkey_witness(
          RustModule.WalletV4.hash_transaction(
            RustModule.WalletV4.TransactionBody.from_bytes(
              unsignedTxResponse.txBuilder.build().to_bytes(),
            ),
          ),
          stakingKey,
        ).to_hex(),
      ]),
      undefined,
    );
    const witnesses = signedTx.witness_set();

    const vKeyWits = witnesses.vkeys();
    if (vKeyWits == null) throw new Error('Vkey witnesses should not be null');
    expect(vKeyWits.len()).toEqual(2);
    expect(witnesses.native_scripts()).toEqual(undefined);
    expect(witnesses.bootstraps()).toEqual(undefined);

    const txBody = unsignedTxResponse.txBuilder.build();
    expect(txBody.withdrawals()?.len()).toEqual(1);
    const fee = txBody.fee().to_str();
    expect(fee).toEqual('1954');
    expect(txBody.outputs().len()).toEqual(6);
    expect(txBody.outputs().get(5).amount().coin().to_str()).toEqual(
      new BigNumber(addressedUtxos[3].amount)
        .minus(fee)
        .minus(5_000_000) // collateral
        .plus(withdrawAmount)
        .plus(protocolParams.keyDeposit)
        .toString()
    );

    // set is used so order not defined so we sort the list
    const witArray = [
      vKeyWits.get(0).to_hex(),
      vKeyWits.get(1).to_hex(),
    ].sort();

    expect(witArray).toEqual([
      '82582001c01f8b958699ae769a246e9785db5a70e023977ea4b856dfacf23c23346caf5840911fd2f8eb6ffe345ea08dbb76ad699eb663c01bd099c4e28f9cae130d7381aad40be3c3e883872f2219b5bdf720b8bffccdbb56ca3b4394b70601b8fe2e5f0d',
      '82582038c14a0756e1743081a8ebfdb9169b11283a7bf6c38045c4c4a5e62a7689639d5840faab139b4304f17b7c93178a7cbda40a7cc9dbd6d7883a90f3ce4f817fab070349a9ed3e7a5e578e92a00f80acf43c6e847e4de2bd4dff270997bbc835da9502',
    ]);
  });
});

describe('Create sendAll unsigned TX from UTXO', () => {
  describe('Create send-all TX from UTXO', () => {
    it('Create a transaction involving all input with no change', () => {
      const sampleUtxos = genSampleUtxos();
      const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[1], sampleUtxos[2]];
      const sendAllResponse = sendAllUnsignedTxFromUtxo(
        {
          address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4')
        },
        utxos,
        new BigNumber(0),
        {
          linearFee: RustModule.WalletV4.LinearFee.new(
            RustModule.WalletV4.BigNum.from_str('2'),
            RustModule.WalletV4.BigNum.from_str('500'),
          ),
          coinsPerUtxoByte: RustModule.WalletV4.BigNum.from_str('1'),
          poolDeposit: RustModule.WalletV4.BigNum.from_str('500'),
          keyDeposit: RustModule.WalletV4.BigNum.from_str('500'),
          networkId: network.NetworkId,
        },
        undefined,
        network.NetworkId,
      );

      const expectedFee = new BigNumber('1344');
      const expectedInput = new BigNumber('11000002');
      expect(sendAllResponse.senderUtxos).toEqual([utxos[0], utxos[1]]);
      expect(
        sendAllResponse.txBuilder.get_explicit_input().coin().to_str()
      ).toEqual(expectedInput.toString());
      expect(
        sendAllResponse.txBuilder.get_explicit_output().coin().to_str()
      ).toEqual(expectedInput.minus(expectedFee).toString());
      expect(sendAllResponse.txBuilder.min_fee().to_str()).toEqual(expectedFee.toString());
      // make sure we don't accidentally burn a lot of coins
      expect(
        sendAllResponse.txBuilder.get_explicit_input().checked_sub(
          sendAllResponse.txBuilder.get_explicit_output()
        ).coin().to_str()
      ).toEqual(expectedFee.toString());
    });
  });

  it('Should fail due to insufficient funds (no inputs)', () => {
    expect(() => sendAllUnsignedTxFromUtxo(
      {
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      },
      [],
      new BigNumber(0),
      {
        linearFee: RustModule.WalletV4.LinearFee.new(
          RustModule.WalletV4.BigNum.from_str('2'),
          RustModule.WalletV4.BigNum.from_str('500'),
        ),
        coinsPerUtxoByte: RustModule.WalletV4.BigNum.from_str('1'),
        poolDeposit: RustModule.WalletV4.BigNum.from_str('500'),
        keyDeposit: RustModule.WalletV4.BigNum.from_str('500'),
        networkId: network.NetworkId,
      },
      undefined,
      network.NetworkId,
    )).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (not enough to cover fees)', () => {
    const sampleUtxos = genSampleUtxos();
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[0]];
    expect(() => sendAllUnsignedTxFromUtxo(
      {
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      },
      utxos,
      new BigNumber(0),
      {
        linearFee: RustModule.WalletV4.LinearFee.new(
          RustModule.WalletV4.BigNum.from_str('2'),
          RustModule.WalletV4.BigNum.from_str('500'),
        ),
        coinsPerUtxoByte: RustModule.WalletV4.BigNum.from_str('1'),
        poolDeposit: RustModule.WalletV4.BigNum.from_str('500'),
        keyDeposit: RustModule.WalletV4.BigNum.from_str('500'),
        networkId: network.NetworkId,
      },
      undefined,
      network.NetworkId,
    )).toThrow(NotEnoughMoneyToSendError);
  });

});
