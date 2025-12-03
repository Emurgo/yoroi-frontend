import { styled } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';
import { GovernanceStatusCard } from './GovernanceStatusCard';
import { useNavigateTo } from '../../common/useNavigateTo';
import { useStrings } from '../../common/hooks/useStrings';
import { GOVERNANCE_STATUS, YOROI_DREP_ID, YOROI_DREP_ID_TESTNET } from '../../common/constants';
import { useGovernanceDelegationToYoroiDrep } from '../../common/hooks/useGovernanceDelegationToYoroiDrep';
import { useGovernanceStatusState } from '../../common/hooks/useGovernanceStatusState';
import { useIsGovernanceAllowed } from '../../common/hooks/useIsGovernanceAllowed';
import { NotAllowedInGovernance } from './NotAllowedInGovernance';
import { useGovernance } from '../../module/GovernanceContextProvider';
import { StatusSkeletonScreen } from '../../common/SkeletonCardLoaders';

export const GovernanceStatus = () => {
  const navigateTo = useNavigateTo();
  const strings = useStrings();
  const { loadingUnsignTx, error, delegateToDrep, openDelegateModalForCustomDrep } = useGovernanceDelegationToYoroiDrep();
  const { governanceStatusState: cardState, governanceStatus } = useGovernanceStatusState();
  const { submitedTransactions, isTestnet } = useGovernance();
  const { isNotAllowed, isParticipating } = useIsGovernanceAllowed();
  const isPendingDrepDelegationTx = submitedTransactions.length > 0 && submitedTransactions[0]?.isDrepDelegation === true;
  const yoroiDrepId = isTestnet ? YOROI_DREP_ID_TESTNET : YOROI_DREP_ID;

  const onExploreMore = () => {
    navigateTo.selectRevampOptions();
  };

  if (isNotAllowed) {
    return <NotAllowedInGovernance />;
  }

  if (governanceStatus.status === null) {
    return <StatusSkeletonScreen />;
  }

  return (
    <Container>
      <TitleSection>
        <Typography variant="h5" color="ds.text_gray_medium">
          {isParticipating ? strings.delegatingInGovernance : strings.delegationOptions}
        </Typography>
        <Typography variant="body1" color="ds.text_gray_low" textAlign={'center'}>
          {cardState === GOVERNANCE_STATUS.IDLE ? strings.chooseDelegationOption : strings.votingPowerInfo}
        </Typography>
      </TitleSection>

      {error != null && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}

      <CardsContainer>
        <GovernanceStatusCard
          state={cardState}
          governanceStatus={governanceStatus}
          onDelegateClick={() => delegateToDrep(yoroiDrepId)}
          btnLoading={loadingUnsignTx}
          openDelegateModalForCustomDrep={openDelegateModalForCustomDrep}
          pending={isPendingDrepDelegationTx}
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
