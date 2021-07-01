// @flow
import { RustModule } from '../../cardanoCrypto/rustLoader';

export type TransactionMetadata = {|
  label: string,
  data: {...},
|};

export function createMetadata(
  metadata: Array<TransactionMetadata>
): RustModule.WalletV4.AuxiliaryData {
  const transactionMetadata = RustModule.WalletV4.GeneralTransactionMetadata.new();

  metadata.forEach((meta: TransactionMetadata) => {
    const metadatum = RustModule.WalletV4.encode_json_str_to_metadatum(
      JSON.stringify(meta.data),
      RustModule.WalletV4.MetadataJsonSchema.BasicConversions
    );
    transactionMetadata.insert(RustModule.WalletV4.BigNum.from_str(meta.label), metadatum);
  });

  return RustModule.WalletV4.AuxiliaryData.new(transactionMetadata);
}

export function parseMetadata(hex: string): any {
  const metadatum = RustModule.WalletV4.TransactionMetadatum.from_bytes(Buffer.from(hex, 'hex'));
  const metadataString = RustModule.WalletV4.decode_metadatum_to_json_str(
    metadatum, RustModule.WalletV4.MetadataJsonSchema.BasicConversions
  );
  return metadataString;
}

export function parseMetadataDetailed(hex: string): any {
  const metadatum = RustModule.WalletV4.TransactionMetadatum.from_bytes(Buffer.from(hex, 'hex'));
  const metadataString = RustModule.WalletV4.decode_metadatum_to_json_str(
    metadatum, RustModule.WalletV4.MetadataJsonSchema.DetailedSchema
  );
  return metadataString;
}
