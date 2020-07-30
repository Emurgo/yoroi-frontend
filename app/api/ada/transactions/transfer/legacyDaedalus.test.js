// @flow

import '../../lib/test-config';
import BigNumber from 'bignumber.js';
import { schema } from 'lovefield';
import {
  getCryptoDaedalusWalletFromMnemonics,
} from '../../lib/cardanoCrypto/cryptoWallet';
import {
  getAddressesKeys,
  daedalusTransferTxFromAddresses,
} from './legacyDaedalus';
import {
  NotEnoughMoneyToSendError,
} from '../../../common/errors';
import {
  silenceLogsForTesting,
} from '../../../../utils/logging';

import {
  loadLovefieldDB,
} from '../../lib/storage/database/index';
import {
  networks, getCardanoHaskellBaseConfig,
} from '../../lib/storage/database/prepackaged/networks';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

const network = networks.ByronMainnet;

beforeAll(async () => {
  await RustModule.load();
  await loadLovefieldDB(schema.DataStoreType.MEMORY);
  silenceLogsForTesting();
});

function getProtocolParams(): {|
  keyDeposit: RustModule.WalletV4.BigNum,
  linearFee: RustModule.WalletV4.LinearFee,
  minimumUtxoVal: RustModule.WalletV4.BigNum,
  poolDeposit: RustModule.WalletV4.BigNum,
  |} {
  const baseConfig = getCardanoHaskellBaseConfig(network)
    .reduce((acc, next) => Object.assign(acc, next), {});
  return {
    keyDeposit: RustModule.WalletV4.BigNum.from_str(baseConfig.KeyDeposit),
    linearFee: RustModule.WalletV4.LinearFee.new(
      RustModule.WalletV4.BigNum.from_str(baseConfig.LinearFee.coefficient),
      RustModule.WalletV4.BigNum.from_str(baseConfig.LinearFee.constant),
    ),
    minimumUtxoVal: RustModule.WalletV4.BigNum.from_str(baseConfig.MinimumUtxoVal),
    poolDeposit: RustModule.WalletV4.BigNum.from_str(baseConfig.PoolDeposit),
  };
}

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
    const inputAmount = '2000000';
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

    const transferInfo = await daedalusTransferTxFromAddresses({
      addressKeys: addressMap,
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      outputAddr: outAddress,
      absSlotNumber: new BigNumber(1),
      protocolParams: getProtocolParams(),
    });

    expect(transferInfo.fee.toString()).toBe('0.167965');
    expect(transferInfo.recoveredBalance.toString()).toBe('2');
    expect(transferInfo.senders).toEqual([address]);
    expect(transferInfo.receiver).toBe(outAddress);

    // check tx itself
    const signedTx = RustModule.WalletV4.Transaction.from_bytes(transferInfo.encodedTx);
    const body = signedTx.body();
    expect(body.inputs().len()).toBe(1);
    expect(Buffer.from(body.inputs().get(0).transaction_id().to_bytes()).toString('hex')).toBe(txId);
    expect(body.inputs().get(0).index()).toBe(txIndex);

    expect(body.outputs().len()).toBe(1);
    expect(
      // eslint-disable-next-line camelcase
      RustModule.WalletV4.ByronAddress.from_address(body.outputs().get(0).address())?.to_base58()
    ).toBe(outAddress);
    expect(body.outputs().get(0).amount().to_str()).toBe('1832035');

    const witnesses = signedTx.witness_set().bootstraps();
    if (witnesses == null) throw new Error('no bootstrap witnesses found');
    expect(witnesses.len()).toBe(1);
    expect(Buffer.from(witnesses.get(0).to_bytes()).toString('hex')).toBe('8458201e74f51418f5835a063c1f4c69808134852b7ebdb85d0c08e867572c0a035e7b5840c25279d5d7ab16ef51fd44e762c564e3d4a54e0f36cac4053e25151f5e6afa84b3a7be06f2ceb84d9bf0a8ebb063e0ff45d059091b4b1dee9944479021924308582006b6bd7a7baa2a5dc191cd08f0ca81ada7298cfa20db44d7eda31e7777b4bbe05822a101581e581c28a1ae6554b66549078f72b0e75e13cb0876cbbefac4f292b43e940e');
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

    expect(daedalusTransferTxFromAddresses({
      addressKeys: addressMap,
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      outputAddr: outAddress,
      absSlotNumber: new BigNumber(1),
      protocolParams: getProtocolParams(),
    })).rejects.toThrow(NotEnoughMoneyToSendError);
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

    const transferInfo = await daedalusTransferTxFromAddresses({
      addressKeys: addressMap,
      getUTXOsForAddresses: (_addresses) => Promise.resolve(utxo),
      outputAddr: outAddress,
      absSlotNumber: new BigNumber(1),
      protocolParams: getProtocolParams(),
    });

    expect(transferInfo.fee.toString()).toBe('0.328169');
    expect(transferInfo.recoveredBalance.toString()).toBe('100.0001');
    expect(transferInfo.senders).toEqual([address]);
    expect(transferInfo.receiver).toBe(outAddress);

    // check tx itself
    const signedTx = RustModule.WalletV4.Transaction.from_bytes(transferInfo.encodedTx);
    const body = signedTx.body();
    expect(body.inputs().len()).toBe(numUtxos);
    expect(Buffer.from(body.inputs().get(0).transaction_id().to_bytes()).toString('hex')).toBe(txId);
    expect(body.inputs().get(0).index()).toBe(txIndex);

    expect(body.outputs().len()).toBe(1);
    expect(
      // eslint-disable-next-line camelcase
      RustModule.WalletV4.ByronAddress.from_address(body.outputs().get(0).address())?.to_base58()
    ).toBe(outAddress);
    expect(body.outputs().get(0).amount().to_str()).toBe('99671931');

    const witnesses = signedTx.witness_set().bootstraps();
    if (witnesses == null) throw new Error('no bootstrap witnesses found');
    expect(witnesses.len()).toBe(1);
    expect(Buffer.from(witnesses.get(0).to_bytes()).toString('hex')).toBe('8458201e74f51418f5835a063c1f4c69808134852b7ebdb85d0c08e867572c0a035e7b58402a9d4a40c75da42e1101e5e139ea88a4809d1b5bc853901ed6a9ed90e0556eaf2c9ce30e2517bf82ef71a0ee921165ba66a796e035418d6a0ff167ed52263309582006b6bd7a7baa2a5dc191cd08f0ca81ada7298cfa20db44d7eda31e7777b4bbe05822a101581e581c28a1ae6554b66549078f72b0e75e13cb0876cbbefac4f292b43e940e');
  });
});
