import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Link } from '@mui/material';
import { Icon } from '../../../../components';
import { useGovernanceDelegationToYoroiDrep } from '../../common/hooks/useGovernanceDelegationToYoroiDrep';
import { useGovernanceStatusState } from '../../common/hooks/useGovernanceStatusState';
import { useGovernanceDelegationStatus } from '../../common/hooks/useGovernanceDelegationStatus';
import { useIsGovernanceAllowed } from '../../common/hooks/useIsGovernanceAllowed';
import { useGovernance } from '../../module/GovernanceContextProvider';
import { useStrings } from '../../common/hooks/useStrings';
import { NotAllowedInGovernance } from './NotAllowedInGovernance';
import { StatusSkeletonScreen } from '../../common/SkeletonCardLoaders';
import { DrepOptionsCard } from '../GovernanceOptions/DrepOptionsCard';
import { GOVERNANCE_STATUS, LEARN_MORE_LINK } from '../../common/constants';

export const GovernanceStatus = () => {
  const strings = useStrings();
  const { loadingUnsignTx, error, delegateToDrep, openDelegateModalForCustomDrep, delegateToAbstain, delegateToNoConfidence } =
    useGovernanceDelegationToYoroiDrep();
  const { governanceStatusState: cardState, governanceStatus } = useGovernanceStatusState();
  const { submitedTransactions } = useGovernance();
  const { isNotAllowed, isParticipating } = useIsGovernanceAllowed();
  const isPendingDrepDelegationTx = submitedTransactions.length > 0 && submitedTransactions[0]?.isDrepDelegation === true;
  const isDelegated = cardState === GOVERNANCE_STATUS.DELEGATED;

  const { isAbstain, isNoConfidence, isDelegationToYoroiDrep, isDelegationToOtherDrep } = useGovernanceDelegationStatus({
    governanceStatus,
    isDelegated,
  });
  const isDelegatedToDrep = isDelegationToYoroiDrep || isDelegationToOtherDrep;

  if (isNotAllowed) return <NotAllowedInGovernance />;
  if (governanceStatus.status === null) return <StatusSkeletonScreen />;

  const cardConfigs = [
    {
      key: 'dreps',
      title: strings.dreps,
      description: strings.designatedSomeoneElse,
      buttonText: isDelegatedToDrep ? strings.delegateToOtherDrep : strings.delegateLabel,
      variant: 'outlined' as const,
      icon: <Icon.VotingDrep />,
      onAction: () => openDelegateModalForCustomDrep(),
      status: cardState,
      drepId: isDelegatedToDrep ? governanceStatus.drep : null,
      isDelegated: isDelegatedToDrep,
    },
    {
      key: 'abstain',
      title: strings.abstain,
      description: strings.chooseAbstain,
      buttonText: isAbstain ? strings.changeToDrep : strings.delegateLabel,
      variant: 'outlined' as const,
      icon: <Icon.VotingAbstain />,
      onAction: () => (isAbstain ? openDelegateModalForCustomDrep() : delegateToAbstain()),
      status: cardState,
      drepId: null,
      isDelegated: isAbstain,
    },
    {
      key: 'noConfidence',
      title: strings.noConfidence,
      description: strings.chooseNoConfidence,
      buttonText: isNoConfidence ? strings.changeToDrep : strings.delegateLabel,
      variant: 'outlined' as const,
      icon: <Icon.VotingNoConfidence />,
      onAction: () => (isNoConfidence ? openDelegateModalForCustomDrep() : delegateToNoConfidence()),
      status: cardState,
      drepId: null,
      isDelegated: isNoConfidence,
    },
  ];

  return (
    <Container>
      <TitleSection>
        <Typography variant="h5" color="ds.text_gray_medium" textAlign="center" id="governance-title-text">
          {strings.chooseVotingPower}
        </Typography>
        <Typography variant="body1" color="ds.text_gray_low" textAlign="center" id="governance-description-text">
          {isParticipating ? strings.governanceDelegationSubtitle : strings.governanceNotRegisteredSubtitle}
        </Typography>
      </TitleSection>

      {error != null && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}

      <CardsRow>
        {cardConfigs.map(option => (
          <DrepOptionsCard
            key={option.key}
            title={option.title}
            description={option.description}
            buttonText={option.buttonText}
            variant={option.variant}
            icon={option.icon}
            onAction={option.onAction}
            status={option.status}
            drepId={option.drepId}
            isDelegated={option.isDelegated}
            pending={isPendingDrepDelegationTx || loadingUnsignTx}
          />
        ))}
      </CardsRow>

      <Link href={LEARN_MORE_LINK} rel="noopener" target="_blank" underline="hover" sx={{ cursor: 'pointer' }}>
        <Typography variant="body1">{strings.learnMore}</Typography>
      </Link>
    </Container>
  );
};

const Container = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0px',
  gap: '24px',
  marginTop: '24px',
}));

const TitleSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0px',
  gap: '8px',
}));

const CardsRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  padding: '0px',
  gap: '24px',
}));
