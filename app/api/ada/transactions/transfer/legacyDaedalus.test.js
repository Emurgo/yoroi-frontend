/* eslint-disable camelcase */
// @flow
import '../../lib/test-config';
import { schema } from 'lovefield';
import {
  getCryptoDaedalusWalletFromMnemonics,
} from '../../lib/cardanoCrypto/cryptoWallet';
import {
  getAddressesKeys,
} from './legacyDaedalus';
import { buildDaedalusTransferTx } from '../byron/daedalusTransfer';
import {
  GenerateTransferTxError,
} from '../../errors';
import {
  silenceLogsForTesting,
} from '../../../../utils/logging';

import {
  loadLovefieldDB,
} from '../../lib/storage/database/index';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

beforeAll(async () => {
  await RustModule.load();
  await loadLovefieldDB(schema.DataStoreType.MEMORY);
  silenceLogsForTesting();
});

test('Daedalus transfer from single small UTXO', async () => {
  const words = 'note park thrive ignore spare latin common balance clap soup school tiny';
  const address = 'DdzFFzCqrhsmcx7z25PRkdbeUNqNNW4brhznpVxbm1EknAahjaCFEjYXg9KJRqkixjgGyz8D9GSX3CFDRoNrZyfJsi61N2FxCnq9yWBy';
  const txId = '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c';
  const inputAmount = '1000000';
  const txIndex = 0;
  const outAddress = 'Ae2tdPwUPEZ4Gg5gmqwW2t7ottKBMjWunmPt7DwKkAGsxx9XNSfWqrE1Gbk';

  const daedalusWallet = getCryptoDaedalusWalletFromMnemonics(words);
  const checker = RustModule.WalletV2.DaedalusAddressChecker.new(daedalusWallet);
  const addressMap = getAddressesKeys({
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

  const transferInfo = await buildDaedalusTransferTx({
    addressKeys: addressMap,
    senderUtxos: [utxo],
    outputAddr: outAddress
  });

  expect(transferInfo.fee.toString()).toBe('0.165841');
  expect(transferInfo.recoveredBalance.toString()).toBe('1');
  expect(transferInfo.senders).toEqual([address]);
  expect(transferInfo.receiver).toBe(outAddress);

  // check tx itself
  const signedTx = RustModule.WalletV2.SignedTransaction.from_bytes(transferInfo.encodedTx);
  const txJson = signedTx.to_json();
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

test('Daedalus transfer fails from too small UTXO', async () => {
  const words = 'note park thrive ignore spare latin common balance clap soup school tiny';
  const address = 'DdzFFzCqrhsmcx7z25PRkdbeUNqNNW4brhznpVxbm1EknAahjaCFEjYXg9KJRqkixjgGyz8D9GSX3CFDRoNrZyfJsi61N2FxCnq9yWBy';
  const txId = '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c';
  const inputAmount = '1000';
  const txIndex = 0;
  const outAddress = 'Ae2tdPwUPEZ4Gg5gmqwW2t7ottKBMjWunmPt7DwKkAGsxx9XNSfWqrE1Gbk';

  const daedalusWallet = getCryptoDaedalusWalletFromMnemonics(words);
  const checker = RustModule.WalletV2.DaedalusAddressChecker.new(daedalusWallet);
  const addressMap = getAddressesKeys({
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

  expect(buildDaedalusTransferTx({
    addressKeys: addressMap,
    senderUtxos: [utxo],
    outputAddr: outAddress
  })).rejects.toThrow(GenerateTransferTxError);
});

test('Daedalus transfer filters address not belonging to user', async () => {
  const words = 'note park thrive ignore spare latin common balance clap soup school tiny';
  const myAddress = 'DdzFFzCqrhsmcx7z25PRkdbeUNqNNW4brhznpVxbm1EknAahjaCFEjYXg9KJRqkixjgGyz8D9GSX3CFDRoNrZyfJsi61N2FxCnq9yWBy';
  const notMyAddress = 'DdzFFzCqrhsf69sXiAinAVVE9ZazKaoiKk9aSTRLJZSP4wMFGi4ogmcwjvSPMFuGD4a74HWemc3zfh3Eh4GdFRvmt3Jf88e77wCEUJgH';

  const daedalusWallet = getCryptoDaedalusWalletFromMnemonics(words);
  const checker = RustModule.WalletV2.DaedalusAddressChecker.new(daedalusWallet);
  const addressMap = getAddressesKeys({
    checker,
    fullUtxo: [myAddress, notMyAddress]
  });

  expect(addressMap[myAddress]).not.toBe(undefined);
  expect(addressMap[notMyAddress]).toBe(undefined);
});

test('Daedalus transfer from many UTXO', async () => {
  const words = 'note park thrive ignore spare latin common balance clap soup school tiny';
  const address = 'DdzFFzCqrhsmcx7z25PRkdbeUNqNNW4brhznpVxbm1EknAahjaCFEjYXg9KJRqkixjgGyz8D9GSX3CFDRoNrZyfJsi61N2FxCnq9yWBy';
  const txId = '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c';
  const inputAmount = '1000001';
  const txIndex = 0;
  const outAddress = 'Ae2tdPwUPEZ4Gg5gmqwW2t7ottKBMjWunmPt7DwKkAGsxx9XNSfWqrE1Gbk';

  const daedalusWallet = getCryptoDaedalusWalletFromMnemonics(words);
  const checker = RustModule.WalletV2.DaedalusAddressChecker.new(daedalusWallet);
  const addressMap = getAddressesKeys({
    checker,
    fullUtxo: [address]
  });

  const numUtxos = 100;
  const utxo = [];
  for (let i = 0; i < numUtxos; i++) {
    utxo.push({
      utxo_id: 'ignore',
      tx_hash: txId,
      tx_index: i,
      receiver: address,
      amount: inputAmount
    });
  }

  const transferInfo = await buildDaedalusTransferTx({
    addressKeys: addressMap,
    senderUtxos: utxo,
    outputAddr: outAddress
  });

  expect(transferInfo.fee.toString()).toBe('0.956693');
  expect(transferInfo.recoveredBalance.toString()).toBe('100.0001');
  expect(transferInfo.senders).toEqual([address]);
  expect(transferInfo.receiver).toBe(outAddress);

  // check tx itself
  const signedTx = RustModule.WalletV2.SignedTransaction.from_bytes(transferInfo.encodedTx);
  const txJson = signedTx.to_json();
  expect(txJson.tx.inputs).toHaveLength(numUtxos);
  expect(txJson.tx.inputs[0].id).toBe(txId);
  expect(txJson.tx.inputs[0].index).toBe(txIndex);

  expect(txJson.tx.outputs).toHaveLength(1);
  expect(txJson.tx.outputs[0].address).toBe(outAddress);
  expect(txJson.tx.outputs[0].value).toBe(99043407);

  expect(txJson.witness).toHaveLength(numUtxos);
  expect(txJson.witness[0].PkWitness).toEqual([
    '1e74f51418f5835a063c1f4c69808134852b7ebdb85d0c08e867572c0a035e7b06b6bd7a7baa2a5dc191cd08f0ca81ada7298cfa20db44d7eda31e7777b4bbe0',
    '417d265e84350294e30db2037afaf0dec5a48553ad720db2e8eba02b3951b08cb09c903f7e99f8ef2dd64af7cc36746e2e9b9a1c902a95e52e57f213739b840b',
  ]);
});
