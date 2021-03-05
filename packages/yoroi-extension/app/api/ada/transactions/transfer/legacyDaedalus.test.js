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

const network = networks.CardanoMainnet;

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
  networkId: number,
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
    networkId: network.NetworkId,
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
    const inputAmount = new BigNumber('2000000');
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
      amount: inputAmount.toString(),
      assets: [],
    };

    const transferInfo = await daedalusTransferTxFromAddresses({
      addressKeys: addressMap,
      network,
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      outputAddr: {
        address: outAddress
      },
      absSlotNumber: new BigNumber(1),
      protocolParams: getProtocolParams(),
    });

    const expectedFee = new BigNumber('167789');
    expect(transferInfo.fee.getDefault().toString()).toBe(expectedFee.toString());
    expect(transferInfo.recoveredBalance.getDefault().toString()).toBe(inputAmount.toString());
    expect(transferInfo.senders).toEqual([address]);
    expect(transferInfo.receivers[0]).toBe(outAddress);

    // check tx itself
    if (!transferInfo.encodedTx) throw new Error(`Tx not signed`);
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
    expect(
      body.outputs().get(0).amount().coin().to_str()
    ).toBe(inputAmount.minus(expectedFee).toString());

    const witnesses = signedTx.witness_set().bootstraps();
    if (witnesses == null) throw new Error('no bootstrap witnesses found');
    expect(witnesses.len()).toBe(1);
    expect(Buffer.from(witnesses.get(0).to_bytes()).toString('hex')).toBe('8458201e74f51418f5835a063c1f4c69808134852b7ebdb85d0c08e867572c0a035e7b584041e0aa0169c8217af8f8b9c47af12b83a9b7c541390dd30c8428a73d2fdfac447e3f428c3479ee1ad12904ed665cdcc924b22762c1b551833f837f308838f706582006b6bd7a7baa2a5dc191cd08f0ca81ada7298cfa20db44d7eda31e7777b4bbe05822a101581e581c28a1ae6554b66549078f72b0e75e13cb0876cbbefac4f292b43e940e');
  });

  test('Daedalus transfer fails from too small UTXO', async () => {
    const words = 'note park thrive ignore spare latin common balance clap soup school tiny';
    const address = 'DdzFFzCqrhsmcx7z25PRkdbeUNqNNW4brhznpVxbm1EknAahjaCFEjYXg9KJRqkixjgGyz8D9GSX3CFDRoNrZyfJsi61N2FxCnq9yWBy';
    const txId = '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c';
    const inputAmount = new BigNumber('1000');
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
      amount: inputAmount.toString(),
      assets: [],
    };

    expect(daedalusTransferTxFromAddresses({
      addressKeys: addressMap,
      network,
      getUTXOsForAddresses: (_addresses) => Promise.resolve([utxo]),
      outputAddr: {
        address: outAddress
      },
      absSlotNumber: new BigNumber(1),
      protocolParams: getProtocolParams(),
    })).rejects.toThrow(NotEnoughMoneyToSendError);
  });

  test('Daedalus transfer from many UTXO', async () => {
    const words = 'note park thrive ignore spare latin common balance clap soup school tiny';
    const address = 'DdzFFzCqrhsmcx7z25PRkdbeUNqNNW4brhznpVxbm1EknAahjaCFEjYXg9KJRqkixjgGyz8D9GSX3CFDRoNrZyfJsi61N2FxCnq9yWBy';
    const txId = '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c';
    const inputAmount = new BigNumber('1000001');
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
        amount: inputAmount.toString(),
        assets: [],
      });
    }

    const transferInfo = await daedalusTransferTxFromAddresses({
      addressKeys: addressMap,
      network,
      getUTXOsForAddresses: (_addresses) => Promise.resolve(utxo),
      outputAddr: {
        address: outAddress
      },
      absSlotNumber: new BigNumber(1),
      protocolParams: getProtocolParams(),
    });

    const expectedFee = new BigNumber('327993');
    expect(transferInfo.fee.getDefault().toString()).toBe(expectedFee.toString());
    expect(
      transferInfo.recoveredBalance.getDefault().toString()
    ).toBe(inputAmount.times(numUtxos).toString());
    expect(transferInfo.senders).toEqual([address]);
    expect(transferInfo.receivers[0]).toBe(outAddress);

    // check tx itself
    if (!transferInfo.encodedTx) throw new Error(`Tx not signed`);
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
    expect(
      body.outputs().get(0).amount().coin().to_str()
    ).toBe(inputAmount.times(numUtxos).minus(expectedFee).toString());

    const witnesses = signedTx.witness_set().bootstraps();
    if (witnesses == null) throw new Error('no bootstrap witnesses found');
    expect(witnesses.len()).toBe(1);
    expect(Buffer.from(witnesses.get(0).to_bytes()).toString('hex')).toBe('8458201e74f51418f5835a063c1f4c69808134852b7ebdb85d0c08e867572c0a035e7b584055b3ee37d50f4475f58e191bd721bd763d1ba419b091f16925f2a3e69e158c0741848f838e156ed52778604081243a9baa3d69193c64fb1e568f806ef73d9d0c582006b6bd7a7baa2a5dc191cd08f0ca81ada7298cfa20db44d7eda31e7777b4bbe05822a101581e581c28a1ae6554b66549078f72b0e75e13cb0876cbbefac4f292b43e940e');
  });
});
