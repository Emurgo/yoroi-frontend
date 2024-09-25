// @flow
import '../test-config.forTests';
import { RustModule } from './rustLoader';
import { CatalystLabels, generateRegistration } from './catalyst';
import { hexToBytes } from '../../../../coreUtils';

beforeAll(async () => {
  await RustModule.load();
});

test('Generate Catalyst registration tx', async () => {
  RustModule.WasmScope(Scope => {
    const stakePrivateKey = Scope.WalletV4.PrivateKey.from_normal_bytes(
      hexToBytes('f5beaeff7932a4164d270afde7716067582412e8977e67986cd9b456fc082e3a')
    );
    const catalystPrivateKey = Scope.WalletV4.PrivateKey.from_extended_bytes(
      hexToBytes('4820f7ce221e177c8eae2b2ee5c1f1581a0d88ca5c14329d8f2389e77a465655c27662621bfb99cb9445bf8114cc2a630afd2dd53bc88c08c5f2aed8e9c7cb89')
    );

    // stake_test1uzhr5zn6akj2affzua8ylcm8t872spuf5cf6tzjrvnmwemcehgcjm (e0ae3a0a7aeda4aea522e74e4fe36759fca80789a613a58a4364f6ecef)
    const address = Scope.WalletV4.RewardAddress.new(
      Scope.WalletV4.NetworkInfo.testnet_preprod().network_id(),
      Scope.WalletV4.Credential.from_keyhash(stakePrivateKey.to_public().hash()),
    );

    const nonce = 1234;
    const metadata = generateRegistration({
      stakePrivateKey,
      catalystPrivateKey,
      receiverAddress: address.to_address().to_hex(),
      slotNumber: nonce,
    });

    const result = Scope.WalletV4.GeneralTransactionMetadata.from_bytes(
      Scope.WalletV4.MetadataList.from_bytes(metadata.to_bytes()).get(0).to_bytes()
    );

    const data = result.get(Scope.WalletV4.BigNum.from_str(CatalystLabels.DATA.toString()));
    if (data == null) throw new Error('Should never happen');

    const sig = result.get(Scope.WalletV4.BigNum.from_str(CatalystLabels.SIG.toString()));
    if (sig == null) throw new Error('Should never happen');

    const dataJson = Scope.WalletV4.decode_metadatum_to_json_str(
      data,
      Scope.WalletV4.MetadataJsonSchema.BasicConversions
    );
    const sigJson = Scope.WalletV4.decode_metadatum_to_json_str(
      sig,
      Scope.WalletV4.MetadataJsonSchema.BasicConversions
    );

    const expectedResult = {
      '61284': {
        '1': [['0x0036ef3e1f0d3f5989e2d155ea54bdb2a72c4c456ccb959af4c94868f473f5a0', 1]],
        '2': '0x86870efc99c453a873a16492ce87738ec79a0ebd064379a62e2c9cf4e119219e',
        '3': '0xe0ae3a0a7aeda4aea522e74e4fe36759fca80789a613a58a4364f6ecef',
        '4': nonce,
        '5': 0,
      },
      '61285': {
        '1': '0x503e1b9e607e32f0d74a93da7261eb603132cf95d5405ee36d14431d3212bd49902445eeb47168e48858e295fd495cfad69f9fc1ea6da0ee3272c016a0bdef0b'
      }
    };
    expect({
      [CatalystLabels.DATA]: JSON.parse(dataJson),
      [CatalystLabels.SIG]: JSON.parse(sigJson),
    }).toEqual(expectedResult);
  });
});
