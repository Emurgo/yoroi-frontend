/* eslint-disable camelcase */
// @flow
import './lib/test-config';
import {
  getCryptoDaedalusWalletFromMnemonics,
} from './lib/cardanoCrypto/cryptoWallet';
import {
  getAddressesWithFunds,
  buildTransferTx,
} from './daedalusTransfer';

import { RustModule } from './lib/cardanoCrypto/rustLoader';

beforeAll(async () => {
  await RustModule.load();
});

test('Daedalus transfer from old invalid address', async () => {
  const words = 'note park thrive ignore spare latin common balance clap soup school tiny';
  const address = 'DdzFFzCqrhsmcx7z25PRkdbeUNqNNW4brhznpVxbm1EknAahjaCFEjYXg9KJRqkixjgGyz8D9GSX3CFDRoNrZyfJsi61N2FxCnq9yWBy';
  const txId = '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c';
  const inputAmount = '1000000';
  const txIndex = 0;
  const outAddress = 'Ae2tdPwUPEZ4Gg5gmqwW2t7ottKBMjWunmPt7DwKkAGsxx9XNSfWqrE1Gbk';

  const daedalusWallet = getCryptoDaedalusWalletFromMnemonics(words);
  const checker = RustModule.Wallet.DaedalusAddressChecker.new(daedalusWallet);
  const addressMap = getAddressesWithFunds({
    checker,
    fullUtxo: [address]
  });

  const utxo = {
    utxo_id: 'ignore',
    tx_hash: txId,
    tx_index: txIndex,
    receiver: address,
    amount: inputAmount
  };

  const transferInfo = await buildTransferTx({
    addressesWithFunds: addressMap,
    senderUtxos: [utxo],
    outputAddr: outAddress
  });

  expect(transferInfo.fee.toString()).toBe('0.165841');
  expect(transferInfo.recoveredBalance.toString()).toBe('1');
  expect(transferInfo.senders).toEqual([address]);
  expect(transferInfo.receiver).toBe(outAddress);

  // check tx itself
  const txJson = transferInfo.signedTx.to_json();
  expect(txJson.tx.inputs).toHaveLength(1);
  expect(txJson.tx.inputs[0].id).toBe(txId);
  expect(txJson.tx.inputs[0].index).toBe(txIndex);

  expect(txJson.tx.outputs).toHaveLength(1);
  expect(txJson.tx.outputs[0].address).toBe(outAddress);
  expect(txJson.tx.outputs[0].value).toBe(834159);

  expect(txJson.witness).toHaveLength(1);
  expect(txJson.witness[0].PkWitness).toEqual([
    '1e74f51418f5835a063c1f4c69808134852b7ebdb85d0c08e867572c0a035e7b06b6bd7a7baa2a5dc191cd08f0ca81ada7298cfa20db44d7eda31e7777b4bbe0',
    '6e233a6365e9b371d3b8ce95b9f7f565a901109cbfd19e9bf32c4355f73a7466c6b57ec8867e8420d02ec9c2e42fa36e90ae080d6d184f2c9336bee079585c05',
  ]);
});
