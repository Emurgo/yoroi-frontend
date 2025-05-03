import { Stack, Typography } from '@mui/material';
import { Balance } from '@yoroi/types';
import BigNumber from 'bignumber.js';
import React from 'react';
import { asQuantity, Quantities } from '../../../utils/quantities';
import { CertificateType, FormattedTx } from './types';
import { useStrings } from './hooks/useStrings';

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
  primaryTokenInfo: any,
  operations: { kind: 'delegate' },
  drepID: string | null
) => {
  const operationCount: any = {};
  if (certificates === null)
    return {
      components: [],
      totalFee: Quantities.zero,
    };
  const certificatesTypes = certificates.map((cert: { type: CertificateType }) => cert.type);
  certificatesTypes.forEach((cert: CertificateType) => updateOperationsCount(cert, operationCount));

  if (operations?.kind === 'delegate') {
    return {
      components: [],
      totalFee: isStakeRegistered ? 0 : asQuantity(stakeKeyDeposit),
    };
  }

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
      switch (certificate.type || operations?.kind) {
        case CertificateType.VoteDelegation: {
          const drep = certificate.value.drep;
          const keyDepositFee = isStakeRegistered
            ? null
            : `${new BigNumber(stakeKeyDeposit).shiftedBy(-primaryTokenInfo.decimals).toString()} ${primaryTokenInfo.name}`;

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
              totalFee: isStakeRegistered ? 0 : asQuantity(stakeKeyDeposit),
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
              totalFee: isStakeRegistered ? 0 : asQuantity(stakeKeyDeposit),
            };

          return {
            components: [
              ...acc.components,
              {
                component: (
                  <VoteDelegationOperation
                    key={index}
                    hash={drepID ?? undefined}
                    label="Delegate voting to"
                    fee={keyDepositFee}
                  />
                ),
                duplicated: isNotFirstElementDuplicated,
                type: CertificateType.VoteDelegation,
              },
            ],
            totalFee: isStakeRegistered ? 0 : asQuantity(stakeKeyDeposit),
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
  const strings = useStrings();
  return (
    <Stack direction="column" spacing={2}>
      {fee && (
        <Stack direction="row" justifyContent="space-between">
          <Typography color="ds.text_gray_low">{strings.registerStakingKey}</Typography>
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
  const strings = useStrings();
  return (
    <Stack direction="column" spacing={2}>
      {fee && (
        <Stack direction="row" justifyContent="space-between">
          <Typography color="ds.text_gray_low">{strings.registerStakingKey}</Typography>
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
  const strings = useStrings();

  return (
    <Stack direction="column" spacing={2}>
      {fee && (
        <Stack direction="row" justifyContent="space-between">
          <Typography color="ds.text_gray_low">{strings.registerStakingKey}</Typography>
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
