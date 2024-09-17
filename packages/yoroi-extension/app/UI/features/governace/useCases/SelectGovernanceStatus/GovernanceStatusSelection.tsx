import { Alert, Button, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { GovernanceProvider } from '@yoroi/staking';
import * as React from 'react';
import { NoTransactions } from '../../../../components/ilustrations/NoTransactions';
import { useModal } from '../../../../components/modals/ModalContext';
import { ChooseDRepModal } from '../../common/ChooseDRepModal';
import { GovernanceVoteingCard } from '../../common/GovernanceVoteingCard';
import { VotingSkeletonCard } from '../../common/VotingSkeletonCard';
import { BECOME_DREP_LINK, DREP_ALWAYS_ABSTAIN, DREP_ALWAYS_NO_CONFIDENCE, LEARN_MORE_LINK } from '../../common/constants';
import { Abstein } from '../../common/ilustrations/Abstein';
import { DRepIlustration } from '../../common/ilustrations/DRepIlustration';
import { NoConfidance } from '../../common/ilustrations/NoConfidance';
import { useNavigateTo } from '../../common/useNavigateTo';
import { useStrings } from '../../common/useStrings';
import { useGovernance } from '../../module/GovernanceContextProvider';
import { Vote } from '../../module/state';

const Container = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  paddingTop: '24px',
}));

export const mapStatus = {
  delegate: 'Delegate to a Drep',
  [DREP_ALWAYS_ABSTAIN]: 'Abstain',
  [DREP_ALWAYS_NO_CONFIDENCE]: 'No Confidence',
};

export const GovernanceStatusSelection = () => {
  const {
    governanceStatus,
    governanceManager,
    governanceVoteChanged,
    createDrepDelegationTransaction,
    walletAdaBalance,
    triggerBuySellAdaDialog,
    submitedTransactions,
    governanceVote,
  } = useGovernance();
  const [error, setError] = React.useState<string | null>(null);
  const [loadingUnsignTx, setLoadingUnsignTx] = React.useState<boolean>(false);
  const navigateTo = useNavigateTo();
  const strings = useStrings();
  const { openModal, closeModal, startLoading } = useModal();
  const pageTitle = governanceStatus.status !== 'none' ? strings.governanceStatus : strings.registerGovernance;
  const statusRawText = mapStatus[governanceStatus.status || ''];
  const pageSubtitle = governanceStatus.status === 'none' ? strings.reviewSelection : strings.statusSelected(statusRawText);
  const isPendindDrepDelegationTx = submitedTransactions.length > 0 && submitedTransactions[0]?.isDrepDelegation === true;

  const openDRepIdModal = (onSubmit: (drepID: string, drepCredential: string) => void) => {
    if (!governanceManager) {
      return;
    }
    openModal({
      title: String(strings.chooseDrep).toUpperCase(),
      content: (
        <GovernanceProvider manager={governanceManager}>
          <ChooseDRepModal onSubmit={onSubmit} />
        </GovernanceProvider>
      ),
      width: '648px',
      height: '336px',
      isLoading: loadingUnsignTx,
    });
  };

  const handleDelegate = async () => {
    openDRepIdModal((drepID, drepCredential) => {
      const vote: Vote = { kind: 'delegate', drepID };
      governanceVoteChanged(vote);
      createUnsignTx(drepCredential);
    });
  };

  const handleAbstain = async () => {
    const vote: Vote = { kind: DREP_ALWAYS_ABSTAIN };
    governanceVoteChanged(vote);
    await createUnsignTx(DREP_ALWAYS_ABSTAIN);
  };

  const handleNoConfidence = async () => {
    const vote: Vote = { kind: DREP_ALWAYS_NO_CONFIDENCE };
    governanceVoteChanged(vote);
    await createUnsignTx(DREP_ALWAYS_NO_CONFIDENCE);
  };

  const createUnsignTx = async kind => {
    try {
      setLoadingUnsignTx(true);
      startLoading();
      setTimeout(async () => {
        await createDrepDelegationTransaction(kind);
        navigateTo.delegationForm();
        setLoadingUnsignTx(false);
        setError(null);
      }, 200);
    } catch (e) {
      setError('Error trying to Vote. Please try again later');
      closeModal();
      setLoadingUnsignTx(false);
    }
  };
  const optionsList = [
    {
      title: governanceStatus.status === 'delegate' ? strings.delegatingToDRep : strings.delegateToDRep,
      titleHover: governanceStatus.status === 'delegate' ? 'Change DRep' : strings.delegateToDRep,
      description: strings.designatingSomeoneElse,
      descriptionHover:
        governanceStatus.status === 'delegate'
          ? `Current DRep selection: ${governanceStatus.drep}`
          : strings.designatingSomeoneElse,
      icon: <DRepIlustration />,
      selected: governanceStatus.status === 'delegate' ? true : false,
      onClick: handleDelegate,
      pending: isPendindDrepDelegationTx || loadingUnsignTx,
      loading: loadingUnsignTx && governanceVote.kind === 'delegate',
    },
    {
      title: strings.abstain,
      description: strings.abstainInfo,
      icon: <Abstein />,
      selected: governanceStatus.status === DREP_ALWAYS_ABSTAIN ? true : false,
      onClick: handleAbstain,
      pending: isPendindDrepDelegationTx || loadingUnsignTx,
      loading: loadingUnsignTx && governanceVote.kind === DREP_ALWAYS_ABSTAIN,
    },
    {
      title: strings.noConfidence,
      description: strings.noConfidenceInfo,
      icon: <NoConfidance />,
      selected: governanceStatus.status === DREP_ALWAYS_NO_CONFIDENCE ? true : false,
      onClick: handleNoConfidence,
      pending: isPendindDrepDelegationTx || loadingUnsignTx,
      loading: loadingUnsignTx && governanceVote.kind === DREP_ALWAYS_NO_CONFIDENCE,
    },
  ];

  const skeletonsCards = new Array(optionsList.length).fill(null);

  if (walletAdaBalance !== null && walletAdaBalance === 0) {
    return (
      <Stack mt="185px" alignItems="center">
        <NoTransactions />
        <Typography variant="h3" fontWeight="500" mt="84px">
          To participate in governance you need to have ADA in your wallet.
        </Typography>
        {/* @ts-ignore */}
        <Button variant="primary" sx={{ marginTop: '16px' }} onClick={() => triggerBuySellAdaDialog()}>
          Buy Ada
        </Button>
      </Stack>
    );
  }

  return (
    <Container>
      <Typography variant="h3" fontWeight="500" mb={2} gutterBottom>
        {pageTitle}
      </Typography>
      <Typography variant="body1" mb="64px" gutterBottom>
        {isPendindDrepDelegationTx ? strings.statusPending : pageSubtitle}
      </Typography>
      <Box display="flex" justifyContent="center" gap="24px">
        {governanceStatus.status !== null
          ? optionsList.map((option, index) => {
              return (
                <GovernanceVoteingCard
                  key={index}
                  title={option.title}
                  titleHover={option?.titleHover}
                  description={option.description}
                  descriptionHover={option?.descriptionHover}
                  icon={option.icon}
                  selected={option.selected}
                  onClick={option.onClick}
                  pending={option.pending}
                  loading={option.loading}
                />
              );
            })
          : skeletonsCards.map((_, index) => <VotingSkeletonCard key={index} />)}
      </Box>

      <Stack gap="17px" mt="42px">
        {error && <Alert severity="error"> {error}</Alert>}
        {governanceStatus.drep !== null && (
          <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
            {strings.drepId} {governanceStatus.drep}
          </Typography>
        )}
        {governanceStatus.status === 'none' && (
          <Link href={BECOME_DREP_LINK} target="_blank" rel="noopener" variant="body1" lineHeight="22px">
            {strings.becomeADrep}
          </Link>
        )}
        <Link href={LEARN_MORE_LINK} target="_blank" rel="noopener" variant="body1" lineHeight="22px">
          {strings.learnMore}
        </Link>
      </Stack>
    </Container>
  );
};
