// @flow

import { RustModule } from './rustLoader';

export const CatalystLabels = Object.freeze({
  DATA: 61284,
  SIG: 61285,
});
export function generateRegistration(request: {|
  stakePrivateKey: RustModule.WalletV4.PrivateKey,
  catalystPrivateKey: RustModule.WalletV4.PrivateKey,
  receiverAddress: Buffer,
|}): RustModule.WalletV4.GeneralTransactionMetadata {

  /**
    * Catalyst follows a certain standard to prove the voting power
    * A transaction is submitted with following metadata format for the registration process
    * label: 61284
    * {
    *   1: "pubkey generated for catalyst app",
    *   2: "stake key public key",
    *   3: "address to receive rewards to"
    * }
    * label: 61285
    * {
    *   1: "pubkey signed using stakekey"
    * }
    */

  const registrationData = RustModule.WalletV4.encode_json_str_to_metadatum(
    JSON.stringify({
      '1': `0x${Buffer.from(request.catalystPrivateKey.to_public().as_bytes()).toString('hex')}`,
      '2': `0x${Buffer.from(request.stakePrivateKey.to_public().as_bytes()).toString('hex')}`,
      '3': `0x${Buffer.from(request.receiverAddress).toString('hex')}`,
    }),
    RustModule.WalletV4.MetadataJsonSchema.BasicConversions
  );
  const generalMetadata = RustModule.WalletV4.GeneralTransactionMetadata.new();
  generalMetadata.insert(
    RustModule.WalletV4.BigNum.from_str(CatalystLabels.DATA.toString()),
    registrationData
  );

  const catalystSignature = request.stakePrivateKey
    .sign(generalMetadata.to_bytes())
    .to_hex();

  generalMetadata.insert(
    RustModule.WalletV4.BigNum.from_str(CatalystLabels.SIG.toString()),
    RustModule.WalletV4.encode_json_str_to_metadatum(
      JSON.stringify({
        '1': `0x${catalystSignature}`,
      }),
      RustModule.WalletV4.MetadataJsonSchema.BasicConversions
    )
  );

  return generalMetadata;
}
