// @flow

import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';
import type {
  JormungandrFeeConfig,
} from '../../../ada/lib/storage/database/primitives/tables';

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
