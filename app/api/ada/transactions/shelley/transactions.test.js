// @flow
import '../../lib/test-config';

import { schema } from 'lovefield';
import BigNumber from 'bignumber.js';
import type {
  AddressedUtxo,
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
} from '../../errors';

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
} from '../../../../config/numbersConfig';

const genSampleUtxos: void => Array<RemoteUnspentOutput> = () => [
  {
    amount: '7001',
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
];
const genAddressedUtxos: void => Array<AddressedUtxo> = () => {
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

describe('Create unsigned TX from UTXO', () => {
  it('Should fail due to insufficient funds (bigger than all inputs)', () => {
    const sampleUtxos = genSampleUtxos();
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[1]];
    expect(() => newAdaUnsignedTxFromUtxo(
      byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      '1900001', // bigger than input including fees
      undefined,
      utxos,
      new BigNumber(0),
    )).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (no inputs)', () => {
    expect(() => newAdaUnsignedTxFromUtxo(
      byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      '1', // bigger than input including fees
      undefined,
      [],
      new BigNumber(0),
    )).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (not enough to cover fees)', () => {
    const sampleUtxos = genSampleUtxos();
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[0]];
    expect(() => newAdaUnsignedTxFromUtxo(
      byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      '1', // bigger than input including fees
      undefined,
      utxos,
      new BigNumber(0),
    )).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should pick inputs when using input selection', () => {
    const utxos: Array<RemoteUnspentOutput> = genSampleUtxos();
    const sampleAdaAddresses = genSampleAdaAddresses();
    const unsignedTxResponse = newAdaUnsignedTxFromUtxo(
      byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      '1001', // smaller than input
      sampleAdaAddresses[0],
      utxos,
      new BigNumber(0),
    );
    // input selection will only take 2 of the 3 inputs
    // it takes 2 inputs because input selection algorithm
    expect(unsignedTxResponse.senderUtxos).toEqual([utxos[0], utxos[1]]);
    expect(unsignedTxResponse.txBuilder.get_input_total().to_str()).toEqual('1007002');
    expect(unsignedTxResponse.txBuilder.get_feeless_output_total().to_str()).toEqual('821500');
    expect(unsignedTxResponse.txBuilder.calc_fee().to_str()).toEqual('184002');
  });
});


describe('Create unsigned TX from addresses', () => {
  it('Should create a valid transaction without selection', () => {
    const addressedUtxos = genAddressedUtxos();
    const unsignedTxResponse = newAdaUnsignedTx(
      byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      '5001', // smaller than input
      undefined,
      [addressedUtxos[0], addressedUtxos[1]],
      new BigNumber(0),
    );
    expect(unsignedTxResponse.senderUtxos).toEqual([addressedUtxos[0], addressedUtxos[1]]);

    expect(unsignedTxResponse.txBuilder.get_input_total().to_str()).toEqual('1007002');
    expect(unsignedTxResponse.txBuilder.get_feeless_output_total().to_str()).toEqual('5001');
    expect(unsignedTxResponse.txBuilder.calc_fee().to_str()).toEqual('151502');
    // burns remaining amount
    expect(
      unsignedTxResponse.txBuilder.get_input_total().checked_sub(
        unsignedTxResponse.txBuilder.get_feeless_output_total()
      ).to_str()
    ).toEqual('1002001');
  });
});

describe('Create signed transactions', () => {
  it('Witness should match on valid private key', () => {
    const addressedUtxos = genAddressedUtxos();
    const unsignedTxResponse = newAdaUnsignedTx(
      byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      '5001', // smaller than input
      undefined,
      [addressedUtxos[0], addressedUtxos[1]],
      new BigNumber(0),
    );
    const signRequest = {
      changeAddr: unsignedTxResponse.changeAddr,
      senderUtxos: unsignedTxResponse.senderUtxos,
      unsignedTx: unsignedTxResponse.txBuilder.build(),
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
      undefined,
    );
    const witnesses = signedTx.witness_set();

    expect(witnesses.vkeys()).toEqual(undefined);
    expect(witnesses.scripts()).toEqual(undefined);
    const bootstrapWits = witnesses.bootstraps();
    if (bootstrapWits == null) throw new Error('Bootstrap witnesses should not be null');
    expect(bootstrapWits.len()).toEqual(1);

    expect(Buffer.from(bootstrapWits.get(0).to_bytes()).toString('hex')).toEqual(
      '8558208fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c058408202a668af7b2c435d9bca847785fa327eb81e149518aa3596cd407f898b94f86ef68ca3c34f57a11ee80c90ec856f5e99d4e0170bc2e836327280dee522140c58202623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e624683008200525441a0'
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
    const signRequest = {
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
    );
    const witnesses = signedTx.witness_set();

    expect(witnesses.vkeys()).toEqual(undefined);
    expect(witnesses.scripts()).toEqual(undefined);
    const bootstrapWits = witnesses.bootstraps();
    if (bootstrapWits == null) throw new Error('Bootstrap witnesses should not be null');
    expect(bootstrapWits.len()).toEqual(1);

    expect(Buffer.from(bootstrapWits.get(0).to_bytes()).toString('hex')).toEqual(
      '8558208fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c058401edebb108c74a991bef5b28458778fc0713499349d77fb98acc63e4219cfcd1b51321ccaccdf2ce2e80d7c2687f3d79feea32daedcfbc19792dff0358af5950358202623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e624683008200525441a0'
    );
  });
});

describe('Create sendAll unsigned TX from UTXO', () => {
  describe('Create send-all TX from UTXO', () => {
    it('Create a transaction involving all input with no change', () => {
      const sampleUtxos = genSampleUtxos();
      const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[1], sampleUtxos[2]];
      const sendAllResponse = sendAllUnsignedTxFromUtxo(
        byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        utxos,
        new BigNumber(0),
      );

      expect(sendAllResponse.senderUtxos).toEqual([utxos[0], utxos[1]]);
      expect(sendAllResponse.txBuilder.get_input_total().to_str()).toEqual('11000002');
      expect(sendAllResponse.txBuilder.get_feeless_output_total().to_str()).toEqual('10775000');
      expect(sendAllResponse.txBuilder.calc_fee().to_str()).toEqual('223502');
      // make sure we don't accidentally burn a lot of coins
      expect(
        sendAllResponse.txBuilder.get_input_total().checked_sub(
          sendAllResponse.txBuilder.get_feeless_output_total()
        ).to_str()
      ).toEqual('225002');
    });
  });

  it('Should fail due to insufficient funds (no inputs)', () => {
    expect(() => sendAllUnsignedTxFromUtxo(
      byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      [],
      new BigNumber(0),
    )).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (not enough to cover fees)', () => {
    const sampleUtxos = genSampleUtxos();
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[0]];
    expect(() => sendAllUnsignedTxFromUtxo(
      byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      utxos,
      new BigNumber(0),
    )).toThrow(NotEnoughMoneyToSendError);
  });

});
