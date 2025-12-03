import { Box, Typography, Stack } from '@mui/material';
import { styled } from '@mui/system';
import { Icon } from '../../../../components';
import { useNavigateTo } from '../../common/useNavigateTo';
import { useStrings } from '../../common/hooks/useStrings';
import { useTheme } from '@mui/material/styles';
import { DrepOptionsCard } from './DrepOptionsCard';
import { useGovernance } from '../../module/GovernanceContextProvider';
import { useGovernanceDelegationToYoroiDrep } from '../../common/hooks/useGovernanceDelegationToYoroiDrep';
import { useGovernanceStatusState } from '../../common/hooks/useGovernanceStatusState';
import {
  DREP_ALWAYS_ABSTAIN,
  DREP_ALWAYS_NO_CONFIDENCE,
  GOVERNANCE_STATUS,
  YOROI_DREP_ID,
  YOROI_DREP_ID_TESTNET,
  YOROI_VOTING_RECORD_LINK,
} from '../../common/constants';
import { OptionsSkeletonScreen } from './SkeletonCardLoaders';

interface DRepOptionsScreenProps {}

export const DRepOptions: React.FC<DRepOptionsScreenProps> = () => {
  const navigateTo = useNavigateTo();
  const strings = useStrings();
  const theme: any = useTheme();

  const { submitedTransactions, isTestnet } = useGovernance();
  const { loadingUnsignTx, delegateToDrep, openDelegateModalForCustomDrep, delegateToAbstain, delegateToNoConfidence } =
    useGovernanceDelegationToYoroiDrep();
  const isPendingDrepDelegationTx = submitedTransactions.length > 0 && submitedTransactions[0]?.isDrepDelegation === true;

  const { governanceStatusState: cardState, governanceStatus } = useGovernanceStatusState();
  const onBack = () => {
    navigateTo.selectRevampStatus();
  };

  const drepYoroiId = isTestnet ? YOROI_DREP_ID_TESTNET : YOROI_DREP_ID;
  const drepID = governanceStatus.drep ? governanceStatus.drep : drepYoroiId;
  const isDelegated = cardState === GOVERNANCE_STATUS.DELEGATED;
  const isDelegatingToYoroiDrep = isDelegated && drepID === drepYoroiId;
  const isDelegationToOtherDrep = isDelegated && drepID !== drepYoroiId;
  const isAbstain = drepID === null || governanceStatus.status === DREP_ALWAYS_ABSTAIN;
  const isNoConfidence = drepID === null || governanceStatus.status === DREP_ALWAYS_NO_CONFIDENCE;

  const drepOptionsConfig = [
    {
      key: 'yoroi',
      title: isTestnet ? strings.yoroiTestnetDRep : strings.yoroiDRep,
      description: strings.yoroiDRepInfo,
      buttonText: strings.delegateLabel,
      variant: 'primary' as const,
      icon: <Icon.YoroiLogo fill={theme.palette.ds.gray_min} />,
      onAction: () => delegateToDrep(drepYoroiId),
      onViewDetails: () => window.open(YOROI_VOTING_RECORD_LINK, '_blank'),
      status: cardState,
      drepId: governanceStatus.drep,
      isDelegated: isDelegatingToYoroiDrep,
    },
    {
      key: 'others',
      title: strings.otherDReps,
      description: strings.designatingSomeoneElse,
      buttonText: isDelegationToOtherDrep ? strings.delegateToOtherDrep : strings.delegateLabel,
      variant: 'outlined' as const,
      icon: <Icon.VotingDrep />,
      onAction: () => openDelegateModalForCustomDrep(),
      status: cardState,
      drepId: governanceStatus.drep,
      isDelegated: isDelegationToOtherDrep,
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
      <Stack direction="row" alignSelf="flex-start" spacing={6} sx={{ cursor: 'pointer' }} onClick={onBack}>
        <Icon.LeftArrow fill={theme.palette.ds.el_gray_medium} />
        <Typography variant="body1" fontWeight={500} textTransform="uppercase">
          {strings.backToDashboard}
        </Typography>
      </Stack>

      <TitleSection>
        <Typography variant="h5">{strings.chooseVotingPower}</Typography>
        <Typography variant="body1" color="ds.text_gray_low">
          {strings.letYoroiDRepVoteForYou}
        </Typography>
      </TitleSection>

      <CardsRow>
        {governanceStatus.status !== null ? (
          drepOptionsConfig.map(option => (
            <DrepOptionsCard
              key={option.key}
              title={option.title}
              description={option.description}
              buttonText={option.buttonText}
              variant={option.variant}
              icon={option.icon}
              onAction={option.onAction}
              onViewDetails={option.onViewDetails}
              status={option.status}
              drepId={option.drepId}
              isDelegated={option.isDelegated}
              pending={isPendingDrepDelegationTx || loadingUnsignTx}
            />
          ))
        ) : (
          <OptionsSkeletonScreen />
        )}
      </CardsRow>
    </Container>
  );
};

const Container = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0px',
  gap: '24px',
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
