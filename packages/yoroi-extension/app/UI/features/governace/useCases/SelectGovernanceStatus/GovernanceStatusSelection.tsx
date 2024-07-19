import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { GovernanceProvider, useDelegationCertificate, useVotingCertificate } from '@yoroi/staking';

import * as React from 'react';
import { useModal } from '../../../../components/modals/ModalContext';
import { useDrepDelegationState } from '../../api/useDrepDelegationState';
import { ChooseDRepModal } from '../../common/ChooseDRepModal';
import { GovernanceVoteingCard } from '../../common/GovernanceVoteingCard';
import { VotingSkeletonCard } from '../../common/VotingSkeletonCard';
import { BECOME_DREP_LINK, LEARN_MORE_LINK } from '../../common/constants';
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

const mapStatus = {
  drep: 'Delegate to a Drep',
  abstain: 'Abstaining',
  'no-confidence': 'No confidence',
};

export const GovernanceStatusSelection = () => {
  const [pendingVote] = React.useState<boolean>(false);
  const [pendingPage] = React.useState<boolean>(false);
  const navigateTo = useNavigateTo();

  const { openModal } = useModal();
  const { governanceVote, governanceManager, governanceVoteChanged, walletId } = useGovernance();
  const { data: governanceData } = useDrepDelegationState(walletId);

  const strings = useStrings();

  // TODO not woking - the sancho testnet is down and other networks throw error
  // const { data: stakingStatus } = useStakingKeyState('e09fe806015ff6b7c62331ba9d7a68160f9c9c41b7a0765966250c2ea8', {
  //   suspense: true,
  // });
  // console.log('stakingStatus', stakingStatus);
  // const action = stakingStatus ? mapStakingKeyStateToGovernanceAction(stakingStatus) : null

  // @ts-ignore
  const { createCertificate, isLoading: isCreatingDelegationCertificate } = useDelegationCertificate({
    useErrorBoundary: true,
  });

  // @ts-ignore
  const { createCertificate: createVotingCertificate, isLoading: isCreatingVotingCertificate } = useVotingCertificate({
    useErrorBoundary: true,
  });

  const pageTitle = governanceData?.kind === 'none' ? strings.registerGovernance : strings.governanceStatus;
  const statusRawText = mapStatus[governanceVote?.kind];
  const pageSubtitle = governanceData?.kind === 'none' ? strings.reviewSelection : strings.statusSelected(statusRawText);

  const openDRepIdModal = (onSubmit: (drepID: string) => void) => {
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
    });
  };

  const handleDelegate = () => {
    openDRepIdModal(drepID => {
      const vote: Vote = { kind: 'delegate', drepID };
      governanceVoteChanged(vote);
      navigateTo.delegationForm();
      // createCertificate(
      //   { drepID, stakePoolKeyHash },
      //   {
      //     onSuccess: async certificate => {
      //       // const unsignedTx = await createGovernanceTxMutation TODO - should be implemented
      //       const vote = { kind: 'delegate', drepID };
      //       setPendingVote(vote.kind);
      //       dRepIdChanged(drepID);
      //       governanceStatusChanged(drepID);
      //       navigateTo.delegationForm('delegate');
      //     },
      //   }
      // );
    });
  };

  const handleAbstain = () => {
    const vote: Vote = { kind: 'abstain' };
    // setPendingVote(vote.kind);
    governanceVoteChanged(vote);
    navigateTo.delegationForm();
    // createVotingCertificate(
    //   { vote: 'abstain', stakingKey },
    //   {
    //     onSuccess: async certificate => {
    //        navigateTo.delegationForm('delegate');
    //     },
    //   }
    // );
  };

  const handleNoConfidence = () => {
    const vote: Vote = { kind: 'no-confidence' };
    // setPendingVote(vote.kind);
    governanceVoteChanged(vote);
    navigateTo.delegationForm();
    // createVotingCertificate(
    //   { vote: 'no-confidence', stakePoolKeyHash },
    //   {
    //     onSuccess: async certificate => {
    //       navigateTo.confirmTx({ unsignedTx, vote });
    //     },
    //   }
    // );
  };

  const optionsList = [
    {
      title: governanceData?.kind === 'delegate' ? strings.delegateingToDRep : strings.delegateToDRep,
      description: strings.designatingSomeoneElse,
      icon: <DRepIlustration />,
      selected: governanceData?.kind === 'delegate',
      onClick: handleDelegate,
      pending: pendingVote,
    },
    {
      title: strings.abstain,
      description: strings.abstainInfo,
      icon: <Abstein />,
      selected: governanceData?.kind === 'abstain',
      onClick: handleAbstain,
      pending: pendingVote,
    },
    {
      title: strings.noConfidence,
      description: strings.noConfidenceInfo,
      icon: <NoConfidance />,
      selected: governanceData?.kind === 'no-confidence',
      onClick: handleNoConfidence,
      pending: pendingVote,
    },
  ];

  const skeletonsCards = new Array(optionsList.length).fill(null);

  return (
    <Container>
      <Typography variant="h3" fontWeight="500" mb={2} gutterBottom>
        {pageTitle}
      </Typography>
      <Typography variant="body1" mb="64px" gutterBottom>
        {pageSubtitle}
      </Typography>
      <Box display="flex" justifyContent="center" gap="24px">
        {!pendingPage
          ? optionsList.map((option, index) => {
              return (
                <GovernanceVoteingCard
                  key={index}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  selected={option.selected}
                  onClick={option.onClick}
                  pending={option.pending}
                />
              );
            })
          : skeletonsCards.map(() => <VotingSkeletonCard />)}
      </Box>

      <Stack gap="17px" mt="42px">
        {governanceData?.kind === 'delegate' && (
          <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
            `${strings.drepId} ${governanceData?.drepID}`
          </Typography>
        )}
        {governanceData?.kind === 'none' && (
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
