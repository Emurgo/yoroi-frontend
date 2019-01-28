// @flow
import './lib/test-config';
import {
  Blake2b,
  Wallet,
} from 'rust-cardano-crypto';
import {
  getCryptoDaedalusWalletFromMnemonics
} from './lib/cardanoCrypto/cryptoWallet';
import {
  decodeRustTx
} from './lib/utils';
import cbor from 'cbor';
import bs58 from 'bs58';
import { SHA3 } from 'sha3';
import blake2b from 'blake2b';

test('Daedalus transfer from old invalid address', () => {
  const words = 'note park thrive ignore spare latin common balance clap soup school tiny';
  const address = 'DdzFFzCqrhsmcx7z25PRkdbeUNqNNW4brhznpVxbm1EknAahjaCFEjYXg9KJRqkixjgGyz8D9GSX3CFDRoNrZyfJsi61N2FxCnq9yWBy';
  const txId = '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c';
  const txIndex = 0;
  const wallet = getCryptoDaedalusWalletFromMnemonics(words);
  const input = [{
    ptr: { id: txId, index: txIndex },
    value: '1000000',
    addressing: [2147483648, 1316836692]
  }];
  const outAddress = 'Ae2tdPwUPEZ4Gg5gmqwW2t7ottKBMjWunmPt7DwKkAGsxx9XNSfWqrE1Gbk';
  const { result: { cbor_encoded_tx, fee } } = Wallet.move(wallet, input, outAddress);
  const { tx: { tx: { inputs, outputs }, witnesses } } = decodeRustTx(cbor_encoded_tx);
  expect(inputs.length).toEqual(1);
  expect(outputs.length).toEqual(1);
  expect(witnesses.length).toEqual(1);
  expect(inputs[0].id).toEqual(txId);
  expect(inputs[0].index).toEqual(txIndex);
  expect(outputs[0].address).toEqual(outAddress);
  expect(1000000 - parseInt(outputs[0].value)).toEqual(parseInt(fee));
  expect('PkWitness' in witnesses[0]).toEqual(true);
  const [pub] = witnesses[0]['PkWitness'];
  const [addressRoot, addressAttr] = cbor.decode(cbor.decode(bs58.decode(address))[0].value);
  const addressRootHex = addressRoot.toString('hex');
  const ext = [0, [0, Buffer.from(pub, 'hex')], addressAttr];
  const hash = new SHA3(256);
  hash.update(cbor.encode(ext));
  const calculatedRootHex = blake2b(28).update(hash.digest()).digest('hex');
  expect(calculatedRootHex).toEqual(addressRootHex);
});