// @flow

import { RustModule } from './rustLoader';
import blake2b from 'blake2b';

const HARDENED = 0x80000000;

export const VoteKeyDerivationPath: Array<number> = [
  1694 + HARDENED,
  1815 + HARDENED,
  0 + HARDENED, // acount'
  0, // chain
  0, // address_index
];

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
  delegationsOrVotingPublicKey: Array<[string, number]> | string,
  stakingPublicKey: string,
  rewardAddress: string,
  nonce: number,
  signer: Uint8Array => string,
  votingPurpose: number = 0,
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

  let delegations;
  if (typeof delegationsOrVotingPublicKey === 'string') {
    delegations = [prefix0x(delegationsOrVotingPublicKey), 1];
  } else {
    delegations = delegationsOrVotingPublicKey.map(
      ([votingPublicKey, weight]) => [prefix0x(votingPublicKey), weight]
    );
  }

  const registrationData = RustModule.WalletV4.encode_json_str_to_metadatum(
    JSON.stringify({
      '1': delegations,
      '2': prefix0x(stakingPublicKey),
      '3': prefix0x(rewardAddress),
      '4': nonce,
      '5': votingPurpose,
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
  stakePrivateKey: ?RustModule.WalletV4.PrivateKey,
  votingPublicKey: RustModule.WalletV4.PublicKey,
  receiverAddress: string,
  slotNumber: number,
|}): RustModule.WalletV4.AuxiliaryData {
  return generateRegistrationMetadata(
    request.votingPublicKey.to_hex(),
    request.stakePrivateKey ?
      Buffer.from(request.stakePrivateKey.to_public().as_bytes()).toString('hex') :
      '0'.repeat(32 * 2),
    request.receiverAddress,
    request.slotNumber,
    (hashedMetadata) => (
      request.stakePrivateKey?.sign(hashedMetadata).to_hex() ??
        '0'.repeat(64 * 2)
    ),
  );
}
