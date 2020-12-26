// @flow
import { RustModule } from '../../cardanoCrypto/rustLoader';

export type TransactionMetadata = {|
  label: string,
  data: Object,
|};

export function createMetadata(
  metadata: Array<TransactionMetadata>
): RustModule.WalletV4.TransactionMetadata {
  const transactionMetadata = RustModule.WalletV4.TransactionMetadata.new();

  metadata.forEach((meta: TransactionMetadata) => {
    const metadatum = RustModule.WalletV4.encode_json_str_to_metadatum(
      JSON.stringify(meta.data),
      RustModule.WalletV4.MetadataJsonSchema.BasicConversions
    );
    transactionMetadata.insert(RustModule.WalletV4.BigNum.from_str(meta.label), metadatum);
  });

  return transactionMetadata;
}
