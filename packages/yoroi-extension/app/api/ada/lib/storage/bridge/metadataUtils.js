// @flow
import { RustModule } from '../../cardanoCrypto/rustLoader';
import { isHex } from '@emurgo/yoroi-lib/dist/internals/utils/index';

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

  const auxData = RustModule.WalletV4.AuxiliaryData.new();
  auxData.set_metadata(transactionMetadata);
  return auxData;
}

export function parseMetadata(s: any): string {
  if (isHex(s)) {
    return RustModule.WasmScope(Scope => {
      const metadatum = Scope.WalletV4.TransactionMetadatum.from_hex(hex);
      const metadataString = Scope.WalletV4.decode_metadatum_to_json_str(
        metadatum, Scope.WalletV4.MetadataJsonSchema.BasicConversions
      );
      return metadataString;
    });
  }
  return JSON.stringify(s);
}

export function parseMetadataDetailed(s: any): string {
  if (isHex(s)) {
    return RustModule.WasmScope(Scope => {
      const metadatum = Scope.WalletV4.TransactionMetadatum.from_hex(hex);
      const metadataString = Scope.WalletV4.decode_metadatum_to_json_str(
        metadatum, Scope.WalletV4.MetadataJsonSchema.DetailedSchema
      );
      return metadataString;
    });
  }
  return JSON.stringify(s);
}
