import { Alert, Button, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useParams } from 'react-router';
import { dRepToMaybeCredentialHex } from '../../../../../api/ada/lib/cardanoCrypto/utils';
import { NoTransactions } from '../../../../components/ilustrations/NoTransactions';
import { TransactionResult } from '../../../transaction-review/common/types';
import { useTxReviewModal } from '../../../transaction-review/module/ReviewTxProvider';
import { GovernanceVoteingCard } from '../../common/GovernanceVoteingCard';
import { VotingSkeletonCard } from '../../common/VotingSkeletonCard';
import { DREP_ALWAYS_ABSTAIN, DREP_ALWAYS_NO_CONFIDENCE, LEARN_MORE_LINK, YOROI_DREP_ID } from '../../common/constants';
import { DRepIlustration } from '../../common/ilustrations/DRepIlustration';
import { useStrings } from '../../common/useStrings';
import { useGovernance } from '../../module/GovernanceContextProvider';
import { Vote } from '../../module/state';
import { networks } from '../../../../../api/ada/lib/storage/database/prepackaged/networks';
import links from '../../../../../links';
import { NotEnoughMoneyToSendError } from '../../../../../api/common/errors';

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
    networkId,
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
  const params: any = useParams();

  React.useEffect(() => {
    if (params?.delegateToYoroiDrep) {
      handleYoroiDelegate();
    }
  }, [params]);

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
          setUnsignedTx({ type: 'setUnsignedTx', unsignedTx: txSignRequest.signTxRequest });
        } finally {
          stopLoadingTxReview();
        }
      },
      submitTx: password => {
        signGovernanceTx(password);
      },
    });
  };
  const handleYoroiDelegate = async () => {
    const drepID = YOROI_DREP_ID;
    const vote: Vote = { kind: 'delegate', drepID };
    const dRepCredentialHex: string | null = dRepToMaybeCredentialHex(drepID);

    governanceVoteChanged(vote);
    createUnsignTx(dRepCredentialHex);
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
      const txSignRequest: any = await createDrepDelegationTransaction(kind);

      openTxReviewModal({
        modalView: 'transactionReview',
        unsignedTx: txSignRequest.signTxRequest.unsignedTx,
        submitTx: password => {
          signGovernanceTx(password);
        },
      });

      setError(null);
    } catch (e) {
      if (e instanceof NotEnoughMoneyToSendError) {
        setError(strings.notEnoughMoneyToSendError);
      } else {
        setError('Error trying to Vote. Please try again later');
      }
    } finally {
      setLoadingUnsignTx(false);
    }
  };

  const isParticipatingInGovernance = governanceStatus.status != null && governanceStatus.status !== 'none';

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
  const statusDelegatingToYoroi = governanceStatus.status === 'delegate' && governanceStatus.drep === YOROI_DREP_ID;
  const statusDelegating = governanceStatus.status === 'delegate' && governanceStatus.drep !== YOROI_DREP_ID;
  const optionsList = [
    {
      title: strings.delegateToYoroiDRep,
      titleHover: strings.delegateToYoroiDRep,
      description: statusDelegatingToYoroi
        ? `You are designating Yoroi to cast your vote on your behalf for all proposals now and in the future`
        : strings.designatingSomeoneElse,
      descriptionHover: statusDelegatingToYoroi
        ? `You are designating Yoroi to cast your vote on your behalf for all proposals now and in the future`
        : strings.designatingSomeoneElse,
      extraInfo: statusDelegatingToYoroi ? governanceStatus.drep : null,
      icon: <DRepIlustration />,
      selected: statusDelegatingToYoroi,
      onClick: handleYoroiDelegate,
      pending: isPendindDrepDelegationTx || loadingUnsignTx,
      loading: loadingUnsignTx && statusDelegatingToYoroi,
      isVisible: Number(networkId) === 0,
    },
    {
      title: statusDelegating ? strings.delegatingToDRep : strings.delegateToDRep,
      titleHover: statusDelegating ? 'Change DRep' : strings.delegateToDRep,
      description: strings.designatingSomeoneElse,
      descriptionHover: strings.designatingSomeoneElse,

      extraInfo: statusDelegating ? governanceStatus.drep : null,
      selected: statusDelegating,
      onClick: handleDelegate,
      pending: isPendindDrepDelegationTx || loadingUnsignTx,
      loading: loadingUnsignTx && statusDelegating,
      isVisible: true,
    },
  ];

  const bottomList = [
    {
      title: strings.abstain,
      description: strings.abstainInfo,
      selected: governanceStatus.status === DREP_ALWAYS_ABSTAIN,
      onClick: handleAbstain,
      pending: isPendindDrepDelegationTx || loadingUnsignTx,
      loading: loadingUnsignTx && governanceVote.kind === DREP_ALWAYS_ABSTAIN,
      isVisible: true,
    },
    {
      title: strings.noConfidence,
      description: strings.noConfidenceInfo,
      selected: governanceStatus.status === DREP_ALWAYS_NO_CONFIDENCE,
      onClick: handleNoConfidence,
      pending: isPendindDrepDelegationTx || loadingUnsignTx,
      loading: loadingUnsignTx && governanceVote.kind === DREP_ALWAYS_NO_CONFIDENCE,
      isVisible: true,
    },
  ];

  const skeletonsCards = new Array(optionsList.length).fill(null);

  if (!isParticipatingInGovernance && (walletAdaBalance !== null && walletAdaBalance === 0)) {
    const isTestnet = networkId !== networks.CardanoMainnet.NetworkId;

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
          {strings.needAdaForParticipation}
        </Typography>
        <Button
          // @ts-ignore
          variant="primary"
          sx={{ marginTop: '16px' }}
          onClick={() => {
            if (isTestnet) {
              window.open(links.testnetFaucet, '_blank');
            } else {
              // @ts-ignore
              triggerBuySellAdaDialog();
            }
          }}
        >
          {isTestnet ? strings.goToFaucet : 'Buy Ada'}
        </Button>
      </Stack>
    );
  }

  return (
    <Container>
      <Typography variant="h3" fontWeight="500" mb={2} gutterBottom color="ds.text_gray_medium">
        {pageTitle}
      </Typography>
      <Typography variant="body1" mb="24px" gutterBottom color="ds.text_gray_low">
        {isPendindDrepDelegationTx ? strings.statusPending : pageSubtitle}
      </Typography>
      <Stack direction="column" justifyContent="center" gap="16px">
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
                  isVisible={option.isVisible}
                  extraInfo={option.extraInfo}
                />
              );
            })
          : skeletonsCards.map((_, index) => <VotingSkeletonCard key={index} />)}
      </Stack>
      <Stack direction="row" gap="16px" mt="16px">
        {governanceStatus.status !== null
          ? bottomList.map((option, index) => {
              return (
                <GovernanceVoteingCard
                  key={index}
                  title={option.title}
                  description={option.description}
                  selected={option.selected}
                  onClick={option.onClick}
                  pending={option.pending}
                  loading={option.loading}
                  smallCard={true}
                  isVisible={option.isVisible}
                />
              );
            })
          : skeletonsCards.map((_, index) => <VotingSkeletonCard key={index} smallCard />)}
      </Stack>

      <Stack gap="17px" mt="42px">
        {error && <Alert severity="error"> {error}</Alert>}
        {governanceStatus.drep !== null && (
          <Typography variant="body2" align="center" color="ds.text_gray_medium" gutterBottom>
            {strings.drepId} {governanceStatus.drep}
          </Typography>
        )}
        <Link href={LEARN_MORE_LINK} target="_blank" rel="noopener" lineHeight="22px">
          {strings.learnMore}
        </Link>
      </Stack>
    </Container>
  );
};
