// @flow
import '../../lib/test-config';

import { schema } from 'lovefield';
import BigNumber from 'bignumber.js';
import type {
  CardanoAddressedUtxo,
  BaseSignRequest,
} from '../types';
import type { RemoteUnspentOutput } from '../../lib/state-fetch/types';
import {
  newAdaUnsignedTx,
  newAdaUnsignedTxFromUtxo,
  sendAllUnsignedTxFromUtxo,
  signTransaction,
} from './transactions';
import {
  NotEnoughMoneyToSendError,
  NoOutputsError,
} from '../../../common/errors';

import {
  loadLovefieldDB,
} from '../../lib/storage/database/index';
import {
  Bip44DerivationLevels,
} from '../../lib/storage/database/walletTypes/bip44/api/utils';
import type {
  Address, Addressing
} from '../../lib/storage/models/PublicDeriver/interfaces';
import {
  byronAddrToHex,
} from '../../lib/storage/bridge/utils';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import {
  HARD_DERIVATION_START,
  CoinTypes,
  WalletTypePurpose,
  STAKING_KEY_INDEX,
} from '../../../../config/numbersConfig';
import {
  networks,
} from '../../lib/storage/database/prepackaged/networks';

const network = networks.CardanoMainnet;

const genSampleUtxos: void => Array<RemoteUnspentOutput> = () => [
  {
    amount: '701',
    receiver: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
    tx_hash: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
    tx_index: 0,
    utxo_id: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f0',
  },
  {
    amount: '1000001',
    receiver: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
  },
  {
    amount: '10000001',
    receiver: byronAddrToHex('Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN'),
    tx_hash: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a173',
    tx_index: 0,
    utxo_id: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a1730',
  },
  {
    amount: '30000000',
    receiver: Buffer.from(RustModule.WalletV4.Address.from_bech32(
      // external addr 0, staking key 0
      'addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'
    ).to_bytes()).toString('hex'),
    tx_hash: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de5550',
    tx_index: 0,
    utxo_id: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de55500',
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
    address: Buffer.from(RustModule.WalletV4.Address.from_bech32(
      'addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'
    ).to_bytes()).toString('hex'),
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
  linearFee: RustModule.WalletV4.LinearFee,
  minimumUtxoVal: RustModule.WalletV4.BigNum,
  poolDeposit: RustModule.WalletV4.BigNum,
  keyDeposit: RustModule.WalletV4.BigNum,
  networkId: number,
  |} {
  return {
    linearFee: RustModule.WalletV4.LinearFee.new(
      RustModule.WalletV4.BigNum.from_str('2'),
      RustModule.WalletV4.BigNum.from_str('500'),
    ),
    minimumUtxoVal: RustModule.WalletV4.BigNum.from_str('1'),
    poolDeposit: RustModule.WalletV4.BigNum.from_str('500'),
    keyDeposit: RustModule.WalletV4.BigNum.from_str('500'),
    networkId: network.NetworkId,
  };
}

describe('Create unsigned TX from UTXO', () => {
  it('Should fail due to insufficient funds (bigger than all inputs)', () => {
    const sampleUtxos = genSampleUtxos();
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[1]];
    expect(() => newAdaUnsignedTxFromUtxo(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: '1900001', // bigger than input including fees
      }],
      undefined,
      utxos,
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      true,
    )).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (no inputs)', () => {
    expect(() => newAdaUnsignedTxFromUtxo(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: '1', // bigger than input including fees
      }],
      undefined,
      [],
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      true,
    )).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (not enough to cover fees)', () => {
    const sampleUtxos = genSampleUtxos();
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[0]];
    expect(() => newAdaUnsignedTxFromUtxo(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: '1', // bigger than input including fees
      }],
      undefined,
      utxos,
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      true,
    )).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (no outputs disallowed)', () => {
    const sampleUtxos = genSampleUtxos();
    const sampleAdaAddresses = genSampleAdaAddresses();
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[1]];

    // should fail because we disallow burning extra ADA in fees
    expect(() => newAdaUnsignedTxFromUtxo(
      [],
      sampleAdaAddresses[0],
      utxos,
      new BigNumber(0),
      {
        ...getProtocolParams(),
        minimumUtxoVal: RustModule.WalletV4.BigNum.from_str('999000'),
      },
      [],
      [],
      false,
    )).toThrow(NotEnoughMoneyToSendError);
    // should avoid failing by consuming the second UTXO
    expect(() => newAdaUnsignedTxFromUtxo(
      [],
      sampleAdaAddresses[0],
      [sampleUtxos[1], sampleUtxos[0]],
      new BigNumber(0),
      {
        ...getProtocolParams(),
        minimumUtxoVal: RustModule.WalletV4.BigNum.from_str('999000'),
      },
      [],
      [],
      false,
    )).not.toThrow(NotEnoughMoneyToSendError);
    // should pass because we can add a change
    expect(() => newAdaUnsignedTxFromUtxo(
      [],
      sampleAdaAddresses[0],
      utxos,
      new BigNumber(0),
      {
        ...getProtocolParams(),
        minimumUtxoVal: RustModule.WalletV4.BigNum.from_str('998500'),
      },
      [],
      [],
      false,
    )).not.toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to no outputs', () => {
    const sampleUtxos = genSampleUtxos();
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[1]];
    expect(() => newAdaUnsignedTxFromUtxo(
      [],
      undefined,
      utxos,
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      false,
    )).toThrow(NoOutputsError);
  });

  it('Should pick inputs when using input selection', () => {
    const utxos: Array<RemoteUnspentOutput> = genSampleUtxos();
    const sampleAdaAddresses = genSampleAdaAddresses();
    const unsignedTxResponse = newAdaUnsignedTxFromUtxo(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: '1001', // smaller than input
      }],
      sampleAdaAddresses[0],
      utxos,
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      true,
    );
    // input selection will only take 2 of the 3 inputs
    // it takes 2 inputs because input selection algorithm
    expect(unsignedTxResponse.senderUtxos).toEqual([utxos[0], utxos[1]]);
    expect(unsignedTxResponse.txBuilder.get_explicit_input().to_str()).toEqual('1000702');
    expect(unsignedTxResponse.txBuilder.get_explicit_output().to_str()).toEqual('999528');
    expect(unsignedTxResponse.txBuilder.min_fee().to_str()).toEqual('1166');
  });

  it('Should exclude inputs smaller than fee to include them', () => {
    const utxos: Array<RemoteUnspentOutput> = genSampleUtxos();
    const sampleAdaAddresses = genSampleAdaAddresses();
    const unsignedTxResponse = newAdaUnsignedTxFromUtxo(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: '1001', // smaller than input
      }],
      sampleAdaAddresses[0],
      [utxos[0], utxos[1]],
      new BigNumber(0),
      {
        linearFee: RustModule.WalletV4.LinearFee.new(
          // make sure the 1st utxo is excluded since it's too small
          RustModule.WalletV4.BigNum.from_str(
            new BigNumber(utxos[0].amount).plus(1).toString()
          ),
          RustModule.WalletV4.BigNum.from_str('500'),
        ),
        minimumUtxoVal: RustModule.WalletV4.BigNum.from_str('1'),
        poolDeposit: RustModule.WalletV4.BigNum.from_str('500'),
        keyDeposit: RustModule.WalletV4.BigNum.from_str('500'),
        networkId: network.NetworkId,
      },
      [],
      [],
      true,
    );
    // input selection will only take 2 of the 3 inputs
    // it takes 2 inputs because input selection algorithm
    expect(unsignedTxResponse.senderUtxos).toEqual([utxos[1]]);
    expect(unsignedTxResponse.txBuilder.get_explicit_input().to_str()).toEqual('1000001');
    expect(unsignedTxResponse.txBuilder.get_explicit_output().to_str()).toEqual('788199');
    expect(unsignedTxResponse.txBuilder.min_fee().to_str()).toEqual('208994');
  });
});

describe('Create unsigned TX from addresses', () => {
  it('Should create a valid transaction without selection', () => {
    const addressedUtxos = genAddressedUtxos();
    const unsignedTxResponse = newAdaUnsignedTx(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: '5001', // smaller than input
      }],
      undefined,
      [addressedUtxos[0], addressedUtxos[1]],
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      true,
    );
    expect(unsignedTxResponse.senderUtxos).toEqual([addressedUtxos[0], addressedUtxos[1]]);

    expect(unsignedTxResponse.txBuilder.get_explicit_input().to_str()).toEqual('1000702');
    expect(unsignedTxResponse.txBuilder.get_explicit_output().to_str()).toEqual('5001');
    expect(unsignedTxResponse.txBuilder.min_fee().to_str()).toEqual('1064');
    // burns remaining amount
    expect(
      unsignedTxResponse.txBuilder.get_explicit_input().checked_sub(
        unsignedTxResponse.txBuilder.get_explicit_output()
      ).to_str()
    ).toEqual(unsignedTxResponse.txBuilder.build().fee().to_str());
  });
});

describe('Create signed transactions', () => {
  it('Witness should match on valid private key', () => {
    const addressedUtxos = genAddressedUtxos();
    const unsignedTxResponse = newAdaUnsignedTx(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: '5001', // smaller than input
      }],
      undefined,
      [addressedUtxos[0], addressedUtxos[1]],
      new BigNumber(0),
      getProtocolParams(),
      [],
      [],
      true,
    );
    const signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBuilder> = {
      changeAddr: unsignedTxResponse.changeAddr,
      senderUtxos: unsignedTxResponse.senderUtxos,
      unsignedTx: unsignedTxResponse.txBuilder,
      certificate: undefined,
    };

    const accountPrivateKey = RustModule.WalletV4.Bip32PrivateKey.from_bytes(
      Buffer.from(
        '70afd5ff1f7f551c481b7e3f3541f7c63f5f6bcb293af92565af3deea0bcd6481a6e7b8acbe38f3906c63ccbe8b2d9b876572651ac5d2afc0aca284d9412bb1b4839bf02e1d990056d0f06af22ce4bcca52ac00f1074324aab96bbaaaccf290d',
        'hex'
      ),
    );
    const signedTx = signTransaction(
      signRequest,
      Bip44DerivationLevels.ACCOUNT.level,
      accountPrivateKey,
      new Set(),
      undefined,
    );
    const witnesses = signedTx.witness_set();

    expect(witnesses.vkeys()).toEqual(undefined);
    expect(witnesses.scripts()).toEqual(undefined);
    const bootstrapWits = witnesses.bootstraps();
    if (bootstrapWits == null) throw new Error('Bootstrap witnesses should not be null');
    expect(bootstrapWits.len()).toEqual(1);

    expect(Buffer.from(bootstrapWits.get(0).to_bytes()).toString('hex')).toEqual(
      '8458208fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c05840d4da0fe3615f90581926281be0510df5f6616ebed5a6d6831cceab4dd9935f7f5b6150d43b918d79e8db7cd3e17b9de91fdfbaed7cdab18818331942852fd10b58202623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e6241a0'
    );
  });

  it('Witness should with addressing from root', () => {
    const accountPrivateKey = RustModule.WalletV4.Bip32PrivateKey.from_bytes(
      Buffer.from(
        '70afd5ff1f7f551c481b7e3f3541f7c63f5f6bcb293af92565af3deea0bcd6481a6e7b8acbe38f3906c63ccbe8b2d9b876572651ac5d2afc0aca284d9412bb1b4839bf02e1d990056d0f06af22ce4bcca52ac00f1074324aab96bbaaaccf290d',
        'hex'
      ),
    );
    const inputs = RustModule.WalletV4.TransactionInputs.new();
    inputs.add(
      RustModule.WalletV4.TransactionInput.new(
        RustModule.WalletV4.TransactionHash.from_bytes(Buffer.from('05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f', 'hex')),
        0
      )
    );
    inputs.add(
      RustModule.WalletV4.TransactionInput.new(
        RustModule.WalletV4.TransactionHash.from_bytes(Buffer.from('6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe', 'hex')),
        0
      )
    );
    const outputs = RustModule.WalletV4.TransactionOutputs.new();
    outputs.add(
      RustModule.WalletV4.TransactionOutput.new(
        RustModule.WalletV4.Address.from_bytes(Buffer.from(byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'), 'hex')),
        RustModule.WalletV4.BigNum.from_str('5001')
      )
    );
    const txBody = RustModule.WalletV4.TransactionBody.new(
      inputs,
      outputs,
      RustModule.WalletV4.BigNum.from_str('1000'),
      0,
    );
    const signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBody> = {
      changeAddr: [],
      senderUtxos: [
        {
          amount: '7001',
          receiver: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          tx_hash: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
          tx_index: 0,
          utxo_id: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f0',
          addressing: {
            path: [WalletTypePurpose.BIP44, CoinTypes.CARDANO, HARD_DERIVATION_START + 0, 0, 135],
            startLevel: 1
          }
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
          }
        }
      ],
      unsignedTx: txBody,
      certificate: undefined,
    };

    const signedTx = signTransaction(
      signRequest,
      Bip44DerivationLevels.ACCOUNT.level,
      accountPrivateKey,
      new Set(),
      undefined,
    );
    const witnesses = signedTx.witness_set();

    expect(witnesses.vkeys()).toEqual(undefined);
    expect(witnesses.scripts()).toEqual(undefined);
    const bootstrapWits = witnesses.bootstraps();
    if (bootstrapWits == null) throw new Error('Bootstrap witnesses should not be null');
    expect(bootstrapWits.len()).toEqual(1); // note: only one witness since we got rid of duplicates

    expect(Buffer.from(bootstrapWits.get(0).to_bytes()).toString('hex')).toEqual(
      '8458208fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c058401edebb108c74a991bef5b28458778fc0713499349d77fb98acc63e4219cfcd1b51321ccaccdf2ce2e80d7c2687f3d79feea32daedcfbc19792dff0358af5950358202623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e6241a0'
    );
  });

  it('Transaction should support certificates', () => {
    const accountPrivateKey = RustModule.WalletV4.Bip32PrivateKey.from_bytes(
      Buffer.from(
        '408a1cb637d615c49e8696c30dd54883302a20a7b9b8a9d1c307d2ed3cd50758c9402acd000461a8fc0f25728666e6d3b86d031b8eea8d2f69b21e8aa6ba2b153e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
        'hex',
      ),
    );
    const stakingKey = accountPrivateKey.derive(2).derive(STAKING_KEY_INDEX).to_raw_key();

    const addressedUtxos = genAddressedUtxos();
    const unsignedTxResponse = newAdaUnsignedTx(
      [{
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        amount: '5001', // smaller than input
      }],
      undefined,
      [addressedUtxos[3]],
      new BigNumber(0),
      getProtocolParams(),
      [
        RustModule.WalletV4.Certificate.new_stake_registration(
          RustModule.WalletV4.StakeRegistration.new(
            RustModule.WalletV4.StakeCredential.from_keyhash(stakingKey.to_public().hash())
          )
        ),
        RustModule.WalletV4.Certificate.new_stake_delegation(
          RustModule.WalletV4.StakeDelegation.new(
            RustModule.WalletV4.StakeCredential.from_keyhash(stakingKey.to_public().hash()),
            RustModule.WalletV4.Ed25519KeyHash.from_bytes(Buffer.from('1b268f4cba3faa7e36d8a0cc4adca2096fb856119412ee7330f692b5', 'hex'))
          )
        ),
      ],
      [],
      true,
    );
    const signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBuilder> = {
      changeAddr: unsignedTxResponse.changeAddr,
      senderUtxos: unsignedTxResponse.senderUtxos,
      unsignedTx: unsignedTxResponse.txBuilder,
      certificate: undefined,
    };
    const signedTx = signTransaction(
      signRequest,
      Bip44DerivationLevels.ACCOUNT.level,
      accountPrivateKey,
      new Set([Buffer.from(
        RustModule.WalletV4.make_vkey_witness(
          RustModule.WalletV4.hash_transaction(
            signRequest.unsignedTx.build()
          ),
          stakingKey,
        ).to_bytes()
      ).toString('hex')]),
      undefined,
    );
    const witnesses = signedTx.witness_set();

    const vKeyWits = witnesses.vkeys();
    if (vKeyWits == null) throw new Error('Vkey witnesses should not be null');
    expect(vKeyWits.len()).toEqual(2);
    expect(witnesses.scripts()).toEqual(undefined);
    expect(witnesses.bootstraps()).toEqual(undefined);

    // set is used so order not defined so we sort the list
    const witArray = [
      Buffer.from(vKeyWits.get(0).to_bytes()).toString('hex'),
      Buffer.from(vKeyWits.get(1).to_bytes()).toString('hex')
    ].sort();

    expect(witArray).toEqual([
      '82582001c01f8b958699ae769a246e9785db5a70e023977ea4b856dfacf23c23346caf58401b10a18433be709391e70a82c4de91d1c8b3cb27dfa7c7d19a247a4dfe5dea437a0ebefe3ced5f6f7ad2bc79b11c5556614f8bec19b87fc5145a13edc3ae320f',
      '82582038c14a0756e1743081a8ebfdb9169b11283a7bf6c38045c4c4a5e62a7689639d58403a56ed05738ec98589a1263281bfd33ec5f0bed3f90eafced8ed8652be65f3327487cb487dde0d26ca9a7ce568a4c05367630baec47a5d771ba7b184161b100d',
    ]);
  });

  it('Transaction should support withdrawals', () => {
    const accountPrivateKey = RustModule.WalletV4.Bip32PrivateKey.from_bytes(
      Buffer.from(
        '408a1cb637d615c49e8696c30dd54883302a20a7b9b8a9d1c307d2ed3cd50758c9402acd000461a8fc0f25728666e6d3b86d031b8eea8d2f69b21e8aa6ba2b153e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
        'hex',
      ),
    );
    const stakingKey = accountPrivateKey.derive(2).derive(STAKING_KEY_INDEX).to_raw_key();
    const stakingKeyCredential = RustModule.WalletV4.StakeCredential.from_keyhash(
      stakingKey.to_public().hash()
    );

    if (network.BaseConfig[0].ChainNetworkId == null) {
      throw new Error(`missing network id`);
    }

    const protocolParams = getProtocolParams();
    const withdrawAmount = '1000000';
    const addressedUtxos = genAddressedUtxos();
    const sampleAdaAddresses = genSampleAdaAddresses();
    const unsignedTxResponse = newAdaUnsignedTx(
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
    );
    const signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBuilder> = {
      changeAddr: unsignedTxResponse.changeAddr,
      senderUtxos: unsignedTxResponse.senderUtxos,
      unsignedTx: unsignedTxResponse.txBuilder,
      certificate: undefined,
    };
    const signedTx = signTransaction(
      signRequest,
      Bip44DerivationLevels.ACCOUNT.level,
      accountPrivateKey,
      new Set([Buffer.from(
        RustModule.WalletV4.make_vkey_witness(
          RustModule.WalletV4.hash_transaction(
            signRequest.unsignedTx.build()
          ),
          stakingKey,
        ).to_bytes()
      ).toString('hex')]),
      undefined,
    );
    const witnesses = signedTx.witness_set();

    const vKeyWits = witnesses.vkeys();
    if (vKeyWits == null) throw new Error('Vkey witnesses should not be null');
    expect(vKeyWits.len()).toEqual(2);
    expect(witnesses.scripts()).toEqual(undefined);
    expect(witnesses.bootstraps()).toEqual(undefined);

    const txBody = unsignedTxResponse.txBuilder.build();
    expect(txBody.withdrawals()?.len()).toEqual(1);
    const fee = txBody.fee().to_str();
    expect(fee).toEqual('1310');
    expect(txBody.outputs().len()).toEqual(1);
    expect(txBody.outputs().get(0).amount().to_str()).toEqual(
      new BigNumber(addressedUtxos[3].amount)
        .minus(fee)
        .plus(withdrawAmount)
        .plus(protocolParams.keyDeposit.to_str())
        .toString()
    );

    // set is used so order not defined so we sort the list
    const witArray = [
      Buffer.from(vKeyWits.get(0).to_bytes()).toString('hex'),
      Buffer.from(vKeyWits.get(1).to_bytes()).toString('hex')
    ].sort();

    expect(witArray).toEqual([
      '82582001c01f8b958699ae769a246e9785db5a70e023977ea4b856dfacf23c23346caf5840ed278dd61c950a8e8c8a5252dd028ac5ccde0571be351bd84e7d363071bb852ae803d5cd882036d3d6495a3a20078c3843c15be6c76236bc5f25f432acf3f108',
      '82582038c14a0756e1743081a8ebfdb9169b11283a7bf6c38045c4c4a5e62a7689639d5840f533e0d1bad015c5b2f409309405c58ae27f5da6b38e24f3e7b92faba77dee0021865d6a2b70dcc3cb5b816469affd42f0aff83edf5c4773c861ee0255991f03',
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
        getProtocolParams(),
      );

      expect(sendAllResponse.senderUtxos).toEqual([utxos[0], utxos[1]]);
      expect(sendAllResponse.txBuilder.get_explicit_input().to_str()).toEqual('11000002');
      expect(sendAllResponse.txBuilder.get_explicit_output().to_str()).toEqual('10998652');
      expect(sendAllResponse.txBuilder.min_fee().to_str()).toEqual('1342');
      // make sure we don't accidentally burn a lot of coins
      expect(
        sendAllResponse.txBuilder.get_explicit_input().checked_sub(
          sendAllResponse.txBuilder.get_explicit_output()
        ).to_str()
      ).toEqual('1350');
    });
  });

  it('Should fail due to insufficient funds (no inputs)', () => {
    expect(() => sendAllUnsignedTxFromUtxo(
      {
        address: byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      },
      [],
      new BigNumber(0),
      getProtocolParams(),
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
      getProtocolParams(),
    )).toThrow(NotEnoughMoneyToSendError);
  });

});
