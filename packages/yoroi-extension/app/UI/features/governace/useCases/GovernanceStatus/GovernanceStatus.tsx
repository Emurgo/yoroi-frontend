import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Link } from '@mui/material';
import { Icon } from '../../../../components';
import { useGovernanceDelegationToYoroiDrep } from '../../common/hooks/useGovernanceDelegationToYoroiDrep';
import { useIsGovernanceAllowed } from '../../common/hooks/useIsGovernanceAllowed';
import { useGovernance } from '../../module/GovernanceContextProvider';
import { useNavigateTo } from '../../common/useNavigateTo';
import { useStrings } from '../../common/hooks/useStrings';
import { NotAllowedInGovernance } from './NotAllowedInGovernance';
import { StatusSkeletonScreen } from '../../common/SkeletonCardLoaders';
import { DrepOptionsCard } from '../GovernanceOptions/DrepOptionsCard';
import {
  DREP_ALWAYS_ABSTAIN,
  DREP_ALWAYS_NO_CONFIDENCE,
  GOVERNANCE_STATUS,
  GovernanceStatusState,
  LEARN_MORE_LINK,
  YOROI_DREP_ID,
  YOROI_DREP_ID_TESTNET,
} from '../../common/constants';

export const GovernanceStatus = () => {
  const strings = useStrings();
  const navigateTo = useNavigateTo();
  const { loadingUnsignTx, error, openDelegateModalForCustomDrep, delegateToAbstain, delegateToNoConfidence } =
    useGovernanceDelegationToYoroiDrep();
  const { governanceStatus, submitedTransactions, isTestnet } = useGovernance();
  const { isNotAllowed, isParticipating } = useIsGovernanceAllowed();

  const yoroiDrepId = isTestnet ? YOROI_DREP_ID_TESTNET : YOROI_DREP_ID;
  const isPendingDrepDelegationTx = submitedTransactions.length > 0 && submitedTransactions[0]?.isDrepDelegation === true;

  const cardState: GovernanceStatusState = React.useMemo(() => {
    if (governanceStatus.status === 'none' && governanceStatus.drep === null) return GOVERNANCE_STATUS.IDLE;
    if (governanceStatus.status === 'delegate' && governanceStatus.drep !== null) return GOVERNANCE_STATUS.DELEGATED;
    if (
      (governanceStatus.status === DREP_ALWAYS_ABSTAIN || governanceStatus.status === DREP_ALWAYS_NO_CONFIDENCE) &&
      governanceStatus.drep === null
    )
      return GOVERNANCE_STATUS.DELEGATED;
    if (isPendingDrepDelegationTx) return GOVERNANCE_STATUS.DISABLED;
    return GOVERNANCE_STATUS.IDLE;
  }, [governanceStatus.status, governanceStatus.drep, isPendingDrepDelegationTx]);

  const isDelegated = cardState === GOVERNANCE_STATUS.DELEGATED;
  const drepID = governanceStatus.drep ?? yoroiDrepId;
  const isAbstain = isDelegated && governanceStatus.drep === null && governanceStatus.status === DREP_ALWAYS_ABSTAIN;
  const isNoConfidence = isDelegated && governanceStatus.drep === null && governanceStatus.status === DREP_ALWAYS_NO_CONFIDENCE;
  const isDelegatedToDrep = isDelegated && !(isAbstain || isNoConfidence);

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
      onAction: () => navigateTo.selectDrepList(),
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
