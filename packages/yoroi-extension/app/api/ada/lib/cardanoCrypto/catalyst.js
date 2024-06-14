// @flow

import { RustModule } from './rustLoader';
import blake2b from 'blake2b';

export const CatalystLabels = Object.freeze({
  DATA: 61284,
  SIG: 61285,
});

function prefix0x(hex: string): string {
  if (hex.startsWith('0x')) {
    return hex;
  }
  return '0x' + hex;
}

export function generateRegistrationMetadata(
  votingPublicKey: string,
  stakingAddress: string,
  rewardAddress: string,
  nonce: number,
  signer: Uint8Array => string,
): RustModule.WalletV4.AuxiliaryData {

  /**
    * Catalyst follows CIP 36 to prove the voting power
    * A transaction is submitted with following metadata format for the registration process
    * label: 61284
    * {
    *   1: "the delegation array",
    *   2: "stake key public key",
    *   3: "address to receive rewards to"
    *   4: "nonce (slot number)"
    *   5: "purpose (0)"
    * }
    * label: 61285
    * {
    *   1: "signature of blake2b-256 hash of the metadata signed using stakekey"
    * }
    */

  const registrationData = RustModule.WalletV4.encode_json_str_to_metadatum(
    JSON.stringify({
      '1': [[prefix0x(votingPublicKey), 1]],
      '2': prefix0x(stakingAddress),
      '3': prefix0x(rewardAddress),
      '4': nonce,
      '5': 0,
    }),
    RustModule.WalletV4.MetadataJsonSchema.BasicConversions
  );
  const generalMetadata = RustModule.WalletV4.GeneralTransactionMetadata.new();
  generalMetadata.insert(
    RustModule.WalletV4.BigNum.from_str(CatalystLabels.DATA.toString()),
    registrationData
  );

  const hashedMetadata = blake2b(256 / 8).update(
    generalMetadata.to_bytes()
  ).digest('binary');

  generalMetadata.insert(
    RustModule.WalletV4.BigNum.from_str(CatalystLabels.SIG.toString()),
    RustModule.WalletV4.encode_json_str_to_metadatum(
      JSON.stringify({
        '1': prefix0x(signer(hashedMetadata)),
      }),
      RustModule.WalletV4.MetadataJsonSchema.BasicConversions
    )
  );

  // This is how Ledger constructs the metadata. We must be consistent with it.
  const metadataList = RustModule.WalletV4.MetadataList.new();
  metadataList.add(
    RustModule.WalletV4.TransactionMetadatum.from_bytes(
      generalMetadata.to_bytes()
    )
  );
  metadataList.add(
    RustModule.WalletV4.TransactionMetadatum.new_list(
      RustModule.WalletV4.MetadataList.new()
    )
  );

  return RustModule.WalletV4.AuxiliaryData.from_bytes(
    metadataList.to_bytes()
  );
}

export function generateRegistration(request: {|
  stakePrivateKey: RustModule.WalletV4.PrivateKey,
  catalystPrivateKey: RustModule.WalletV4.PrivateKey,
  receiverAddress: string,
  slotNumber: number,
  chainNetworkId: number,
|}): RustModule.WalletV4.AuxiliaryData {
  return RustModule.WasmScope(Scope =>
    generateRegistrationMetadata(
      Buffer.from(request.catalystPrivateKey.to_public().as_bytes()).toString('hex'),
      Scope.WalletV4.RewardAddress.new(
        request.chainNetworkId,
        Scope.WalletV4.Credential.from_keyhash(
          request.stakePrivateKey.to_public().hash()
        ),
      ).to_address().to_hex(),
      request.receiverAddress,
      request.slotNumber,
      (hashedMetadata) => request.stakePrivateKey.sign(hashedMetadata).to_hex(),
    )
  );
}

export function generateCip15RegistrationMetadata(
  votingPublicKey: string,
  stakingPublicKey: string,
  rewardAddress: string,
  nonce: number,
  signer: Uint8Array => string,
): RustModule.WalletV4.AuxiliaryData {

  /**
    * Catalyst follows a certain standard to prove the voting power
    * A transaction is submitted with following metadata format for the registration process
    * label: 61284
    * {
    *   1: "pubkey generated for catalyst app",
    *   2: "stake key public key",
    *   3: "address to receive rewards to"
    *   4: "slot number"
    * }
    * label: 61285
    * {
    *   1: "signature of blake2b-256 hash of the metadata signed using stakekey"
    * }
    */

  const registrationData = RustModule.WalletV4.encode_json_str_to_metadatum(
    JSON.stringify({
      '1': prefix0x(votingPublicKey),
      '2': prefix0x(stakingPublicKey),
      '3': prefix0x(rewardAddress),
      '4': nonce,
    }),
    RustModule.WalletV4.MetadataJsonSchema.BasicConversions
  );
  const generalMetadata = RustModule.WalletV4.GeneralTransactionMetadata.new();
  generalMetadata.insert(
    RustModule.WalletV4.BigNum.from_str(CatalystLabels.DATA.toString()),
    registrationData
  );

  const hashedMetadata = blake2b(256 / 8).update(
    generalMetadata.to_bytes()
  ).digest('binary');

  generalMetadata.insert(
    RustModule.WalletV4.BigNum.from_str(CatalystLabels.SIG.toString()),
    RustModule.WalletV4.encode_json_str_to_metadatum(
      JSON.stringify({
        '1': prefix0x(signer(hashedMetadata)),
      }),
      RustModule.WalletV4.MetadataJsonSchema.BasicConversions
    )
  );

  // This is how Ledger constructs the metadata. We must be consistent with it.
  const metadataList = RustModule.WalletV4.MetadataList.new();
  metadataList.add(
    RustModule.WalletV4.TransactionMetadatum.from_bytes(
      generalMetadata.to_bytes()
    )
  );
  metadataList.add(
    RustModule.WalletV4.TransactionMetadatum.new_list(
      RustModule.WalletV4.MetadataList.new()
    )
  );

  return RustModule.WalletV4.AuxiliaryData.from_bytes(
    metadataList.to_bytes()
  );
}
