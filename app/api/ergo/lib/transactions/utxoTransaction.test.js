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
  // signTransaction,
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

// import {
//   HARD_DERIVATION_START,
//   CoinTypes,
//   WalletTypePurpose,
//   ChainDerivations,
// } from '../../../../config/numbersConfig';
import {
  networks,
  getErgoBaseConfig,
} from '../../../ada/lib/storage/database/prepackaged/networks';
import { decode, } from 'bs58';
// import { ErgoTxSignRequest } from './ErgoTxSignRequest';
// import { derivePath } from '../../../common/lib/crypto/keys/keyRepository';
// import { generateWalletRootKey } from '../crypto/wallet';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';
import { replaceMockBoxId } from './utils';

const network = networks.ErgoMainnet;

const genSampleUtxos: void => Array<RemoteUnspentOutput> = () => [
  replaceMockBoxId({
    amount: '100001',
    receiver: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex'),
    tx_hash: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
    tx_index: 0,
    creationHeight: 1,
    boxId: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
    ergoTree: Buffer.from(RustModule.SigmaRust.Address.from_base58(
      '9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ'
    ).to_ergo_tree().to_bytes()).toString('hex'),
  }),
  replaceMockBoxId({
    amount: '1000001',
    receiver: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex'),
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    creationHeight: 2,
    boxId: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    ergoTree: Buffer.from(RustModule.SigmaRust.Address.from_base58(
      '9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ'
    ).to_ergo_tree().to_bytes()).toString('hex'),
  }),
  replaceMockBoxId({
    amount: '10000001',
    receiver: decode('9iEqML45XncjkVtkrMFysY6qdKWhJs6fd3BNy7ExAVhTsaZemdF').toString('hex'),
    tx_hash: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a173',
    tx_index: 0,
    creationHeight: 3,
    boxId: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a173',
    ergoTree: Buffer.from(RustModule.SigmaRust.Address.from_base58(
      '9iEqML45XncjkVtkrMFysY6qdKWhJs6fd3BNy7ExAVhTsaZemdF'
    ).to_ergo_tree().to_bytes()).toString('hex'),
  }),
  replaceMockBoxId({
    amount: '20000000',
    receiver: decode('9hkTdcLcWqQxYQ3qexRb7MpZniDusrUr6R2Hp48cJU6H4Npq6jC').toString('hex'),
    tx_hash: '0df0273e382739f8b4ae3783d81168093e78e0b49ec2c5430ff03d444806a173',
    tx_index: 0,
    creationHeight: 4,
    boxId: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff04d444806a173',
    ergoTree: Buffer.from(RustModule.SigmaRust.Address.from_base58(
      '9hkTdcLcWqQxYQ3qexRb7MpZniDusrUr6R2Hp48cJU6H4Npq6jC'
    ).to_ergo_tree().to_bytes()).toString('hex'),
    assets: [{
      tokenId: '13d24a67432d447e53118d920100c747abb52da8da646bc193f03b47b64a8ac5',
      amount: 10000,
    }],
  }),
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
  await RustModule.load();
  await loadLovefieldDB(schema.DataStoreType.MEMORY);
});

function getProtocolParams(): {|
  FeeAddress: string,
  MinimumBoxValue: string,
  NetworkId: number,
  |} {
  const fullConfig = getErgoBaseConfig(network);
  const config = fullConfig.reduce((acc, next) => Object.assign(acc, next), {});
  return {
    FeeAddress: config.FeeAddress,
    MinimumBoxValue: config.MinimumBoxValue,
    NetworkId: network.NetworkId,
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
        amount: '1',
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
        amount: '100000', // less than input
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
      txFee: new BigNumber('50000'),
      protocolParams: getProtocolParams(),
    })).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should pick inputs when using input selection', () => {
    const output = 50002;
    const txFee = 50000;

    const utxos: Array<RemoteUnspentOutput> = genSampleUtxos();
    const sampleErgoAddresses = genSampleErgoAddresses();
    const unsignedTxResponse = newErgoUnsignedTxFromUtxo({
      outputs: [{
        address: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex'),
        amount: output.toString(), // smaller than input
      }],
      changeAddr: sampleErgoAddresses[0],
      utxos,
      currentHeight: 100,
      txFee: new BigNumber(txFee),
      protocolParams: getProtocolParams(),
    });

    // input selection will only take 2 of the 3 inputs
    // it takes 2 inputs because input selection algorithm
    expect(unsignedTxResponse.senderUtxos).toEqual([utxos[0], utxos[1]]);
    expect(
      unsignedTxResponse.unsignedTx
        .box_selection().boxes()
        .get(0)
        .box_id()
        .to_str()
    ).toEqual('1123a25bed49beafcc3e08b99c24882a9fa70dc0525a6ec367af50d5b6d1bdb9');
    expect(
      unsignedTxResponse.unsignedTx
        .box_selection().boxes()
        .get(1)
        .box_id()
        .to_str()
    ).toEqual('4a995b3c6ade538b71418b7a2a39d2773140df869e491a670b8502b7b6f0da1b');

    const unsignedTx = unsignedTxResponse.unsignedTx.build();
    expect(unsignedTx.outputs().len()).toEqual(3);
    expect(
      unsignedTx
        .outputs()
        .get(0)
        .value().as_i64()
        .to_str()
    ).toEqual(output.toString()); // output of tx
    expect(
      unsignedTx
        .outputs()
        .get(2)
        .value().as_i64()
        .to_str()
    ).toEqual(txFee.toString()); // fee

    const expectedReturn = unsignedTxResponse.senderUtxos.reduce(
      (sum, utxo) => sum.plus(utxo.amount),
      new BigNumber(0)
    ).toNumber() - output - txFee;
    expect(
      unsignedTx
        .outputs()
        .get(1)
        .value().as_i64()
        .to_str()
    ).toEqual(expectedReturn.toString()); // change
  });
});

describe('Create unsigned TX from addresses', () => {
  it('Should send assets back in the change address', () => {
    const addressedUtxos = genAddressedUtxos();
    const unsignedTxResponse = newErgoUnsignedTx({
      outputs: [{
        address: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex'),
        amount: '50001', // smaller than input
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
      txFee: new BigNumber('50000'),
      protocolParams: getProtocolParams(),
    });
    expect(unsignedTxResponse.senderUtxos).toEqual([addressedUtxos[3]]);

    expect(unsignedTxResponse.unsignedTx.output_candidates().len()).toEqual(1);
    // make sure the assets are sent back to us in the change
    expect(
      unsignedTxResponse.unsignedTx
        .box_selection()
        .change()
        .get(0)
        .tokens()
        .get(0)
        .to_json()
    ).toEqual({
      tokenId: '13d24a67432d447e53118d920100c747abb52da8da646bc193f03b47b64a8ac5',
      amount: 10000,
    });
  });
});

// describe('Create signed transactions', () => {
//   it('Witness should match on valid private key', () => {
//     const params = getProtocolParams();
//     const addressedUtxos = genAddressedUtxos();
//     const unsignedTxResponse = newErgoUnsignedTx({
//       outputs: [{
//         address: decode('9egNKTzQDH658qcdiPEoQfVM1SBxQNxnyF8BCw57aNWerRhhHBQ').toString('hex'),
//         amount: '50000', // smaller than input
//       }],
//       changeAddr: {
//         address: decode('9emv7LAtw7U6xMs4JrJP8NTPvwQjNRaSWpgSTGEM6947fFofBWd').toString('hex'),
//         addressing: {
//           path: [0],
//           startLevel: Bip44DerivationLevels.ADDRESS.level,
//         },
//       },
//       utxos: [addressedUtxos[0], addressedUtxos[2]],
//       currentHeight: 100,
//       txFee: new BigNumber('50000'),
//       protocolParams: params,
//     });
//     const signRequest = new ErgoTxSignRequest({
//       changeAddr: unsignedTxResponse.changeAddr,
//       senderUtxos: unsignedTxResponse.senderUtxos,
//       unsignedTx: unsignedTxResponse.unsignedTx,
//       networkSettingSnapshot: {
//         FeeAddress: params.FeeAddress,
//         ChainNetworkId: (
//           Number.parseInt(getErgoBaseConfig(network)[0].ChainNetworkId, 10): any
//         ),
//       },
//     });

//     const rootPk = generateWalletRootKey(
// eslint-disable-next-line max-len
//       'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon share'
//     );
//     const chainKey = derivePath(
//       rootPk,
//       [
//         WalletTypePurpose.BIP44,
//         CoinTypes.ERGO,
//         0 + HARD_DERIVATION_START,
//         ChainDerivations.EXTERNAL,
//       ]
//     );
//     // TODO: signTransactions fails on OsRng for our nodejs builds due to an unknown error
//     const signedTx = signTransaction({
//       signRequest,
//       keyLevel: Bip44DerivationLevels.CHAIN.level,
//       signingKey: chainKey,
//     });
//     // note: the proofBytes includes random data so we can't just compare against the proof
//     // so we have to instead use the verification function
//     expect(signedTx.inputs.length).toEqual(2);
//     expect(signedTx.inputs[0].spendingProof.proofBytes).toEqual(
//       ''
//     );
//     expect(signedTx.inputs[1].spendingProof.proofBytes).toEqual(
//       ''
//     );
//   });
// });

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
        txFee: new BigNumber('50000'),
        protocolParams: getProtocolParams(),
      });

      expect(sendAllResponse.senderUtxos).toEqual(utxos);
      expect(sendAllResponse.unsignedTx.box_selection().boxes().len()).toEqual(2);

      const unsignedTx = sendAllResponse.unsignedTx.build();
      expect(unsignedTx.outputs().len()).toEqual(2);
      expect(
        unsignedTx
          .outputs()
          .get(0)
          .value().as_i64()
          .to_str()
      ).toEqual('20950001'); // output
      expect(
        unsignedTx
          .outputs()
          .get(1)
          .value().as_i64()
          .to_str()
      ).toEqual('50000'); // fee
      // make sure the assets are also sent
      expect(
        unsignedTx
          .outputs()
          .get(0)
          .tokens()
          .get(0)
          .to_json()
      ).toEqual({
        tokenId: '13d24a67432d447e53118d920100c747abb52da8da646bc193f03b47b64a8ac5',
        amount: 10000,
      }); // output
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
