// @flow

import '../../lib/test-config';
import BigNumber from 'bignumber.js';
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

const network = networks.ByronMainnet;

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
  const certs = RustModule.WalletV4.Certificates.new();

  const stakeCredential = RustModule.WalletV4.StakeCredential.from_keyhash(
    RustModule.WalletV4.PrivateKey.from_extended_bytes(
      // note: this key doesn't belong to the wallet sending the transaction
      Buffer.from('40f11e8501f0695cebdb9e980e007c3979a7dc958af16693d62c45e849d507589029b318010a87ad66465b1384afe4d70573a24eaf2ede273aa1e6a6177d5196', 'hex')
    ).to_public().hash()
  );
  certs.add(RustModule.WalletV4.Certificate.new_stake_registration(
    RustModule.WalletV4.StakeRegistration.new(stakeCredential)
  ));
  txBuilder.set_certs(certs);
  txBuilder.set_fee(RustModule.WalletV4.BigNum.from_str('1000'));
  txBuilder.set_ttl(500);

  const baseConfig = network.BaseConfig
    .reduce((acc, next) => Object.assign(acc, next), {});
  const { ByronNetworkId, ChainNetworkId } = baseConfig;
  const response = await createTrezorSignTxPayload(
    new HaskellShelleyTxSignRequest(
      {
        unsignedTx: txBuilder,
        changeAddr: [],
        senderUtxos,
        certificate: undefined,
      },
      undefined,
      {
        ChainNetworkId: Number.parseInt(baseConfig.ChainNetworkId, 10),
        PoolDeposit: new BigNumber(baseConfig.PoolDeposit),
        KeyDeposit: new BigNumber(baseConfig.KeyDeposit),
      },
      {
        neededHashes: new Set([Buffer.from(stakeCredential.to_bytes()).toString('hex')]),
        wits: new Set() // not needed for this test, but something should be here
      },
    ),
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
    certificates: [{
      path: [
        2147483692,
        2147485463,
        2147483648,
        2,
        0,
      ],
      type: 0,
    }],
  });
});
