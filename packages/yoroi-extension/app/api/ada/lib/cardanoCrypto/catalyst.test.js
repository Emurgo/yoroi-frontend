// @flow
import '../test-config';
import { RustModule } from './rustLoader';
import { CatalystLabels, generateRegistration } from './catalyst';

beforeAll(async () => {
  await RustModule.load();
});

test('Generate Catalyst registration tx', async () => {
  const paymentKey = RustModule.WalletV4.PublicKey.from_bytes(
    Buffer.from('3273a5316e4de228863bd7cf8dac90d57149e1a595f3dd131073b84e35546676', 'hex')
  );
  const stakePrivateKey = RustModule.WalletV4.PrivateKey.from_normal_bytes(
    Buffer.from('ad49418841a35ef4281a8a6bb5337037225dd49ee133c9724f24df9dded41ea9', 'hex')
  );
  const catalystPrivateKey = RustModule.WalletV4.PrivateKey.from_extended_bytes(
    Buffer.from('4820f7ce221e177c8eae2b2ee5c1f1581a0d88ca5c14329d8f2389e77a465655c27662621bfb99cb9445bf8114cc2a630afd2dd53bc88c08c5f2aed8e9c7cb89', 'hex')
  );

  // eslint-disable-next-line max-len
  // addr1qx0srp4ptag9j2e3rdtesrsxe708j80uhxv2r7utl4jaqm4rhf28yg7fkl6dd329cuxq7tqahhujtt5cmdmp9pa2t2zsp2vc6a (019f0186a15f50592b311b57980e06cf9e791dfcb998a1fb8bfd65d06ea3ba547223c9b7f4d6c545c70c0f2c1dbdf925ae98db761287aa5a85)
  const address = RustModule.WalletV4.BaseAddress.new(
    RustModule.WalletV4.NetworkInfo.mainnet().network_id(),
    RustModule.WalletV4.StakeCredential.from_keyhash(paymentKey.hash()),
    RustModule.WalletV4.StakeCredential.from_keyhash(stakePrivateKey.to_public().hash()),
  );

  const result = generateRegistration({
    stakePrivateKey,
    catalystPrivateKey,
    receiverAddress: Buffer.from(address.to_address().to_bytes()),
    slotNumber: 1234,
  });

  const data = result.get(RustModule.WalletV4.BigNum.from_str(CatalystLabels.DATA.toString()));
  if (data == null) throw new Error('Should never happen');

  const sig = result.get(RustModule.WalletV4.BigNum.from_str(CatalystLabels.SIG.toString()));
  if (sig == null) throw new Error('Should never happen');

  const dataJson = RustModule.WalletV4.decode_metadatum_to_json_str(
    data,
    RustModule.WalletV4.MetadataJsonSchema.BasicConversions
  );
  const sigJson = RustModule.WalletV4.decode_metadatum_to_json_str(
    sig,
    RustModule.WalletV4.MetadataJsonSchema.BasicConversions
  );

  const expectedResult = {
    '61284': {
      '1': '0x0036ef3e1f0d3f5989e2d155ea54bdb2a72c4c456ccb959af4c94868f473f5a0',
      '2': '0x1c5d88aa573da97e5a4667e0f7c4a9c6a3d848934c3b0a5b9296b401540f2aef',
      '3': '0x019f0186a15f50592b311b57980e06cf9e791dfcb998a1fb8bfd65d06ea3ba547223c9b7f4d6c545c70c0f2c1dbdf925ae98db761287aa5a85',
      '4': 1234,
    },
    '61285': {
      '2': '0xcc1276aebd2dafc0db75b362653a5259a1504fd5fcc47a2b8d603c7d1eb0f5eafd96c5ae384fb221ceb49354ae9f5d87f98fd838fe6dd8852a444e9c7e32ce0c'
    }
  };
  expect({
    [CatalystLabels.DATA]: JSON.parse(dataJson),
    [CatalystLabels.SIG]: JSON.parse(sigJson),
  }).toEqual(expectedResult);
});
