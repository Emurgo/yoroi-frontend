import { Stack, Typography } from '@mui/material';
import { Balance } from '@yoroi/types';
import React from 'react';
import { Quantities } from '../../../utils/quantities';
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

export const useOperations = (certificates: FormattedTx['certificates']) => {
  const operationCount = {} as OperationsCount;

  if (certificates === null)
    return {
      components: [] as Operations['components'],
      totalFee: Quantities.zero,
    };

  const certificatesTypes = certificates.map(cert => cert.type);
  certificatesTypes.forEach(cert => updateOperationsCount(cert, operationCount));

  return certificates.reduce<Operations>(
    (acc, certificate, index) => {
      const fistElementIndex = certificatesTypes.indexOf(certificate.type);
      const isFistElement = fistElementIndex === index;
      const isNotFirstElementDuplicated = operationCount[certificate.type] > 1 && !isFistElement;
      const isFirstElementDuplicated = operationCount[certificate.type] > 1 && isFistElement;

      switch (certificate.type) {
        case CertificateType.VoteDelegation: {
          const drep = certificate.value.drep;

          if (drep === 'AlwaysAbstain')
            return {
              components: [
                ...acc.components,
                {
                  component: <AbstainOperation key={index} label="Select Always Abstain" />,
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
                  component: <NoConfidenceOperation label="Select no confidance" />,
                  duplicated: isNotFirstElementDuplicated,
                  type: CertificateType.VoteDelegation,
                },
              ],
              totalFee: acc.totalFee,
            };

          const hash = ('KeyHash' in drep ? drep.KeyHash : drep.ScriptHash) ?? '';
          const type = 'KeyHash' in drep ? 'key' : 'script';
          return {
            components: [
              ...acc.components,
              {
                component: (
                  <VoteDelegationOperation
                    key={index}
                    hash={hash}
                    // type={type}
                    // showWarning={isFirstElementDuplicated}
                    // strike={isNotFirstElementDuplicated}
                    label="Delegate voting to"
                  />
                ),
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
                component: (
                  <DrepUpdateOperation key={index} showWarning={isFirstElementDuplicated} strike={isNotFirstElementDuplicated} />
                ),
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

export const AbstainOperation = ({ label }: { label: string }) => {
  return (
    <Stack gap="12px">
      <Typography color="ds.text_gray_low">{label}</Typography>
    </Stack>
  );
};
export const NoConfidenceOperation = ({ label }: { label: string }) => {
  return (
    <Stack gap="12px">
      <Typography color="ds.text_gray_low">{label}</Typography>
    </Stack>
  );
};
export const VoteDelegationOperation = ({ label, hash }: { label: string; hash?: string }) => {
  // const label = formatDrepHash(hash, type)  TODO format it when package is available in NPM

  return (
    <Stack gap="12px" direction="row" justifyContent="space-between" alignItems="flex-start" minWidth="450px">
      <Typography color="ds.text_gray_low" minWidth="200px" sx={{ wordWrap: 'break-word' }}>
        {label}
      </Typography>
      <Typography color="ds.text_gray_medium" minWidth="230px" sx={{ wordWrap: 'break-word' }} textAlign="right">
        {hash}
      </Typography>
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
