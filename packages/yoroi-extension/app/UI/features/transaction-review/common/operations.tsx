import { Stack, Typography } from '@mui/material';
import { Balance } from '@yoroi/types';
import React from 'react';
import { asQuantity, Quantities } from '../../../utils/quantities';
import { CertificateType, FormattedTx } from './types';

type OperationsCount = Record<CertificateType, number>;
export type Operations = {
  components: Array<{
    duplicated: boolean;
    type: CertificateType;
    component: React.ReactNode;
  }>;
  totalFee: Balance.Quantity;
};

export const useOperations = (
  certificates: FormattedTx['certificates'],
  isStakeRegistered: boolean,
  stakeKeyDeposit: any,
  primaryTokenInfo: any
) => {
  const operationCount: any = {};
  if (certificates === null)
    return {
      components: [],
      totalFee: Quantities.zero,
    };
  const certificatesTypes = certificates.map((cert: { type: CertificateType }) => cert.type);
  certificatesTypes.forEach((cert: CertificateType) => updateOperationsCount(cert, operationCount));

  return certificates.reduce(
    (
      acc: { components: any; totalFee: any },
      certificate: { type: string | number; value: { drep: any } },
      index: React.Key | null | undefined
    ) => {
      const fistElementIndex = certificatesTypes.indexOf(certificate.type);
      const isFistElement = fistElementIndex === index;
      const isNotFirstElementDuplicated = operationCount[certificate.type] > 1 && !isFistElement;
      //
      switch (certificate.type) {
        case CertificateType.VoteDelegation: {
          const drep = certificate.value.drep;
          const keyDepositFee = isStakeRegistered ? null : `${asQuantity(stakeKeyDeposit)} ${primaryTokenInfo.name}`;

          if (drep === 'AlwaysAbstain')
            return {
              components: [
                ...acc.components,
                {
                  component: <AbstainOperation key={index} label="Select abstain" fee={keyDepositFee} />,
                  duplicated: isNotFirstElementDuplicated,
                  type: CertificateType.VoteDelegation,
                },
              ],
              totalFee: acc.totalFee,
            };
          if (drep === 'AlwaysNoConfidence')
            return {
              components: [
                ...acc.components,
                {
                  component: <NoConfidenceOperation key={index} label="Select no confidence" fee={keyDepositFee} />,
                  duplicated: isNotFirstElementDuplicated,
                  type: CertificateType.VoteDelegation,
                },
              ],
              totalFee: acc.totalFee,
            };

          const hash = ('KeyHash' in drep ? drep.KeyHash : drep.ScriptHash) ?? '';
          return {
            components: [
              ...acc.components,
              {
                component: <VoteDelegationOperation key={index} hash={hash} label="Delegate voting to" fee={keyDepositFee} />,
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.VoteDelegation,
              },
            ],
            totalFee: acc.totalFee,
          };
        }

        case CertificateType.DRepRegistration: {
          // const fee = asQuantity(wallet.protocolParams.keyDeposit);
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <DrepRegistrationOperation
                    // fee={fee}
                    // key={index}
                    // showWarning={isFirstElementDuplicated}
                    // strike={isNotFirstElementDuplicated}
                    label="DrepRegistrationOperation - in progress"
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.DRepRegistration,
              },
            ],
            // totalFee: Quantities.sum([fee, acc.totalFee]),
          };
        }

        case CertificateType.DRepDeregistration: {
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <DrepDeregistrationOperation
                    key={index}
                    label="DrepDeregistrationOperation - in progress"
                    // showWarning={isFirstElementDuplicated}
                    // strike={isNotFirstElementDuplicated}
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.DRepDeregistration,
              },
            ],
            totalFee: acc.totalFee,
          };
        }

        case CertificateType.DRepUpdate: {
          return {
            components: [
              ...acc.components,
              {
                component: <DrepUpdateOperation key={index} label="In Progress" />,
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.DRepUpdate,
              },
            ],
            totalFee: acc.totalFee,
          };
        }

        default:
          return acc;
      }
    },
    { components: [], totalFee: Quantities.zero }
  );
};

const updateOperationsCount = (operation: CertificateType, operationsCount: OperationsCount) => {
  let count = operationsCount[operation];

  if (count != null) {
    operationsCount[operation] = ++count;
    return operationsCount;
  }

  operationsCount[operation] = 1;
  return operationsCount;
};

export const AbstainOperation = ({ label, fee }: { label: string; fee: string | null }) => {
  return (
    <Stack direction="column" spacing={2}>
      {fee && (
        <Stack direction="row" justifyContent="space-between">
          <Typography color="ds.text_gray_low">Register Staking key deposit</Typography>
          <Typography color="ds.text_gray_medium">{fee}</Typography>
        </Stack>
      )}
      <Stack gap="12px">
        <Typography color="ds.text_gray_low">{label}</Typography>
      </Stack>
    </Stack>
  );
};
export const NoConfidenceOperation = ({ label, fee }: { label: string; fee: string | null }) => {
  return (
    <Stack direction="column" spacing={2}>
      {fee && (
        <Stack direction="row" justifyContent="space-between">
          <Typography color="ds.text_gray_low">Register Staking key deposit</Typography>
          <Typography color="ds.text_gray_medium">{fee}</Typography>
        </Stack>
      )}
      <Stack gap="12px">
        <Typography color="ds.text_gray_low">{label}</Typography>
      </Stack>
    </Stack>
  );
};
export const VoteDelegationOperation = ({ label, hash, fee }: { label: string; hash?: string; fee: string | null }) => {
  // const label = formatDrepHash(hash, type)  TODO format it when package is available in NPM

  return (
    <Stack direction="column" spacing={2}>
      {fee && (
        <Stack direction="row" justifyContent="space-between">
          <Typography color="ds.text_gray_low">Register Staking key deposit</Typography>
          <Typography color="ds.text_gray_medium">{fee}</Typography>
        </Stack>
      )}

      <Stack gap="12px" direction="row" justifyContent="space-between" alignItems="flex-start" minWidth="450px">
        <Typography color="ds.text_gray_low" minWidth="200px" sx={{ wordWrap: 'break-word' }}>
          {label}
        </Typography>
        <Typography color="ds.text_gray_medium" minWidth="230px" sx={{ wordWrap: 'break-word' }} textAlign="right">
          {hash}
        </Typography>
      </Stack>
    </Stack>
  );
};
export const DrepRegistrationOperation = ({ label }: { label: string }) => {
  return (
    <Stack gap="12px">
      <Typography color="ds.text_gray_low">{label}</Typography>
    </Stack>
  );
};
export const DrepDeregistrationOperation = ({ label }: { label: string }) => {
  return (
    <Stack gap="12px">
      <Typography color="ds.text_gray_low">{label}</Typography>
    </Stack>
  );
};
export const DrepUpdateOperation = ({ label }: { label: string }) => {
  return (
    <Stack gap="12px">
      <Typography color="ds.text_gray_low">{label}</Typography>
    </Stack>
  );
};
