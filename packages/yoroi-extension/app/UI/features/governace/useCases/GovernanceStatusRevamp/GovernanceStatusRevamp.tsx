import { styled } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';
import { GovernanceStatusRevampCard } from './GovernanceStatusRevampCard';
import { useNavigateTo } from '../../common/useNavigateTo';
import { useStrings } from '../../common/useStrings';
import { GOVERNANCE_STATUS, GovernanceStatusState } from '../../common/constants';
import { useGovernance } from '../../module/GovernanceContextProvider';

const Container = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0px',
  gap: '24px',
  width: '612px',
  margin: '0 auto',
  marginTop: '24px',
}));

const TitleSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0px',
  gap: '8px',
  width: '612px',
}));

const CardsContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '0px',
  gap: '16px',
  width: '612px',
}));

const OtherActionsCard = styled(Button)(({ theme }: any) => ({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '16px',
  gap: '4px',
  width: '612px',
  border: `1px solid ${theme.palette.ds.gray_200}`,
  borderRadius: '8px',
  cursor: 'pointer',
  textTransform: 'none',
  '&:hover': {
    background: theme.palette.background.paper,
    borderColor: theme.palette.ds.primary_500,
  },
}));

const TextContent = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '0px',
  gap: '4px',
  width: '580px',
}));

export const GovernanceStatusRevamp = () => {
  const navigateTo = useNavigateTo();
  const strings = useStrings();

  const {
    governanceStatus,
    governanceManager,
    governanceVoteChanged,
    createDrepDelegationTransaction,
    walletAdaBalance,
    triggerBuySellAdaDialog,
    submitedTransactions,
    governanceVote,
    signDelegationTransaction,
    selectedWallet,
    networkId,
  } = useGovernance();

  console.log('governanceStatus', governanceStatus);
  // For now we keep it "idle"
  const getGovernanceStatusState = () => {
    if (governanceStatus.status === 'none' && governanceStatus.drep === null) {
      return GOVERNANCE_STATUS.IDLE;
    }
    if (governanceStatus.status === 'delegate' && governanceStatus.drep !== null) {
      return GOVERNANCE_STATUS.DELEGATED;
    }
    return GOVERNANCE_STATUS.IDLE; // add loading here later
  };
  const cardState: GovernanceStatusState = getGovernanceStatusState();

  console.log('@@@cardState', cardState);
  const onExploreMore = () => {
    navigateTo.selectRevampOptions();
  };

  return (
    <Container>
      <TitleSection>
        <Typography variant="h5" color="ds.text_gray_medium">
          {strings.delegationOptions}
        </Typography>
        <Typography variant="body1" color="ds.text_gray_low">
          {strings.chooseDelegationOption}
        </Typography>
      </TitleSection>

      <CardsContainer>
        <GovernanceStatusRevampCard
          state={cardState}
          drepId="drep1qwertyuiopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnmqwerty"
          votingPowerValue="—"
          delegatedAmountValue="—"
          onDelegateClick={() => {
            // later: route to delegation flow
            // console.log('Delegate clicked')
          }}
          onDetailsClick={() => {
            // later: open governance docs / modal
            // console.log('View governance details')
          }}
        />

        <OtherActionsCard onClick={onExploreMore}>
          <TextContent>
            <Typography variant="body1" fontWeight={500} color="ds.gray_max">
              {strings.exploreOtherDRepsOrAbstain}
            </Typography>
            <Typography variant="body2" color="ds.text_gray_medium">
              {strings.browseAdditionalDelegation}
            </Typography>
          </TextContent>
        </OtherActionsCard>
      </CardsContainer>
    </Container>
  );
};
