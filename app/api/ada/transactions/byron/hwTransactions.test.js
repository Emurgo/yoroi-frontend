// @flow

import '../../lib/test-config';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import {
  createLedgerSignTxPayload,
  prepareAndBroadcastLedgerSignedTx,
  createTrezorSignTxPayload,
} from './hwTransactions';
import { networks } from '../../lib/storage/database/prepackaged/networks';

beforeAll(async () => {
  await RustModule.load();
});

test('Create Trezor transaction', async () => {
  const unsignedTx = RustModule.WalletV2.Transaction.from_json(
    {
      inputs: [
        {
          id: '058405892f66075d83abd1b7fe341d2d5bfd2f6122b2f874700039e5078e0dd5',
          index: 1
        },
        {
          id: '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba20',
          index: 1
        },
        {
          id: '1029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3657',
          index: 0
        }
      ],
      outputs: [
        {
          address: 'Ae2tdPwUPEZAVDjkPPpwDhXMSAjH53CDmd2xMwuR9tZMAZWxLhFphrHKHXe',
          value: 5326134
        }
      ]
    }
  );

  const txBodyMap = {
    '058405892f66075d83abd1b7fe341d2d5bfd2f6122b2f874700039e5078e0dd5':
      '839f8200d8185824825820c54e97f5d6fa9b1170a986d081dc860f9721e253b40c0c6b79edbab922f235f201ff9f8282d818582183581c429bfc0da2711bf754edc60f6ec0349c4fb02eabfd5b66597d25a9e3a0001a1d25653f1a000f42408282d818582183581cf03274dad3c7a1b7aa3951a4cdecc167d5c17d82f3cbfb291f71d2c2a0001a98ca71d01a0016cc70ffa0',
    '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba20':
      '839f8200d8185824825820591267207e36e03789c74b282cce9d0637325d46d6bd5b9a27fe6e75abf1b08700ff9f8282d818582183581ce999ddf0e7b22ffdc8a6ea041ba4b1382c4834fd553f308c407d9e1aa0001a8132b4e41a001e84808282d818582183581c829e3e4cecea3cd73fae255123bef7be317ed0ac3be40c1616ade9fea0001ab3ff94641a002b3686ffa0',
    '1029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3657':
      '839f8200d81858248258202bddf3710ee44383a5a9f53aee9f3e27d1d8382537b8b21b30e6314c2897664b00ff9f8282d818582183581c02d2cf0eca7f55fdce2f4c51a307583f50eae31c052c934ae59bf704a0001a0a0584011a000f42408282d818582183581ca3f6cfcb530b5c1d148a07707baef7fea7d61217117903c4109694d2a0001a3dca8fd51a000a0a5cffa0',
  };

  const baseConfig = networks.ByronMainnet.BaseConfig[0];
  if (baseConfig.ByronNetworkId == null) {
    throw new Error(`missing Byron network id`);
  }
  const { ByronNetworkId } = baseConfig;
  const response = await createTrezorSignTxPayload(
    {
      unsignedTx,
      changeAddr: [],
      senderUtxos: [{
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
        receiver: 'Ae2tdPwUPEZ9qgUrkrTqqTa5iKkaURYNFqM1gSbPXicn21LYyF184ZXnQ5R',
        tx_hash: '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba20',
        tx_index: 1,
        utxo_id: '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba201',
        addressing: {
          path: [2147483692, 2147485463, 2147483648, 1, 2],
          startLevel: 1
        }
      }, {
        amount: '1000000',
        receiver: 'Ae2tdPwUPEYw66yGJJfbzNxTerpKV3zQRcd746cUtNSFgAGSYx1YLHnQW6c',
        tx_hash: '1029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3657',
        tx_index: 0,
        utxo_id: '1029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b36570',
        addressing: {
          path: [2147483692, 2147485463, 2147483648, 0, 7],
          startLevel: 1
        }
      }],
      certificate: undefined,
    },
    async (_request) => txBodyMap,
    ByronNetworkId
  );
  expect(response).toStrictEqual({
    inputs: [{
      path: `m/44'/1815'/0'/1/1`,
      prev_hash: '058405892f66075d83abd1b7fe341d2d5bfd2f6122b2f874700039e5078e0dd5',
      prev_index: 1,
      type: 0
    }, {
      path: `m/44'/1815'/0'/1/2`,
      prev_hash: '3677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba20',
      prev_index: 1,
      type: 0
    }, {
      path: `m/44'/1815'/0'/0/7`,
      prev_hash: '1029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b3657',
      prev_index: 0,
      type: 0
    }],
    outputs: [{
      address: 'Ae2tdPwUPEZAVDjkPPpwDhXMSAjH53CDmd2xMwuR9tZMAZWxLhFphrHKHXe',
      amount: `5326134`
    }],
    transactions: [
      '839f8200d8185824825820c54e97f5d6fa9b1170a986d081dc860f9721e253b40c0c6b79edbab922f235f201ff9f8282d818582183581c429bfc0da2711bf754edc60f6ec0349c4fb02eabfd5b66597d25a9e3a0001a1d25653f1a000f42408282d818582183581cf03274dad3c7a1b7aa3951a4cdecc167d5c17d82f3cbfb291f71d2c2a0001a98ca71d01a0016cc70ffa0',
      '839f8200d8185824825820591267207e36e03789c74b282cce9d0637325d46d6bd5b9a27fe6e75abf1b08700ff9f8282d818582183581ce999ddf0e7b22ffdc8a6ea041ba4b1382c4834fd553f308c407d9e1aa0001a8132b4e41a001e84808282d818582183581c829e3e4cecea3cd73fae255123bef7be317ed0ac3be40c1616ade9fea0001ab3ff94641a002b3686ffa0',
      '839f8200d81858248258202bddf3710ee44383a5a9f53aee9f3e27d1d8382537b8b21b30e6314c2897664b00ff9f8282d818582183581c02d2cf0eca7f55fdce2f4c51a307583f50eae31c052c934ae59bf704a0001a0a0584011a000f42408282d818582183581ca3f6cfcb530b5c1d148a07707baef7fea7d61217117903c4109694d2a0001a3dca8fd51a000a0a5cffa0',
    ],
    protocol_magic: 764824073
  });
});

function getLedgerTx(): RustModule.WalletV2.Transaction {
  return RustModule.WalletV2.Transaction.from_json(
    {
      inputs: [
        {
          id: '00665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f',
          index: 0
        },
        {
          id: '00665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f',
          index: 1
        }
      ],
      outputs: [
        {
          address: 'Ae2tdPwUPEYyHfxoQYGPhyHuAfLHKfLubzo4kxyw2XDnLsLmACtjufaBs33',
          value: 638497
        }
      ]
    }
  );
}

test('Create Ledger transaction', async () => {
  const response = await createLedgerSignTxPayload(
    {
      unsignedTx: getLedgerTx(),
      changeAddr: [],
      senderUtxos: [{
        amount: '1',
        receiver: 'Ae2tdPwUPEYx9VwaMgiv2K3Fa9QUCpzt3taBABk5YUbwLodU9pMEvk3s7L8',
        tx_hash: '00665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f',
        tx_index: 0,
        utxo_id: '00665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f0',
        addressing: {
          path: [2147483692, 2147485463, 2147483648, 0, 1],
          startLevel: 1
        }
      }, {
        amount: '812291',
        receiver: 'Ae2tdPwUPEZHdgNf6u92npfdhxU8u216NoMSZQUFmscVRMaUYcM8Y6xyHbc',
        tx_hash: '00665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f',
        tx_index: 1,
        utxo_id: '00665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f1',
        addressing: {
          path: [2147483692, 2147485463, 2147483648, 1, 3],
          startLevel: 1
        }
      }],
      certificate: undefined,
    },
    (_txHashes) => Promise.resolve({
      '00665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f': '839f8200d8185824825820c012824049c0ed4c8f1f8b1919a820b6e8995ce0447175bb08d1e9a109a76fc3008200d8185824825820c012824049c0ed4c8f1f8b1919a820b6e8995ce0447175bb08d1e9a109a76fc301ff9f8282d818582183581c0d6eae4219c4e7df87db93ae720f7c7eb39b0bd950b88eb4c2ddc070a0001a1ecb30bd018282d818582183581cd0b882f26febd0b150b544920adcbedf7ce42128d3b34999eb5c103aa0001a3827fea71a000c6503ffa0',
    }),
  );
  expect(response).toStrictEqual({
    inputs: [{
      txDataHex: '839f8200d8185824825820c012824049c0ed4c8f1f8b1919a820b6e8995ce0447175bb08d1e9a109a76fc3008200d8185824825820c012824049c0ed4c8f1f8b1919a820b6e8995ce0447175bb08d1e9a109a76fc301ff9f8282d818582183581c0d6eae4219c4e7df87db93ae720f7c7eb39b0bd950b88eb4c2ddc070a0001a1ecb30bd018282d818582183581cd0b882f26febd0b150b544920adcbedf7ce42128d3b34999eb5c103aa0001a3827fea71a000c6503ffa0',
      outputIndex: 0,
      path: [2147483692, 2147485463, 2147483648, 0, 1]
    }, {
      txDataHex: '839f8200d8185824825820c012824049c0ed4c8f1f8b1919a820b6e8995ce0447175bb08d1e9a109a76fc3008200d8185824825820c012824049c0ed4c8f1f8b1919a820b6e8995ce0447175bb08d1e9a109a76fc301ff9f8282d818582183581c0d6eae4219c4e7df87db93ae720f7c7eb39b0bd950b88eb4c2ddc070a0001a1ecb30bd018282d818582183581cd0b882f26febd0b150b544920adcbedf7ce42128d3b34999eb5c103aa0001a3827fea71a000c6503ffa0',
      outputIndex: 1,
      path: [2147483692, 2147485463, 2147483648, 1, 3]
    }],
    outputs: [{
      address58: 'Ae2tdPwUPEYyHfxoQYGPhyHuAfLHKfLubzo4kxyw2XDnLsLmACtjufaBs33',
      amountStr: '638497'
    }]
  });
});


test('Sign Ledger transaction', async () => {
  const response = await prepareAndBroadcastLedgerSignedTx(
    {
      txHashHex: '166dfde5b183b7e09483afbbfce7b41e7d6fed34b405cc1041b45f27e8b05d47',
      witnesses: [{
        path: [2147483692, 2147485463, 2147483648, 0, 1],
        witnessSignatureHex: '85a076d18751b7488e158b5d01a06f3dc7276c19cfe013952d3b5cb8694ca67c7a578de6d38c234dc100faea58e2f35f2c334ee11d74154a223aa79ff6ff7409',
      }, {
        path: [2147483692, 2147485463, 2147483648, 1, 3],
        witnessSignatureHex: 'bc5613dc018869e130eeda111e68402d4592527365d17a3d8ca5a2d171e6fca47616cf512610b0d7a88e360ef9640b8b38d1a216ccd9ef28cb4385d3df957704',
      }]
    },
    getLedgerTx(),
    RustModule.WalletV2.PublicKey.from_hex('2d7e30fe0be4f5cdcd3bef97fba6a47a56b7058ff6956b357de0d44c69b331f87da06fd7af93be6b79b63e0d65a011e31207c92152d7f1cb1a9bf74b44e53cbb'),
    3,
    (request) => {
      expect(request.id).toEqual('166dfde5b183b7e09483afbbfce7b41e7d6fed34b405cc1041b45f27e8b05d47');

      const base64Tx = Buffer.from(request.encodedTx).toString('base64');
      expect(base64Tx).toEqual('goOfggDYGFgkglggAGZa3+9knrjnzLEEwU1MM8y6cIrrDsheajRVW7drEZ8AggDYGFgkglggAGZa3+9knrjnzLEEwU1MM8y6cIrrDsheajRVW7drEZ8B/5+CgtgYWCGDWBwY3do+atZ8+m6RNX519WWDW4Y3no8/IvYPqKMSoAAanFX+3hoACb4h/6CCggDYGFiFglhAoJAbHwihzZC2q/g+HDufxDgMkG1VOjyyrFlsQov3RlqSYbEWLYC5S9Qc0kVC2jYg13A2hPsK9snD559xROKlb1hAhaB20YdRt0iOFYtdAaBvPccnbBnP4BOVLTtcuGlMpnx6V43m04wjTcEA+upY4vNfLDNO4R10FUoiOqef9v90CYIA2BhYhYJYQGeymmHRi6Ot4+YV7s8BlAN2LT5Xtf90WZgHrJLdc6g/SAODqL5kCnLSVoxBqELV3poVLvh9QtccH+28lveCO8dYQLxWE9wBiGnhMO7aER5oQC1FklJzZdF6PYylotFx5vykdhbPUSYQsNeojjYO+WQLizjRohbM2e8oy0OF09+VdwQ=');
      return Promise.resolve({ txId: request.id });
    },
  );
  expect(response.txId).toEqual('166dfde5b183b7e09483afbbfce7b41e7d6fed34b405cc1041b45f27e8b05d47');
});
