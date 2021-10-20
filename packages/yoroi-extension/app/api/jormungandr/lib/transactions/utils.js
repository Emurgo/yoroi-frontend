// @flow

import BigNumber from 'bignumber.js';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';
import type {
  JormungandrFeeConfig,
  DbTransaction,
  DbBlock,
  TokenRow,
} from '../../../ada/lib/storage/database/primitives/tables';
import type {
  UserAnnotation,
} from '../../../ada/transactions/types';
import type { TransactionExportRow } from '../../../export';
import {
  transactionTypes,
} from '../../../ada/transactions/types';
import { formatBigNumberToFloatString } from '../../../../utils/formatters';

export function generateAuthData(
  bindingSignature: RustModule.WalletV3.AccountBindingSignature,
  certificate: RustModule.WalletV3.Certificate,
): RustModule.WalletV3.PayloadAuthData {
  if (certificate == null) {
    return RustModule.WalletV3.PayloadAuthData.for_no_payload();
  }

  switch (certificate.get_type()) {
    case RustModule.WalletV3.CertificateKind.StakeDelegation: {
      return RustModule.WalletV3.PayloadAuthData.for_stake_delegation(
        RustModule.WalletV3.StakeDelegationAuthData.new(
          bindingSignature
        )
      );
    }
    default: throw new Error('generateAuthData unexpected cert type ' + certificate.get_type());
  }
}

export function generateFee(
  feeConfig: JormungandrFeeConfig,
): RustModule.WalletV3.Fee {
  const perCertificate = RustModule.WalletV3.PerCertificateFee.new();
  const genesisPerCert = feeConfig.per_certificate_fees;
  if (genesisPerCert) {
    if (genesisPerCert.certificate_pool_registration != null) {
      perCertificate.set_pool_registration(
        RustModule.WalletV3.Value.from_str(genesisPerCert.certificate_pool_registration)
      );
    }
    if (genesisPerCert.certificate_stake_delegation != null) {
      perCertificate.set_stake_delegation(
        RustModule.WalletV3.Value.from_str(genesisPerCert.certificate_stake_delegation)
      );
    }
    if (genesisPerCert.certificate_owner_stake_delegation != null) {
      perCertificate.set_owner_stake_delegation(
        RustModule.WalletV3.Value.from_str(genesisPerCert.certificate_owner_stake_delegation)
      );
    }
  }

  const feeAlgorithm = RustModule.WalletV3.Fee.linear_fee(
    RustModule.WalletV3.Value.from_str(feeConfig.constant),
    RustModule.WalletV3.Value.from_str(feeConfig.coefficient),
    RustModule.WalletV3.Value.from_str(feeConfig.certificate),
    perCertificate,
  );

  return feeAlgorithm;
}

export function convertJormungandrTransactionsToExportRows(
  transactions: $ReadOnlyArray<$ReadOnly<{
    ...DbTransaction,
    ...WithNullableFields<DbBlock>,
    ...UserAnnotation,
    id: string,
    ...,
  }>>,
  defaultAssetRow: $ReadOnly<TokenRow>,
): Array<TransactionExportRow> {
  const result = [];
  for (const tx of transactions) {
    if (tx.block != null) {
      result.push({
        date: tx.block.BlockTime,
        type: tx.type === transactionTypes.INCOME ? 'in' : 'out',
        amount: formatBigNumberToFloatString(
          tx.amount.get(defaultAssetRow.Identifier)
            ?.abs()
            .shiftedBy(-defaultAssetRow.Metadata.numberOfDecimals)
            ?? new BigNumber(0)
        ),
        fee: formatBigNumberToFloatString(
          tx.fee.get(defaultAssetRow.Identifier)
            ?.abs()
            .shiftedBy(-defaultAssetRow.Metadata.numberOfDecimals)
            ?? new BigNumber(0)
        ),
        id: tx.id,
      });
    }
  }
  return result;
}
