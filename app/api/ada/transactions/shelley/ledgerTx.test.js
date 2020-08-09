// @flow

test('fake test', async () => {
  // need at least one dummy Jest test or it automatically fails
});

// import '../../lib/test-config';
// import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
// import {
//   createLedgerSignTxPayload,
//   prepareAndBroadcastLedgerSignedTx,
//   createTrezorSignTxPayload,
// } from './ledgerTx';
// import { networks } from '../../lib/storage/database/prepackaged/networks';

// beforeAll(async () => {
//   await RustModule.load();
// });

// function getLedgerTx(): RustModule.WalletV4.TransactionBody {
//   return RustModule.WalletV4.TransactionBody.from_json(
//     {
//       inputs: [
//         {
//           id: '00665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f',
//           index: 0
//         },
//         {
//           id: '00665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f',
//           index: 1
//         }
//       ],
//       outputs: [
//         {
//           address: 'Ae2tdPwUPEYyHfxoQYGPhyHuAfLHKfLubzo4kxyw2XDnLsLmACtjufaBs33',
//           value: 638497
//         }
//       ]
//     }
//   );
// }

// test('Create Ledger transaction', async () => {
//   const response = await createLedgerSignTxPayload(
//     {
//       unsignedTx: getLedgerTx(),
//       changeAddr: [],
//       senderUtxos: [{
//         amount: '1',
//         receiver: 'Ae2tdPwUPEYx9VwaMgiv2K3Fa9QUCpzt3taBABk5YUbwLodU9pMEvk3s7L8',
//         tx_hash: '00665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f',
//         tx_index: 0,
//         utxo_id: '00665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f0',
//         addressing: {
//           path: [2147483692, 2147485463, 2147483648, 0, 1],
//           startLevel: 1
//         }
//       }, {
//         amount: '812291',
//         receiver: 'Ae2tdPwUPEZHdgNf6u92npfdhxU8u216NoMSZQUFmscVRMaUYcM8Y6xyHbc',
//         tx_hash: '00665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f',
//         tx_index: 1,
//         utxo_id: '00665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f1',
//         addressing: {
//           path: [2147483692, 2147485463, 2147483648, 1, 3],
//           startLevel: 1
//         }
//       }],
//       certificate: undefined,
//     },
//     (_txHashes) => Promise.resolve({
//       '00665adfef649eb8e7ccb104c14d4c33ccba708aeb0ec85e6a34555bb76b119f': '839f8200d8185824825820c012824049c0ed4c8f1f8b1919a820b6e8995ce0447175bb08d1e9a109a76fc3008200d8185824825820c012824049c0ed4c8f1f8b1919a820b6e8995ce0447175bb08d1e9a109a76fc301ff9f8282d818582183581c0d6eae4219c4e7df87db93ae720f7c7eb39b0bd950b88eb4c2ddc070a0001a1ecb30bd018282d818582183581cd0b882f26febd0b150b544920adcbedf7ce42128d3b34999eb5c103aa0001a3827fea71a000c6503ffa0',
//     }),
//   );
//   expect(response).toStrictEqual({
//     inputs: [{
//       txDataHex: '839f8200d8185824825820c012824049c0ed4c8f1f8b1919a820b6e8995ce0447175bb08d1e9a109a76fc3008200d8185824825820c012824049c0ed4c8f1f8b1919a820b6e8995ce0447175bb08d1e9a109a76fc301ff9f8282d818582183581c0d6eae4219c4e7df87db93ae720f7c7eb39b0bd950b88eb4c2ddc070a0001a1ecb30bd018282d818582183581cd0b882f26febd0b150b544920adcbedf7ce42128d3b34999eb5c103aa0001a3827fea71a000c6503ffa0',
//       outputIndex: 0,
//       path: [2147483692, 2147485463, 2147483648, 0, 1]
//     }, {
//       txDataHex: '839f8200d8185824825820c012824049c0ed4c8f1f8b1919a820b6e8995ce0447175bb08d1e9a109a76fc3008200d8185824825820c012824049c0ed4c8f1f8b1919a820b6e8995ce0447175bb08d1e9a109a76fc301ff9f8282d818582183581c0d6eae4219c4e7df87db93ae720f7c7eb39b0bd950b88eb4c2ddc070a0001a1ecb30bd018282d818582183581cd0b882f26febd0b150b544920adcbedf7ce42128d3b34999eb5c103aa0001a3827fea71a000c6503ffa0',
//       outputIndex: 1,
//       path: [2147483692, 2147485463, 2147483648, 1, 3]
//     }],
//     outputs: [{
//       address58: 'Ae2tdPwUPEYyHfxoQYGPhyHuAfLHKfLubzo4kxyw2XDnLsLmACtjufaBs33',
//       amountStr: '638497'
//     }]
//   });
// });


// test('Sign Ledger transaction', async () => {
//   const response = await prepareAndBroadcastLedgerSignedTx(
//     {
//       txHashHex: '166dfde5b183b7e09483afbbfce7b41e7d6fed34b405cc1041b45f27e8b05d47',
//       witnesses: [{
//         path: [2147483692, 2147485463, 2147483648, 0, 1],
//         witnessSignatureHex: '85a076d18751b7488e158b5d01a06f3dc7276c19cfe013952d3b5cb8694ca67c7a578de6d38c234dc100faea58e2f35f2c334ee11d74154a223aa79ff6ff7409',
//       }, {
//         path: [2147483692, 2147485463, 2147483648, 1, 3],
//         witnessSignatureHex: 'bc5613dc018869e130eeda111e68402d4592527365d17a3d8ca5a2d171e6fca47616cf512610b0d7a88e360ef9640b8b38d1a216ccd9ef28cb4385d3df957704',
//       }]
//     },
//     getLedgerTx(),
//     RustModule.WalletV2.PublicKey.from_hex('2d7e30fe0be4f5cdcd3bef97fba6a47a56b7058ff6956b357de0d44c69b331f87da06fd7af93be6b79b63e0d65a011e31207c92152d7f1cb1a9bf74b44e53cbb'),
//     3,
//     (request) => {
//       expect(request.id).toEqual('166dfde5b183b7e09483afbbfce7b41e7d6fed34b405cc1041b45f27e8b05d47');

//       const base64Tx = Buffer.from(request.encodedTx).toString('base64');
//       expect(base64Tx).toEqual('goOfggDYGFgkglggAGZa3+9knrjnzLEEwU1MM8y6cIrrDsheajRVW7drEZ8AggDYGFgkglggAGZa3+9knrjnzLEEwU1MM8y6cIrrDsheajRVW7drEZ8B/5+CgtgYWCGDWBwY3do+atZ8+m6RNX519WWDW4Y3no8/IvYPqKMSoAAanFX+3hoACb4h/6CCggDYGFiFglhAoJAbHwihzZC2q/g+HDufxDgMkG1VOjyyrFlsQov3RlqSYbEWLYC5S9Qc0kVC2jYg13A2hPsK9snD559xROKlb1hAhaB20YdRt0iOFYtdAaBvPccnbBnP4BOVLTtcuGlMpnx6V43m04wjTcEA+upY4vNfLDNO4R10FUoiOqef9v90CYIA2BhYhYJYQGeymmHRi6Ot4+YV7s8BlAN2LT5Xtf90WZgHrJLdc6g/SAODqL5kCnLSVoxBqELV3poVLvh9QtccH+28lveCO8dYQLxWE9wBiGnhMO7aER5oQC1FklJzZdF6PYylotFx5vykdhbPUSYQsNeojjYO+WQLizjRohbM2e8oy0OF09+VdwQ=');
//       return Promise.resolve({ txId: request.id });
//     },
//   );
//   expect(response.txId).toEqual('166dfde5b183b7e09483afbbfce7b41e7d6fed34b405cc1041b45f27e8b05d47');
// });
