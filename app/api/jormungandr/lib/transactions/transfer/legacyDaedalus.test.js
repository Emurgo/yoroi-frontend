// @flow

import '../../../../ada/lib/test-config';
import { schema } from 'lovefield';
import {
  getCryptoDaedalusWalletFromMnemonics,
} from '../../../../ada/lib/cardanoCrypto/cryptoWallet';
import {
  getAddressesKeys,
} from '../../../../ada/transactions/transfer/legacyDaedalus';
import {
  daedalusTransferTxFromAddresses,
} from './legacyDaedalus';
import {
  NotEnoughMoneyToSendError,
} from '../../../../common/errors';
import {
  silenceLogsForTesting,
} from '../../../../../utils/logging';

import {
  loadLovefieldDB,
} from '../../../../ada/lib/storage/database/index';

import { RustModule } from '../../../../ada/lib/cardanoCrypto/rustLoader';

const linearFeeConfig = {
  constant: '155381',
  coefficient: '1',
  certificate: '4',
  per_certificate_fees: {
    certificate_pool_registration: '5',
    certificate_stake_delegation: '6',
  },
};

beforeAll(async () => {
  await RustModule.load();
  await loadLovefieldDB(schema.DataStoreType.MEMORY);
  silenceLogsForTesting();
});

describe('Jormungandr tx format tests', () => {
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

    const transferInfo = await daedalusTransferTxFromAddresses({
      addressKeys: addressMap,
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      outputAddr: outAddress,
      genesisHash: 'adbdd5ede31637f6c9bad5c271eec0bc3d0cb9efb86a5b913bb55cba549d0770',
      feeConfig: linearFeeConfig,
    });

    expect(transferInfo.fee.toString()).toBe('0.155383');
    expect(transferInfo.recoveredBalance.toString()).toBe('1');
    expect(transferInfo.senders).toEqual([address]);
    expect(transferInfo.receiver).toBe(bech32Addr);

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

    expect(daedalusTransferTxFromAddresses({
      addressKeys: addressMap,
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      outputAddr: outAddress,
      genesisHash: 'adbdd5ede31637f6c9bad5c271eec0bc3d0cb9efb86a5b913bb55cba549d0770',
      feeConfig: linearFeeConfig,
    })).rejects.toThrow(NotEnoughMoneyToSendError);
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

    const transferInfo = await daedalusTransferTxFromAddresses({
      addressKeys: addressMap,
      getUTXOsForAddresses: (_addresses) => Promise.resolve(utxo),
      outputAddr: outAddress,
      genesisHash: 'adbdd5ede31637f6c9bad5c271eec0bc3d0cb9efb86a5b913bb55cba549d0770',
      feeConfig: linearFeeConfig,
    });

    expect(transferInfo.fee.toString()).toBe('0.155482');
    expect(transferInfo.recoveredBalance.toString()).toBe('100.0001');
    expect(transferInfo.senders).toEqual([address]);
    expect(transferInfo.receiver).toBe(bech32Addr);

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
