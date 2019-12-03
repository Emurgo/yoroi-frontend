// @flow

import '../../lib/test-config';
import { schema } from 'lovefield';
import {
  getCryptoDaedalusWalletFromMnemonics,
} from '../../lib/cardanoCrypto/cryptoWallet';
import {
  getAddressesKeys,
  buildDaedalusTransferTx,
} from './legacyDaedalus';
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

describe('Daedalus checker tests', () => {
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
});

describe('Byron era tx format tests', () => {
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
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      outputAddr: outAddress,
      legacy: true
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
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      outputAddr: outAddress,
      legacy: true,
    })).rejects.toThrow(GenerateTransferTxError);
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
      getUTXOsForAddresses: (_addresses) => Promise.resolve(utxo),
      outputAddr: outAddress,
      legacy: true,
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
});

describe('Shelley era tx format tests', () => {
  test('Daedalus transfer from single small UTXO', async () => {
    const words = 'note park thrive ignore spare latin common balance clap soup school tiny';
    const address = 'DdzFFzCqrhsmcx7z25PRkdbeUNqNNW4brhznpVxbm1EknAahjaCFEjYXg9KJRqkixjgGyz8D9GSX3CFDRoNrZyfJsi61N2FxCnq9yWBy';
    const txId = '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c';
    const inputAmount = '1000000';
    const txIndex = 0;
    const bech32Addr = 'addr1qw8zss87myxjzwrkrk9pffxta5yw6qx0jz9s072wchafmdh56ln5704fx9z';
    const outAddress = Buffer.from(RustModule.WalletV3.Address.from_string(
      bech32Addr
    ).as_bytes()).toString('hex');

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
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      outputAddr: outAddress,
      legacy: false
    });

    expect(transferInfo.fee.toString()).toBe('0.155383');
    expect(transferInfo.recoveredBalance.toString()).toBe('1');
    expect(transferInfo.senders).toEqual([address]);
    expect(transferInfo.receiver).toBe(outAddress);

    // check tx itself
    const fragment = RustModule.WalletV3.Fragment.from_bytes(transferInfo.encodedTx);
    const signedTx = fragment.get_transaction();

    const inputs = signedTx.inputs();
    expect(inputs.size()).toEqual(1);
    expect(inputs.get(0).value().to_str()).toEqual(inputAmount);
    const pointer = inputs.get(0).get_utxo_pointer();
    expect(Buffer.from(pointer.fragment_id().as_bytes()).toString('hex')).toEqual('915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c');
    expect(pointer.output_index()).toEqual(txIndex);

    const outputs = signedTx.outputs();
    expect(outputs.size()).toEqual(1);
    const output = outputs.get(0);
    expect(output.address().to_string('addr')).toEqual(bech32Addr);
    expect(output.value().to_str()).toEqual('844617');

    const witnesses = signedTx.witnesses();
    expect(witnesses.size()).toEqual(1);
    expect(witnesses.get(0).to_bech32()).toEqual(
      'witness1qq08fag5rr6cxksx8s05c6vqsy6g22m7hku96rqgapn4wtq2qd08kp4kh4a8h232thqerngg7r9grtd89xx05gxmgnt7mgc7wammfwlq9drdfce98j8j4tpj8d24x4qtvzlck533uznwt9wnd2nn7y62436hrcmtkd4eg6tfsdlauv55yr04su7lfyzf7xskl34u2dhd3dj8yrcdzlm6m'
    );
  });

  test('Daedalus transfer fails from too small UTXO', async () => {
    const words = 'note park thrive ignore spare latin common balance clap soup school tiny';
    const address = 'DdzFFzCqrhsmcx7z25PRkdbeUNqNNW4brhznpVxbm1EknAahjaCFEjYXg9KJRqkixjgGyz8D9GSX3CFDRoNrZyfJsi61N2FxCnq9yWBy';
    const txId = '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c';
    const inputAmount = '1000';
    const txIndex = 0;
    const outAddress = '038e2840fed90d2138761d8a14a4cbed08ed00cf908b07f94ec5fa9db6f4d7e74f';

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
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      outputAddr: outAddress,
      legacy: false,
    })).rejects.toThrow(GenerateTransferTxError);
  });

  test('Daedalus transfer from many UTXO', async () => {
    const words = 'note park thrive ignore spare latin common balance clap soup school tiny';
    const address = 'DdzFFzCqrhsmcx7z25PRkdbeUNqNNW4brhznpVxbm1EknAahjaCFEjYXg9KJRqkixjgGyz8D9GSX3CFDRoNrZyfJsi61N2FxCnq9yWBy';
    const txId = '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c';
    const inputAmount = '1000001';
    const txIndex = 0;
    const bech32Addr = 'addr1qw8zss87myxjzwrkrk9pffxta5yw6qx0jz9s072wchafmdh56ln5704fx9z';
    const outAddress = Buffer.from(RustModule.WalletV3.Address.from_string(
      bech32Addr
    ).as_bytes()).toString('hex');

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
      getUTXOsForAddresses: (_addresses) => Promise.resolve(utxo),
      outputAddr: outAddress,
      legacy: false,
    });

    expect(transferInfo.fee.toString()).toBe('0.155482');
    expect(transferInfo.recoveredBalance.toString()).toBe('100.0001');
    expect(transferInfo.senders).toEqual([address]);
    expect(transferInfo.receiver).toBe(outAddress);

    // check tx itself
    const fragment = RustModule.WalletV3.Fragment.from_bytes(transferInfo.encodedTx);
    const signedTx = fragment.get_transaction();

    const inputs = signedTx.inputs();
    expect(inputs.size()).toEqual(numUtxos);
    expect(inputs.get(0).value().to_str()).toEqual(inputAmount);
    const pointer = inputs.get(0).get_utxo_pointer();
    expect(Buffer.from(pointer.fragment_id().as_bytes()).toString('hex')).toEqual(txId);
    expect(pointer.output_index()).toEqual(txIndex);

    const outputs = signedTx.outputs();
    expect(outputs.size()).toEqual(1);
    const output = outputs.get(0);
    expect(output.address().to_string('addr')).toEqual(bech32Addr);
    expect(output.value().to_str()).toEqual('99844618');

    const witnesses = signedTx.witnesses();
    expect(witnesses.size()).toEqual(numUtxos);
    expect(witnesses.get(0).to_bech32()).toEqual(
      'witness1qq08fag5rr6cxksx8s05c6vqsy6g22m7hku96rqgapn4wtq2qd08kp4kh4a8h232thqerngg7r9grtd89xx05gxmgnt7mgc7wammfwlqgq5vuhmpun2t0ns5dyntsy3jesy0cx59h9rxw8k7v08n6lsx6n4cl6skm94k5nzrlwjfv7q87u6nr8aqyk0k3zu7xa5h4e6y6gstzpg8reknp'
    );
  });
});
