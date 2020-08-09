// @flow

import '../../lib/test-config';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import {
  createTrezorSignTxPayload,
  toTrezorAddressParameters,
} from './trezorTx';
import { networks } from '../../lib/storage/database/prepackaged/networks';
import { HaskellShelleyTxSignRequest } from './HaskellShelleyTxSignRequest';
import {
  byronAddrToHex,
  getCardanoAddrKeyHash,
  normalizeToAddress,
} from '../../lib/storage/bridge/utils';

beforeAll(async () => {
  await RustModule.load();
});

function getProtocolParams(): {|
  linearFee: RustModule.WalletV4.LinearFee,
  minimumUtxoVal: RustModule.WalletV4.BigNum,
  poolDeposit: RustModule.WalletV4.BigNum,
  keyDeposit: RustModule.WalletV4.BigNum,
  |} {
  return {
    linearFee: RustModule.WalletV4.LinearFee.new(
      RustModule.WalletV4.BigNum.from_str('2'),
      RustModule.WalletV4.BigNum.from_str('500'),
    ),
    minimumUtxoVal: RustModule.WalletV4.BigNum.from_str('1'),
    poolDeposit: RustModule.WalletV4.BigNum.from_str('500'),
    keyDeposit: RustModule.WalletV4.BigNum.from_str('500'),
  };
}

test('Generate address parameters', async () => {
  const path = [2147483692, 2147485463, 2147483648, 1, 1];

  // byron
  {
    const addr = 'Ae2tdPwUPEZLmqiKtMQ4kKL38emRfkyPqBsHqL64pf8uRz6uzsQCd7GAu9R';
    const wasmAddr = normalizeToAddress(addr);
    if (wasmAddr == null) throw new Error(`Unknown address`);
    expect(toTrezorAddressParameters(wasmAddr, path)).toEqual({
      addressType: 8,
      path: "m/44'/1815'/0'/1/1",
    });
  }

  // base
  {
    const addr = 'addr1q8v42wjda8r6mpfj40d36znlgfdcqp7jtj03ah8skh6u8wnrqua2vw243tmjfjt0h5wsru6appuz8c0pfd75ur7myyeqsx9990';
    const wasmAddr = normalizeToAddress(addr);
    if (wasmAddr == null) throw new Error(`Unknown address`);
    expect(toTrezorAddressParameters(wasmAddr, path)).toEqual({
      addressType: 0,
      path: "m/44'/1815'/0'/1/1",
      stakingKeyHash: '63073aa639558af724c96fbd1d01f35d087823e1e14b7d4e0fdb2132'
    });
  }

  // enterprise
  {
    const addr = 'addr1vxq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92su77c6m';
    const wasmAddr = normalizeToAddress(addr);
    if (wasmAddr == null) throw new Error(`Unknown address`);
    expect(toTrezorAddressParameters(wasmAddr, path)).toEqual({
      addressType: 14,
      path: "m/44'/1815'/0'/1/1",
    });
  }

  // pointer
  {
    const addr = 'addr1gxq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92spqgpsl97q83';
    const wasmAddr = normalizeToAddress(addr);
    if (wasmAddr == null) throw new Error(`Unknown address`);
    expect(toTrezorAddressParameters(wasmAddr, path)).toEqual({
      addressType: 4,
      path: "m/44'/1815'/0'/1/1",
      certificatePointer: {
        blockIndex: 1,
        certificateIndex: 3,
        txIndex: 2,
      }
    });
  }
});

test('Create Trezor transaction', async () => {
  const senderUtxos = [{
    amount: '1494128',
    receiver: 'Ae2tdPwUPEZLmqiKtMQ4kKL38emRfkyPqBsHqL64pf8uRz6uzsQCd7GAu9R',
    tx_hash: '058405892f66075d83abd1b7fe341d2d5bfd2f6122b2f874700039e5078e0dd5',
    tx_index: 1,
    utxo_id: '058405892f66075d83abd1b7fe341d2d5bfd2f6122b2f874700039e5078e0dd51',
    addressing: {
      path: [2147483692, 2147485463, 2147483648, 1, 1],
      startLevel: 1
    }
  }, {
    amount: '2832006',
    // base
    receiver: 'addr1q8v42wjda8r6mpfj40d36znlgfdcqp7jtj03ah8skh6u8wnrqua2vw243tmjfjt0h5wsru6appuz8c0pfd75ur7myyeqsx9990',
    tx_hash: '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba20',
    tx_index: 1,
    utxo_id: '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba201',
    addressing: {
      path: [2147483692, 2147485463, 2147483648, 1, 2],
      startLevel: 1
    }
  }, {
    amount: '1000000',
    // enterprise
    receiver: 'addr1vxq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92su77c6m',
    tx_hash: '1029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3657',
    tx_index: 0,
    utxo_id: '1029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b36570',
    addressing: {
      path: [2147483692, 2147485463, 2147483648, 0, 7],
      startLevel: 1
    }
  }, {
    amount: '1000000',
    // pointer
    receiver: 'addr1gxq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92spqgpsl97q83',
    tx_hash: '2029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3658',
    tx_index: 0,
    utxo_id: '2029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b36571',
    addressing: {
      path: [2147483692, 2147485463, 2147483648, 0, 7],
      startLevel: 1
    }
  }];
  const protocolParams = getProtocolParams();
  const txBuilder = RustModule.WalletV4.TransactionBuilder.new(
    protocolParams.linearFee,
    protocolParams.minimumUtxoVal,
    protocolParams.poolDeposit,
    protocolParams.keyDeposit,
  );
  for (const utxo of senderUtxos) {
    const wasmAddr = normalizeToAddress(utxo.receiver);
    if (wasmAddr == null) throw new Error(`Unknown address ${utxo.receiver}`);
    const keyHash = getCardanoAddrKeyHash(wasmAddr);
    if (keyHash === undefined) throw new Error(`Unexpected script address ${utxo.receiver}`);
    if (keyHash == null) {
      txBuilder.add_bootstrap_input(
        RustModule.WalletV4.ByronAddress.from_base58(utxo.receiver),
        RustModule.WalletV4.TransactionInput.new(
          RustModule.WalletV4.TransactionHash.from_bytes(Buffer.from(utxo.tx_hash, 'hex')),
          1
        ),
        RustModule.WalletV4.BigNum.from_str(utxo.amount)
      );
    } else {
      txBuilder.add_key_input(
        keyHash,
        RustModule.WalletV4.TransactionInput.new(
          RustModule.WalletV4.TransactionHash.from_bytes(Buffer.from(utxo.tx_hash, 'hex')),
          1
        ),
        RustModule.WalletV4.BigNum.from_str(utxo.amount)
      );
    }
  }
  txBuilder.add_output(
    RustModule.WalletV4.TransactionOutput.new(
      RustModule.WalletV4.Address.from_bytes(Buffer.from(byronAddrToHex('Ae2tdPwUPEZAVDjkPPpwDhXMSAjH53CDmd2xMwuR9tZMAZWxLhFphrHKHXe'), 'hex')),
      RustModule.WalletV4.BigNum.from_str('5326134')
    )
  );
  txBuilder.set_fee(RustModule.WalletV4.BigNum.from_str('1000'));
  txBuilder.set_ttl(500);

  const baseConfig = networks.ByronMainnet.BaseConfig[0];
  if (baseConfig.ByronNetworkId == null) {
    throw new Error(`missing Byron network id`);
  }
  const { ByronNetworkId, ChainNetworkId } = baseConfig;
  const response = await createTrezorSignTxPayload(
    new HaskellShelleyTxSignRequest({
      unsignedTx: txBuilder,
      changeAddr: [],
      senderUtxos,
      certificate: undefined,
    }, undefined),
    ByronNetworkId,
    Number.parseInt(ChainNetworkId, 10),
  );
  expect(response).toStrictEqual({
    fee: '1000',
    ttl: '500',
    networkId: 1,
    protocolMagic: 764824073,
    inputs: [{
      path: `m/44'/1815'/0'/1/1`,
      prev_hash: '058405892f66075d83abd1b7fe341d2d5bfd2f6122b2f874700039e5078e0dd5',
      prev_index: 1,
    }, {
      path: `m/44'/1815'/0'/1/2`,
      prev_hash: '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba20',
      prev_index: 1,
    }, {
      path: `m/44'/1815'/0'/0/7`,
      prev_hash: '1029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3657',
      prev_index: 0,
    }, {
      path: `m/44'/1815'/0'/0/7`,
      prev_hash: '2029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3658',
      prev_index: 0,
    }],
    outputs: [{
      address: 'Ae2tdPwUPEZAVDjkPPpwDhXMSAjH53CDmd2xMwuR9tZMAZWxLhFphrHKHXe',
      amount: `5326134`
    }],
  });
});
