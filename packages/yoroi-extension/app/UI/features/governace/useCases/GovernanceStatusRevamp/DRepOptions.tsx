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
import { YOROI_DREP_ID } from '../../common/constants';

interface DRepOptionsScreenProps {}

export const DRepOptions: React.FC<DRepOptionsScreenProps> = () => {
  const navigateTo = useNavigateTo();
  const strings = useStrings();
  const theme: any = useTheme();

  const { submitedTransactions } = useGovernance();
  const { loadingUnsignTx, error, delegateToDrep } = useGovernanceDelegationToYoroiDrep();
  const isPendindDrepDelegationTx = submitedTransactions.length > 0 && submitedTransactions[0]?.isDrepDelegation === true;

  const { governanceStatusState: cardState, governanceStatus } = useGovernanceStatusState();
  const onBack = () => {
    navigateTo.selectRevampStatus();
  };

  const drepOptionsConfig = [
    {
      key: 'yoroi',
      title: strings.yoroiDRep,
      description: strings.yoroiDRepInfo,
      buttonText: strings.delegateLabel,
      variant: 'primary' as const,
      icon: <Icon.YoroiLogo fill={theme.palette.ds.gray_min} />,
      onAction: () => delegateToDrep(YOROI_DREP_ID),
      onViewDetails: () => console.log('View Yoroi details'),
      status: cardState,
    },
    {
      key: 'others',
      title: strings.otherDReps,
      description: strings.designatingSomeoneElse,
      buttonText: strings.delegateLabel,
      variant: 'outlined' as const,
      icon: <Icon.VotingDrep />,
      onAction: () => console.log('Browse DReps'),
      status: cardState,
    },
    {
      key: 'abstain',
      title: strings.abstain,
      description: strings.chooseAbstain,
      buttonText: strings.delegateLabel,
      variant: 'outlined' as const,
      icon: <Icon.VotingAbstain />,
      onAction: () => console.log('Abstain'),
      status: cardState,
    },
    {
      key: 'noConfidence',
      title: strings.noConfidence,
      description: strings.chooseNoConfidence,
      buttonText: strings.delegateLabel,
      variant: 'outlined' as const,
      icon: <Icon.VotingNoConfidence />,
      onAction: () => console.log('No Confidence'),
      status: cardState,
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
        {drepOptionsConfig.map(option => (
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
            drepId={governanceStatus.drep ? governanceStatus.drep : YOROI_DREP_ID}
          />
        ))}
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
  width: '1248px',
  height: '58px',
  flex: 'none',
  order: 0,
  alignSelf: 'stretch',
  flexGrow: 0,
}));

const CardsRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'wrap',
  padding: '0px',
  gap: '24px',
  width: '1248px',
  height: '320px',
  flex: 'none',
  order: 1,
  alignSelf: 'stretch',
  flexGrow: 0,
}));
