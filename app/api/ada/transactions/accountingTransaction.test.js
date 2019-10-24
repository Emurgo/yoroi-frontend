// @flow
import '../lib/test-config';

import {
  getTxInputTotal,
  getTxOutputTotal,
} from './utils';
import {
  NotEnoughMoneyToSendError,
} from '../errors';
import {
  buildTransaction,
  signTransaction,
} from './accountingTransactions';
import { RustModule } from '../lib/cardanoCrypto/rustLoader';
import BigNumber from 'bignumber.js';

beforeAll(async () => {
  await RustModule.load();
});

describe('Create unsigned TX for account', () => {
  it('Should create a valid transaction', async () => {
    const senderKey = RustModule.WalletV3.PrivateKey.from_bech32(
      'ed25519_sk1ahfetf02qwwg4dkq7mgp4a25lx5vh9920cr5wnxmpzz9906qvm8qwvlts0'
    );

    const unsignedTxResponse = buildTransaction(
      senderKey.to_public(),
      'ca1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqeh83d4',
      new BigNumber(2000000),
      new BigNumber(5000000),
    );
    const inputSum = getTxInputTotal(unsignedTxResponse);
    const outputSum = getTxOutputTotal(unsignedTxResponse);
    expect(inputSum.toString()).toEqual('2155383');
    expect(outputSum.toString()).toEqual('2000000');
    expect(inputSum.minus(outputSum).toString()).toEqual('155383');

    const signedTx = signTransaction(
      unsignedTxResponse,
      0,
      senderKey,
    );

    const witnesses = signedTx.witnesses();

    expect(witnesses.size()).toEqual(1);
    expect(witnesses.get(0).to_bech32()).toEqual(
      'witness1qfmmw476z0hd33wfx32p0qkn3xc7j42h0gr37z3vgq9aanzn3v6vm93j7wzpdea3qg440a4vwtdta0vf7mv5vd2d96s2xjw8urj73dc93jsax4'
    );
  });

  it('Should fail due to insufficient funds (not enough to cover fees)', () => {
    const senderKey = RustModule.WalletV3.PrivateKey.from_bech32(
      'ed25519_sk1ahfetf02qwwg4dkq7mgp4a25lx5vh9920cr5wnxmpzz9906qvm8qwvlts0'
    );

    expect(() => buildTransaction(
      senderKey.to_public(),
      'ca1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqeh83d4',
      new BigNumber(2000000),
      new BigNumber(2000000),
    )).toThrow(NotEnoughMoneyToSendError);
  });

  it('Should fail due to insufficient funds (not enough to cover amount)', () => {
    const senderKey = RustModule.WalletV3.PrivateKey.from_bech32(
      'ed25519_sk1ahfetf02qwwg4dkq7mgp4a25lx5vh9920cr5wnxmpzz9906qvm8qwvlts0'
    );

    expect(() => buildTransaction(
      senderKey.to_public(),
      'ca1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqeh83d4',
      new BigNumber(2000000),
      new BigNumber(1000000),
    )).toThrow(NotEnoughMoneyToSendError);
  });
});
