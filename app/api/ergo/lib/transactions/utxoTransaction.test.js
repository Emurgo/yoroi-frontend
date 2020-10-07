// @flow
import '../../../ada/lib/test-config';

import { schema } from 'lovefield';
import BigNumber from 'bignumber.js';
import type {
  ErgoAddressedUtxo,
} from './types';
import type { RemoteUnspentOutput } from '../state-fetch/types';
import {
  newErgoUnsignedTx,
  newErgoUnsignedTxFromUtxo,
  sendAllUnsignedTxFromUtxo,
  signTransaction,
} from './utxoTransaction';
import {
  NotEnoughMoneyToSendError,
} from '../../../common/errors';

import {
  loadLovefieldDB,
} from '../../../ada/lib/storage/database/index';
import {
  Bip44DerivationLevels,
} from '../../../ada/lib/storage/database/walletTypes/bip44/api/utils';
import type {
  Address, Addressing
} from '../../../ada/lib/storage/models/PublicDeriver/interfaces';

import {
  HARD_DERIVATION_START,
  CoinTypes,
  WalletTypePurpose,
  ChainDerivations,
} from '../../../../config/numbersConfig';
import {
  networks,
  getErgoBaseConfig,
} from '../../../ada/lib/storage/database/prepackaged/networks';
import { decode, } from 'bs58';
import { ErgoTxSignRequest } from './ErgoTxSignRequest';
import { derivePath } from '../../../common/lib/crypto/keys/keyRepository';
import { generateWalletRootKey } from '../crypto/wallet';
import { Address as ErgoAddress, verify, Serializer } from '@coinbarn/ergo-ts';

const network = networks.ErgoMainnet;

const genSampleUtxos: void => Array<RemoteUnspentOutput> = () => [
  {
    amount: '100001',
    receiver: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex'),
    tx_hash: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
    tx_index: 0,
    creationHeight: 1,
    boxId: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f0',
    ergoTree: ErgoAddress.fromBase58('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').ergoTree,
  },
  {
    amount: '1000001',
    receiver: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex'),
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    creationHeight: 2,
    boxId: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
    ergoTree: ErgoAddress.fromBase58('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').ergoTree,
  },
  {
    amount: '10000001',
    receiver: decode('9iEqML45XncjkVtkrMFysY6qdKWhJs6fd3BNy7ExAVhTsaZemdF').toString('hex'),
    tx_hash: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a173',
    tx_index: 0,
    creationHeight: 3,
    boxId: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a1730',
    ergoTree: ErgoAddress.fromBase58('9iEqML45XncjkVtkrMFysY6qdKWhJs6fd3BNy7ExAVhTsaZemdF').ergoTree,
  },
  {
    amount: '20000000',
    receiver: decode('9hkTdcLcWqQxYQ3qexRb7MpZniDusrUr6R2Hp48cJU6H4Npq6jC').toString('hex'),
    tx_hash: '0df0273e382739f8b4ae3783d81168093e78e0b49ec2c5430ff03d444806a173',
    tx_index: 0,
    creationHeight: 4,
    boxId: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff04d444806a1730',
    ergoTree: ErgoAddress.fromBase58('9hkTdcLcWqQxYQ3qexRb7MpZniDusrUr6R2Hp48cJU6H4Npq6jC').ergoTree,
    assets: [{
      tokenId: '13d24a67432d447e53118d920100c747abb52da8da646bc193f03b47b64a8ac5',
      amount: 10000,
    }],
  },
];
const genSampleErgoAddresses: void => Array<{| ...Address, ...Addressing |}> = () => [
  {
    address: decode('9f7JBsnEV7LEmxBkGgYfK4U39Crpwb5oNFJoHFcLbqteZxEdy2U').toString('hex'),
    addressing: {
      path: [4],
      startLevel: Bip44DerivationLevels.ADDRESS.level,
    },
  },
  {
    address: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex'),
    addressing: {
      path: [2],
      startLevel: Bip44DerivationLevels.ADDRESS.level,
    },
  },
  {
    address: decode('9iEqML45XncjkVtkrMFysY6qdKWhJs6fd3BNy7ExAVhTsaZemdF').toString('hex'),
    addressing: {
      path: [1],
      startLevel: Bip44DerivationLevels.ADDRESS.level,
    },
  },
  {
    address: decode('9hkTdcLcWqQxYQ3qexRb7MpZniDusrUr6R2Hp48cJU6H4Npq6jC').toString('hex'),
    addressing: {
      path: [5],
      startLevel: Bip44DerivationLevels.ADDRESS.level,
    },
  },
];
const genAddressedUtxos: void => Array<ErgoAddressedUtxo> = () => {
  const addressingMap = new Map<string, Addressing>();
  for (const address of genSampleErgoAddresses()) {
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
  await loadLovefieldDB(schema.DataStoreType.MEMORY);
});

function getProtocolParams(): {|
  FeeAddress: string,
  MinimumBoxValue: string,
  |} {
  const fullConfig = getErgoBaseConfig(network);
  const config = fullConfig.reduce((acc, next) => Object.assign(acc, next), {});
  return {
    FeeAddress: config.FeeAddress,
    MinimumBoxValue: config.MinimumBoxValue,
  };
}

describe('Create unsigned TX from UTXO', () => {
  it('Should fail due to insufficient funds (bigger than all inputs)', () => {
    const sampleUtxos = genSampleUtxos();
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[1]];
    expect(() => newErgoUnsignedTxFromUtxo({
      outputs: [{
        address: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex'),
        amount: '1900001', // bigger than input including fees
      }],
      changeAddr: {
        address: decode('9emv7LAtw7U6xMs4JrJP8NTPvwQjNRaSWpgSTGEM6947fFofBWd').toString('hex'),
        addressing: {
          path: [0],
          startLevel: Bip44DerivationLevels.ADDRESS.level,
        },
      },
      utxos,
      currentHeight: 100,
      txFee: new BigNumber('500'),
      protocolParams: getProtocolParams(),
    })).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (no inputs)', () => {
    expect(() => newErgoUnsignedTxFromUtxo({
      outputs: [{
        address: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex'),
        amount: '1', // bigger than input including fees
      }],
      changeAddr: {
        address: decode('9emv7LAtw7U6xMs4JrJP8NTPvwQjNRaSWpgSTGEM6947fFofBWd').toString('hex'),
        addressing: {
          path: [0],
          startLevel: Bip44DerivationLevels.ADDRESS.level,
        },
      },
      utxos: [],
      currentHeight: 100,
      txFee: new BigNumber('500'),
      protocolParams: getProtocolParams(),
    })).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (not enough to cover fees)', () => {
    const sampleUtxos = genSampleUtxos();
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[0]];
    expect(() => newErgoUnsignedTxFromUtxo({
      outputs: [{
        address: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex'),
        amount: '1', // bigger than input including fees
      }],
      changeAddr: {
        address: decode('9emv7LAtw7U6xMs4JrJP8NTPvwQjNRaSWpgSTGEM6947fFofBWd').toString('hex'),
        addressing: {
          path: [0],
          startLevel: Bip44DerivationLevels.ADDRESS.level,
        },
      },
      utxos,
      currentHeight: 100,
      txFee: new BigNumber('500'),
      protocolParams: getProtocolParams(),
    })).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should pick inputs when using input selection', () => {
    const utxos: Array<RemoteUnspentOutput> = genSampleUtxos();
    const sampleErgoAddresses = genSampleErgoAddresses();
    const unsignedTxResponse = newErgoUnsignedTxFromUtxo({
      outputs: [{
        address: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex'),
        amount: '1001', // smaller than input
      }],
      changeAddr: sampleErgoAddresses[0],
      utxos,
      currentHeight: 100,
      txFee: new BigNumber('500'),
      protocolParams: getProtocolParams(),
    });

    // input selection will only take 2 of the 3 inputs
    // it takes 2 inputs because input selection algorithm
    expect(unsignedTxResponse.senderUtxos).toEqual([utxos[0], utxos[1]]);
    expect(unsignedTxResponse.unsignedTx.inputs[0].boxId).toEqual('05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f0');
    expect(unsignedTxResponse.unsignedTx.inputs[1].boxId).toEqual('6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0');

    const output1 = 1001;
    const output2 = 500;
    expect(unsignedTxResponse.unsignedTx.outputs.length).toEqual(3);
    expect(unsignedTxResponse.unsignedTx.outputs[0].value).toEqual(output1); // output of tx
    expect(unsignedTxResponse.unsignedTx.outputs[1].value).toEqual(output2); // fee

    const expectedReturn = unsignedTxResponse.senderUtxos.reduce(
      (sum, utxo) => sum.plus(utxo.amount),
      new BigNumber(0)
    ).toNumber() - output1 - output2;
    expect(unsignedTxResponse.unsignedTx.outputs[2].value).toEqual(expectedReturn);
  });
});

describe('Create unsigned TX from addresses', () => {
  it('Should send assets back in the change address', () => {
    const addressedUtxos = genAddressedUtxos();
    const unsignedTxResponse = newErgoUnsignedTx({
      outputs: [{
        address: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex'),
        amount: '5001', // smaller than input
      }],
      changeAddr: {
        address: decode('9emv7LAtw7U6xMs4JrJP8NTPvwQjNRaSWpgSTGEM6947fFofBWd').toString('hex'),
        addressing: {
          path: [0],
          startLevel: Bip44DerivationLevels.ADDRESS.level,
        },
      },
      utxos: [addressedUtxos[3]],
      currentHeight: 100,
      txFee: new BigNumber('500'),
      protocolParams: getProtocolParams(),
    });
    expect(unsignedTxResponse.senderUtxos).toEqual([addressedUtxos[3]]);

    expect(unsignedTxResponse.unsignedTx.outputs.length).toEqual(3);
    // make sure the assets are sent back to us in the change
    expect(unsignedTxResponse.unsignedTx.outputs[2].assets).toEqual([{
      tokenId: '13d24a67432d447e53118d920100c747abb52da8da646bc193f03b47b64a8ac5',
      amount: 10000,
    }]);
  });
});

describe('Create signed transactions', () => {
  it('Witness should match on valid private key', () => {
    const params = getProtocolParams();
    const addressedUtxos = genAddressedUtxos();
    const unsignedTxResponse = newErgoUnsignedTx({
      outputs: [{
        address: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex'),
        amount: '5001', // smaller than input
      }],
      changeAddr: {
        address: decode('9emv7LAtw7U6xMs4JrJP8NTPvwQjNRaSWpgSTGEM6947fFofBWd').toString('hex'),
        addressing: {
          path: [0],
          startLevel: Bip44DerivationLevels.ADDRESS.level,
        },
      },
      utxos: [addressedUtxos[0], addressedUtxos[2]],
      currentHeight: 100,
      txFee: new BigNumber('500'),
      protocolParams: params,
    });
    const signRequest = new ErgoTxSignRequest({
      changeAddr: unsignedTxResponse.changeAddr,
      senderUtxos: unsignedTxResponse.senderUtxos,
      unsignedTx: unsignedTxResponse.unsignedTx,
      networkSettingSnapshot: {
        FeeAddress: params.FeeAddress,
      },
    });

    const rootPk = generateWalletRootKey(
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon share'
    );
    const chainKey = derivePath(
      rootPk,
      [
        WalletTypePurpose.BIP44,
        CoinTypes.ERGO,
        0 + HARD_DERIVATION_START,
        ChainDerivations.EXTERNAL,
      ]
    );
    const signedTx = signTransaction({
      signRequest,
      keyLevel: Bip44DerivationLevels.CHAIN.level,
      signingKey: chainKey,
    });
    const serializeTransaction = Serializer.transactionToBytes(signRequest.unsignedTx);

    // note: the proofBytes includes random data so we can't just compare against the proof
    // so we have to instead use the verification function
    expect(signedTx.inputs.length).toEqual(2);
    expect(verify(
      serializeTransaction,
      Buffer.from('1653bbe49ebc43d6c1c2d16f83036869aeed0140b280654c97ce03ec8bb5e5b3a138b99849e763104c2c29c976ce6b22fdf3c02ea9dd5b3b', 'hex'),
      derivePath(chainKey, addressedUtxos[0].addressing.path).toPublic().key.publicKey
    )).toEqual(true);
    expect(verify(
      serializeTransaction,
      Buffer.from('4ef149a11c9d67e9965b7dc8b55f42c16da451391024f82c349d22438ee3d04361fb43f7d34bdf1404aa87c77e4a7ae6396d1ba42900dd63', 'hex'),
      derivePath(chainKey, addressedUtxos[2].addressing.path).toPublic().key.publicKey
    )).toEqual(true);
  });
});

describe('Create sendAll unsigned TX from UTXO', () => {
  describe('Create send-all TX from UTXO', () => {
    it('Create a transaction involving all input with no change', () => {
      const sampleUtxos = genSampleUtxos();
      const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[1], sampleUtxos[3]];
      const sendAllResponse = sendAllUnsignedTxFromUtxo({
        receiver: {
          address: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex')
        },
        utxos,
        currentHeight: 100,
        txFee: new BigNumber('500'),
        protocolParams: getProtocolParams(),
      });

      expect(sendAllResponse.senderUtxos).toEqual(utxos);
      expect(sendAllResponse.unsignedTx.inputs.length).toEqual(2);

      expect(sendAllResponse.unsignedTx.outputs.length).toEqual(2);
      expect(sendAllResponse.unsignedTx.outputs[0].value).toEqual(500); // fee
      expect(sendAllResponse.unsignedTx.outputs[1].value).toEqual(20999501); // output
      // make sure the assets are also sent
      expect(sendAllResponse.unsignedTx.outputs[1].assets).toEqual([{
        tokenId: '13d24a67432d447e53118d920100c747abb52da8da646bc193f03b47b64a8ac5',
        amount: 10000,
      }]); // output
    });
  });

  it('Should fail due to insufficient funds (no inputs)', () => {
    expect(() => sendAllUnsignedTxFromUtxo({
      receiver: {
        address: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex')
      },
      utxos: [],
      currentHeight: 100,
      txFee: new BigNumber('500'),
      protocolParams: getProtocolParams(),
    })).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (not enough to cover fees)', () => {
    const sampleUtxos = genSampleUtxos();
    const utxos: Array<RemoteUnspentOutput> = [sampleUtxos[0]];
    expect(() => sendAllUnsignedTxFromUtxo({
      receiver: {
        address: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex')
      },
      utxos,
      currentHeight: 100,
      txFee: new BigNumber('100000'),
      protocolParams: getProtocolParams(),
    })).toThrow(NotEnoughMoneyToSendError);
  });
});
