// @flow
import '../../lib/test-config';
import { schema } from 'lovefield';
import type {
  AddressedUtxo,
} from '../types';
import type {
  RemoteUnspentOutput,
} from '../../lib/state-fetch/types';
import {
  newAdaUnsignedTx,
  newAdaUnsignedTxFromUtxo,
  sendAllUnsignedTxFromUtxo,
  signTransaction,
} from './utxoTransactions';
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

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import {
  HARD_DERIVATION_START,
  CoinTypes,
  WalletTypePurpose,
} from '../../../../config/numbersConfig';
import {
  getTxInputTotal,
  getTxOutputTotal,
} from './utils';

const keys = [
  {
    legacyAddress: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    bechAddress: 'ca1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqeh83d4',
    pubKey: '8fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c02623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e62',
  },
  {
    legacyAddress: 'Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN',
    bechAddress: 'ca1q0j6cetm7zqsagm5zz5fmav9jg37n4cferj23h370kptrpfj095fxcy43lj',
    pubKey: 'e5ac657bf0810ea37410a89df5859223e9d709c8e4a8de3e7d82b185327968939a254def91bb75e94bda9c605f7f87481082742e1e51d8858965c9a40491fc94',
  },
  {
    legacyAddress: 'Ae2tdPwUPEZEtwz7LKtJn9ub8y7ireuj3sq2yUCZ57ccj6ZkJKn7xEiApV9',
    bechAddress: 'ca1q0ewtxsk489t9g7vs64prkm0hfvz6aemtvtv57rkfwmxyp3yhtxtwhtm3gd',
    pubKey: 'f2e59a16a9cab2a3cc86aa11db6fba582d773b5b16ca78764bb6620624baccb7c03adf6448459f2b8d5c32033a160de8b5412d1952794190c4fc6b4716a8b8eb',
  }
];

const sampleUtxos: Array<RemoteUnspentOutput> = [
  {
    amount: '7001',
    receiver: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    tx_hash: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
    tx_index: 0,
    utxo_id: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f0',
  },
  {
    amount: '1000001',
    receiver: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
  },
  {
    amount: '10000001',
    receiver: 'Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN',
    tx_hash: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a173',
    tx_index: 0,
    utxo_id: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a1730',
  },
];

const sampleAdaAddresses: Array<{| ...Address, ...Addressing |}> = [
  {
    address: 'ca1q0ewtxsk489t9g7vs64prkm0hfvz6aemtvtv57rkfwmxyp3yhtxtwhtm3gd',
    addressing: {
      path: [1, 11],
      startLevel: Bip44DerivationLevels.CHAIN.level,
    },
  },
  {
    address: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    addressing: {
      path: [0, 135],
      startLevel: Bip44DerivationLevels.CHAIN.level,
    },
  },
  {
    address: 'Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN',
    addressing: {
      path: [0, 134],
      startLevel: Bip44DerivationLevels.CHAIN.level,
    },
  },
];
const addresssingMap = new Map<string, Addressing>();
for (const address of sampleAdaAddresses) {
  addresssingMap.set(address.address, { addressing: address.addressing });
}
const addressedUtxos: Array<AddressedUtxo> = sampleUtxos.map(utxo => {
  const addressing = addresssingMap.get(utxo.receiver);
  if (addressing == null) throw new Error('Should never happen');
  return {
    ...utxo,
    ...addressing,
  };
});

beforeAll(async () => {
  await RustModule.load();
  await loadLovefieldDB(schema.DataStoreType.MEMORY);
});

describe('Create unsigned TX from UTXO', () => {
  it('Should create a valid transaction withhout selection', () => {
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[1]];
    const unsignedTxResponse = newAdaUnsignedTxFromUtxo(
      keys[0].bechAddress,
      '5001', // smaller than input
      [],
      utxos
    );
    expect(unsignedTxResponse.senderUtxos).toEqual(utxos);
    const inputSum = getTxInputTotal(unsignedTxResponse.IOs, false);
    const outputSum = getTxOutputTotal(unsignedTxResponse.IOs, false);
    expect(inputSum.toString()).toEqual('1000001');
    expect(outputSum.toString()).toEqual('5001');
    expect(inputSum.minus(outputSum).toString()).toEqual('995000');
  });

  it('Should fail due to insufficient funds (bigger than all inputs)', () => {
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[1]];
    expect(() => newAdaUnsignedTxFromUtxo(
      keys[0].bechAddress,
      '1900001', // bigger than input including fees
      [],
      utxos
    )).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (no inputs)', () => {
    expect(() => newAdaUnsignedTxFromUtxo(
      keys[0].bechAddress,
      '1', // bigger than input including fees
      [],
      [],
    )).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (not enough to cover fees)', () => {
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[0]];
    expect(() => newAdaUnsignedTxFromUtxo(
      keys[0].bechAddress,
      '1', // bigger than input including fees
      [],
      utxos,
    )).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should pick inputs when using input selection', () => {
    const utxos: Array<RemoteUnspentOutput> = sampleUtxos;
    const unsignedTxResponse = newAdaUnsignedTxFromUtxo(
      keys[0].bechAddress,
      '1001', // smaller than input
      [sampleAdaAddresses[0]],
      utxos
    );
    // input selection will only take 2 of the 3 inputs
    // it takes 2 inputs because input selection algorithm
    expect(unsignedTxResponse.senderUtxos).toEqual([utxos[0], utxos[1]]);
    const inputSum = getTxInputTotal(unsignedTxResponse.IOs, false);
    const outputSum = getTxOutputTotal(unsignedTxResponse.IOs, false);
    expect(inputSum.toString()).toEqual('1007002');
    expect(outputSum.toString()).toEqual('851617');
    expect(inputSum.minus(outputSum).toString()).toEqual('155385');
  });
});

describe('Create unsigned TX from addressed UTXOs', () => {
  it('Should create a valid transaction withhout selection', () => {
    const unsignedTxResponse = newAdaUnsignedTx(
      keys[0].bechAddress,
      '5001', // smaller than input
      [],
      [addressedUtxos[0], addressedUtxos[1]],
    );
    expect(unsignedTxResponse.senderUtxos).toEqual([addressedUtxos[0], addressedUtxos[1]]);
    const inputSum = getTxInputTotal(unsignedTxResponse.IOs, false);
    const outputSum = getTxOutputTotal(unsignedTxResponse.IOs, false);
    expect(inputSum.toString()).toEqual('1007002');
    expect(outputSum.toString()).toEqual('5001');
    expect(inputSum.minus(outputSum).toString()).toEqual('1002001');
  });
});

describe('Create signed transactions with legacy witness', () => {
  it('Witness should match on valid private key', () => {
    const unsignedTxResponse = newAdaUnsignedTx(
      keys[0].bechAddress,
      '5001', // smaller than input
      [],
      [addressedUtxos[0], addressedUtxos[1]],
    );
    const accountPrivateKey = RustModule.WalletV3.Bip32PrivateKey.from_bytes(
      Buffer.from(
        '70afd5ff1f7f551c481b7e3f3541f7c63f5f6bcb293af92565af3deea0bcd6481a6e7b8acbe38f3906c63ccbe8b2d9b876572651ac5d2afc0aca284d9412bb1b4839bf02e1d990056d0f06af22ce4bcca52ac00f1074324aab96bbaaaccf290d',
        'hex',
      ),
    );
    const fragment = signTransaction(
      unsignedTxResponse,
      Bip44DerivationLevels.ACCOUNT.level,
      accountPrivateKey,
      true,
    );
    const signedTx = fragment.get_transaction();
    const witnesses = signedTx.witnesses();

    expect(witnesses.size()).toEqual(2);
    expect(witnesses.get(0).to_bech32()).toEqual(
      'witness1qz8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqf3rln4edvr5ppf35h9jt86ns3dr344k3y5w0sx8uwg0qa296rnzmjrqu3hs58hxk5l84n6luszrts7xzjwglzfzeskt4qdajh9zyfevevna69rev3qvkt4wvmwc7xljxn6qghhu3zt92jlx9095dn7jszcmr9n5s'
    );
    expect(witnesses.get(1).to_bech32()).toEqual(
      'witness1qz8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqf3rln4edvr5ppf35h9jt86ns3dr344k3y5w0sx8uwg0qa296rnzmjrqu3hs58hxk5l84n6luszrts7xzjwglzfzeskt4qdajh9zyfevevna69rev3qvkt4wvmwc7xljxn6qghhu3zt92jlx9095dn7jszcmr9n5s'
    );
  });
});

describe('Create signed transactions', () => {
  it('Witness should match on valid private key', () => {
    const unsignedTxResponse = newAdaUnsignedTx(
      keys[0].bechAddress,
      '5001', // smaller than input
      [],
      [addressedUtxos[0], addressedUtxos[1]],
    );

    const accountPrivateKey = RustModule.WalletV3.Bip32PrivateKey.from_bytes(
      Buffer.from(
        '70afd5ff1f7f551c481b7e3f3541f7c63f5f6bcb293af92565af3deea0bcd6481a6e7b8acbe38f3906c63ccbe8b2d9b876572651ac5d2afc0aca284d9412bb1b4839bf02e1d990056d0f06af22ce4bcca52ac00f1074324aab96bbaaaccf290d',
        'hex',
      ),
    );
    const fragment = signTransaction(
      unsignedTxResponse,
      Bip44DerivationLevels.ACCOUNT.level,
      accountPrivateKey,
      false,
    );
    const signedTx = fragment.get_transaction();
    const witnesses = signedTx.witnesses();

    expect(witnesses.size()).toEqual(2);
    expect(witnesses.get(0).to_bech32()).toEqual(
      'witness1q8wgvrjx7zs7u66nu7k0tljqgdwrcc2ferufytxzew5phk2u5g389n9j0hg509jypjew4endmrcm7g60gpz7ljyfv42tuc4uk3k062qt3pew9w'
    );
    expect(witnesses.get(1).to_bech32()).toEqual(
      'witness1q8wgvrjx7zs7u66nu7k0tljqgdwrcc2ferufytxzew5phk2u5g389n9j0hg509jypjew4endmrcm7g60gpz7ljyfv42tuc4uk3k062qt3pew9w'
    );
  });

  it('Witness should match with addressing from root', () => {
    const unsignedTxResponse = newAdaUnsignedTx(
      keys[0].bechAddress,
      '5001', // smaller than input
      [],
      [
        {
          amount: '7001',
          receiver: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
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
          receiver: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
          tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
          tx_index: 0,
          utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
          addressing: {
            path: [WalletTypePurpose.BIP44, CoinTypes.CARDANO, HARD_DERIVATION_START + 0, 0, 135],
            startLevel: 1
          }
        }
      ],
    );

    const accountPrivateKey = RustModule.WalletV3.Bip32PrivateKey.from_bytes(
      Buffer.from(
        '70afd5ff1f7f551c481b7e3f3541f7c63f5f6bcb293af92565af3deea0bcd6481a6e7b8acbe38f3906c63ccbe8b2d9b876572651ac5d2afc0aca284d9412bb1b4839bf02e1d990056d0f06af22ce4bcca52ac00f1074324aab96bbaaaccf290d',
        'hex',
      ),
    );
    const fragment = signTransaction(
      unsignedTxResponse,
      Bip44DerivationLevels.ACCOUNT.level,
      accountPrivateKey,
      false,
    );
    const signedTx = fragment.get_transaction();
    const witnesses = signedTx.witnesses();

    expect(witnesses.size()).toEqual(2);
    expect(witnesses.get(0).to_bech32()).toEqual(
      'witness1q8wgvrjx7zs7u66nu7k0tljqgdwrcc2ferufytxzew5phk2u5g389n9j0hg509jypjew4endmrcm7g60gpz7ljyfv42tuc4uk3k062qt3pew9w'
    );
    expect(witnesses.get(1).to_bech32()).toEqual(
      'witness1q8wgvrjx7zs7u66nu7k0tljqgdwrcc2ferufytxzew5phk2u5g389n9j0hg509jypjew4endmrcm7g60gpz7ljyfv42tuc4uk3k062qt3pew9w'
    );
  });

  it('Transaction with a certificate is also valid', () => {
    const unsignedTxResponse = newAdaUnsignedTx(
      'ca1sw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguq9rance',
      '5000', // smaller than input
      [{
        address: 'addr1s5quq8utjkrfntnkngjxa9u9mdd8pcprjal2fwzkm7k0y0prx3k276qm0j8',
        addressing: {
          path: [1, 0],
          startLevel: Bip44DerivationLevels.CHAIN.level,
        },
      }],
      [{
        amount: '2000000',
        receiver: 'ca1ssuvzjs82mshgvyp4r4lmwgknvgjswnm7mpcq3wycjj7v2nk393e6qwqr79etp5e4emf5frwj7zakknsuq3ewl4yhptdlt8j8s3ngm906x2vwl',
        tx_hash: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de5550',
        tx_index: 0,
        utxo_id: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de55500',
        addressing: {
          path: [0, 0],
          startLevel: Bip44DerivationLevels.CHAIN.level,
        },
      }],
    );

    const accountPrivateKey = RustModule.WalletV3.Bip32PrivateKey.from_bytes(
      Buffer.from(
        '408a1cb637d615c49e8696c30dd54883302a20a7b9b8a9d1c307d2ed3cd50758c9402acd000461a8fc0f25728666e6d3b86d031b8eea8d2f69b21e8aa6ba2b153e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
        'hex',
      ),
    );
    const stakingKey = accountPrivateKey.derive(2).derive(0).to_raw_key();
    const certificate = RustModule.WalletV3.Certificate.stake_delegation(
      RustModule.WalletV3.StakeDelegation.new(
        RustModule.WalletV3.DelegationType.full(
          RustModule.WalletV3.PoolId.from_hex('312e3d449038372ba2fc3300cfedf1b152ae739201b3e5da47ab3f933a421b62')
        ),
        stakingKey.to_public()
      )
    );
    const fragment = signTransaction(
      unsignedTxResponse,
      Bip44DerivationLevels.ACCOUNT.level,
      accountPrivateKey,
      false,
      {
        stakingKey,
        certificate,
      }
    );
    const signedTx = fragment.get_transaction();

    const inputs = signedTx.inputs();
    expect(inputs.size()).toEqual(1);
    expect(inputs.get(0).value().to_str()).toEqual('2000000');
    const pointer = inputs.get(0).get_utxo_pointer();
    expect(Buffer.from(pointer.fragment_id().as_bytes()).toString('hex')).toEqual('86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de5550');
    expect(pointer.output_index()).toEqual(0);

    const outputs = signedTx.outputs();
    expect(outputs.size()).toEqual(2);
    const change = outputs.get(1);
    expect(change.address().to_string('addr')).toEqual('addr1s5quq8utjkrfntnkngjxa9u9mdd8pcprjal2fwzkm7k0y0prx3k276qm0j8');
    expect(change.value().to_str()).toEqual('1839616');

    expect(Buffer.from(fragment.id().as_bytes()).toString('hex')).toEqual('c83ef43e02d8286c67df55ae179dde18f22debeb3e7bf87d3ad9d620b1d97763');
    expect(Buffer.from(fragment.get_transaction().id().as_bytes()).toString('hex')).toEqual('314ea630977b20d21cc2dc8f861dc9bcfa2013dcbc32c75288d7a5067274662d');

    const witnesses = signedTx.witnesses();
    expect(witnesses.size()).toEqual(1);
    expect(witnesses.get(0).to_bech32()).toEqual(
      'witness1q9f0f9ekhwgnd8rkmaq0zst0ef48sd4fqhdvjfrylwcdkyuragsq4nvhwttxu6q7y50vcurwgmn7jy2438x6azzjtfhxdelzdcvayvcwqyjwtc'
    );
  });
});

describe('Create sendAll unsigned TX from UTXO', () => {
  it('Create a transaction involving all input with no change', () => {
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[1], sampleUtxos[2]];
    const sendAllResponse = sendAllUnsignedTxFromUtxo(
      keys[0].bechAddress,
      utxos,
    );

    expect(sendAllResponse.senderUtxos).toEqual([utxos[0], utxos[1]]);
    const inputSum = getTxInputTotal(sendAllResponse.IOs, false);
    const outputSum = getTxOutputTotal(sendAllResponse.IOs, false);
    expect(inputSum.toString()).toEqual('11000002');
    expect(outputSum.toString()).toEqual('10844618');
    expect(inputSum.minus(outputSum).toString()).toEqual('155384');
  });

  it('Should fail due to insufficient funds (no inputs)', () => {
    expect(() => sendAllUnsignedTxFromUtxo(
      keys[0].bechAddress,
      [],
    )).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (not enough to cover fees)', () => {
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[0]];
    expect(() => sendAllUnsignedTxFromUtxo(
      keys[0].bechAddress,
      utxos,
    )).toThrow(NotEnoughMoneyToSendError);
  });
});
