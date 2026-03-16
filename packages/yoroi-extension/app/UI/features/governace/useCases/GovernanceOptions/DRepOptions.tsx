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
import { useGovernanceDelegationStatus } from '../../common/hooks/useGovernanceDelegationStatus';
import { GOVERNANCE_STATUS } from '../../common/constants';
import { OptionsSkeletonScreen } from '../../common/SkeletonCardLoaders';

interface DRepOptionsScreenProps {}

export const DRepOptions: React.FC<DRepOptionsScreenProps> = () => {
  const navigateTo = useNavigateTo();
  const strings = useStrings();
  const theme: any = useTheme();

  const { submitedTransactions } = useGovernance();
  const { loadingUnsignTx, openDelegateModalForCustomDrep, delegateToAbstain, delegateToNoConfidence } =
    useGovernanceDelegationToYoroiDrep();
  const isPendingDrepDelegationTx = submitedTransactions.length > 0 && submitedTransactions[0]?.isDrepDelegation === true;

  const { governanceStatusState: cardState, governanceStatus } = useGovernanceStatusState();
  const isDelegated = cardState === GOVERNANCE_STATUS.DELEGATED;
  const { isAbstain, isNoConfidence, isDelegationToDrep } = useGovernanceDelegationStatus({
    governanceStatus,
    isDelegated,
  });

  const onBack = () => {
    navigateTo.selectRevampStatus();
  };

  const drepOptionsConfig = [
    {
      key: 'others',
      title: strings.delegateToDRep,
      description: strings.identifyDrep,
      buttonText: isDelegationToDrep ? strings.changeToDrep : strings.delegateLabel,
      icon: <Icon.VotingDrep />,
      onAction: () => openDelegateModalForCustomDrep(),
      status: cardState,
      drepId: governanceStatus.drep,
      isDelegated: isDelegationToDrep,
    },
    {
      key: 'abstain',
      title: strings.abstain,
      description: strings.chooseAbstain,
      buttonText: isAbstain ? strings.changeToDrep : strings.delegateLabel,
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
          {strings.chooseDelegationOption}
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
              icon={option.icon}
              onAction={option.onAction}
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
