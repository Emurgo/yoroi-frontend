import { Alert, Button, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { NoTransactions } from '../../../../components/ilustrations/NoTransactions';
import { TransactionResult } from '../../../transaction-review/common/types';
import { useTxReviewModal } from '../../../transaction-review/module/ReviewTxProvider';
import { GovernanceVoteingCard } from '../../common/GovernanceVoteingCard';
import { VotingSkeletonCard } from '../../common/VotingSkeletonCard';
import { BECOME_DREP_LINK, DREP_ALWAYS_ABSTAIN, DREP_ALWAYS_NO_CONFIDENCE, LEARN_MORE_LINK } from '../../common/constants';
import { Abstein } from '../../common/ilustrations/Abstein';
import { DRepIlustration } from '../../common/ilustrations/DRepIlustration';
import { NoConfidance } from '../../common/ilustrations/NoConfidance';
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
    signDelegationTransaction,
    selectedWallet,
  } = useGovernance();

  const {
    openTxReviewModal,
    startLoadingTxReview,
    stopLoadingTxReview,
    changePasswordInputValue,
    drepCredentialHex,
    setUnsignedTx,
    showTxResultModal,
  } = useTxReviewModal();

  const [error, setError] = React.useState<string | null>(null);
  const [loadingUnsignTx, setLoadingUnsignTx] = React.useState<boolean>(false);
  const strings = useStrings();
  const pageTitle = governanceStatus.status !== 'none' ? strings.governanceStatus : strings.registerGovernance;
  const statusRawText = mapStatus[governanceStatus.status || ''];
  const pageSubtitle = governanceStatus.status === 'none' ? strings.reviewSelection : strings.statusSelected(statusRawText);
  const isPendindDrepDelegationTx = submitedTransactions.length > 0 && submitedTransactions[0]?.isDrepDelegation === true;

  const handleDelegate = async () => {
    if (!governanceManager) {
      return;
    }

    const vote: Vote = { kind: 'delegate', drepID: drepCredentialHex };
    governanceVoteChanged(vote);
    openTxReviewModal({
      title: 'CHOOSE YOUR DREP',
      modalView: 'chooseDrepId',
      createUnsignedTx: async value => {
        try {
          startLoadingTxReview();
          const txSignRequest: any = await createDrepDelegationTransaction(value);
          const txBodyjson = await txSignRequest.signTxRequest.unsignedTx.build_tx().to_json();
          const parsedUnsignedTx = JSON.parse(txBodyjson);
          setUnsignedTx({ type: 'setUnsignedTx', unsignedTx: parsedUnsignedTx });
        } finally {
          stopLoadingTxReview();
        }
      },
      submitTx: password => {
        signGovernanceTx(password);
      },
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

      setTimeout(async () => {
        const txSignRequest: any = await createDrepDelegationTransaction(kind);

        const txBodyjson = await txSignRequest.signTxRequest.unsignedTx.build_tx().to_json();
        const parsedUnsignedTx = JSON.parse(txBodyjson);

        openTxReviewModal({
          modalView: 'transactionReview',
          unsignedTx: parsedUnsignedTx,
          submitTx: password => {
            signGovernanceTx(password);
          },
        });
        setLoadingUnsignTx(false);
        setError(null);
      }, 200);
    } catch (e) {
      setError('Error trying to Vote. Please try again later');
      setLoadingUnsignTx(false);
    }
  };

  const signGovernanceTx = async password => {
    try {
      startLoadingTxReview();
      await signDelegationTransaction({
        password,
        wallet: selectedWallet,
        dialog: null,
      });
      stopLoadingTxReview();
      changePasswordInputValue({ type: 'changeInputValue', passswordInput: '' });
      showTxResultModal(TransactionResult.SUCCESS);
    } catch (error) {
      console.warn('[createDrepDelegationTransaction,signDelegationTransaction]', error);
      stopLoadingTxReview();
      showTxResultModal(TransactionResult.FAIL);
    }
  };

  // noinspection JSIncompatibleTypesComparison
  const statusDelegating = governanceStatus.status === 'delegate';
  const optionsList = [
    {
      title: statusDelegating ? strings.delegatingToDRep : strings.delegateToDRep,
      titleHover: statusDelegating ? 'Change DRep' : strings.delegateToDRep,
      description: strings.designatingSomeoneElse,
      descriptionHover: statusDelegating ? `Current DRep selection: ${governanceStatus.drep}` : strings.designatingSomeoneElse,
      icon: <DRepIlustration />,
      selected: statusDelegating,
      onClick: handleDelegate,
      pending: isPendindDrepDelegationTx || loadingUnsignTx,
      loading: loadingUnsignTx && governanceVote.kind === 'delegate',
    },
    {
      title: strings.abstain,
      description: strings.abstainInfo,
      icon: <Abstein />,
      selected: governanceStatus.status === DREP_ALWAYS_ABSTAIN,
      onClick: handleAbstain,
      pending: isPendindDrepDelegationTx || loadingUnsignTx,
      loading: loadingUnsignTx && governanceVote.kind === DREP_ALWAYS_ABSTAIN,
    },
    {
      title: strings.noConfidence,
      description: strings.noConfidenceInfo,
      icon: <NoConfidance />,
      selected: governanceStatus.status === DREP_ALWAYS_NO_CONFIDENCE,
      onClick: handleNoConfidence,
      pending: isPendindDrepDelegationTx || loadingUnsignTx,
      loading: loadingUnsignTx && governanceVote.kind === DREP_ALWAYS_NO_CONFIDENCE,
    },
  ];

  const skeletonsCards = new Array(optionsList.length).fill(null);

  if (walletAdaBalance !== null && walletAdaBalance === 0) {
    return (
      <Stack alignItems="center" margin="0 auto" mt="185px" maxWidth="500px">
        <NoTransactions />
        <Typography
          variant="h3"
          fontSize="20px"
          lineHeight="30px"
          fontWeight="500"
          mt="32px"
          textAlign="center"
          color="ds.text_gray_medium"
        >
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
      <Typography variant="h3" fontWeight="500" mb={2} gutterBottom color="ds.text_gray_medium">
        {pageTitle}
      </Typography>
      <Typography variant="body1" mb="64px" gutterBottom color="ds.text_gray_low">
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
          <Typography variant="body2" align="center" color="ds.text_gray_medium" gutterBottom>
            {strings.drepId} {governanceStatus.drep}
          </Typography>
        )}
        {governanceStatus.status === 'none' && (
          <Link href={BECOME_DREP_LINK} target="_blank" rel="noopener" lineHeight="22px">
            {strings.becomeADrep}
          </Link>
        )}
        <Link href={LEARN_MORE_LINK} target="_blank" rel="noopener" lineHeight="22px">
          {strings.learnMore}
        </Link>
      </Stack>
    </Container>
  );
};
