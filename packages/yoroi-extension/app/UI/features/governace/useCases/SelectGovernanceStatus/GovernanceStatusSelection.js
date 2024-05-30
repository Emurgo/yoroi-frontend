// @flow
import * as React from 'react';
import type { Node } from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useGovernance } from '../../module/GovernanceContextProvider';
import { DRepIlustration } from '../../common/ilustrations/DRepIlustration';
import { useStrings } from '../../common/useStrings';
import { Abstein } from '../../common/ilustrations/Abstein';
import { NoConfidance } from '../../common/ilustrations/NoConfidance';
import { Stack } from '@mui/material';
import { Button } from '@mui/material';
import Link from '@mui/material/Link';
import { useModal } from '../../../../components/modals/ModalContext';
import { ChooseDRepModal } from '../../common/ChooseDRepModal';
import { GovernanceVoteingCard } from '../../common/GovernanceVoteingCard';
import { GovernanceProvider, useStakingKeyState, useDelegationCertificate, useVotingCertificate } from '@yoroi/staking';
import { useNavigateTo } from '../../common/useNavigateTo';
import { useDrepDelegationState } from '../../api/useDrepDelegationState';
import { VotingSkeletonCard } from '../../common/VotingSkeletonCard';
import { BECOME_DREP_LINK, LEARN_MORE_LINK } from '../../common/constants';

const Container = styled(Box)(({ theme }) => ({
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

export const GovernanceStatusSelection = (): Node => {
  const [pendingVote, setPendingVote] = React.useState<boolean>(false);
  const [pendingPage, setPendingPage] = React.useState<boolean>(false);
  const navigateTo = useNavigateTo();

  const { openModal } = useModal();
  const { governanceVote, governanceManager, stakePoolKeyHash, dRepIdChanged, governanceVoteChanged, walletId } = useGovernance();
  const { data: governanceData } = useDrepDelegationState(walletId);

  const strings = useStrings();

  // TODO not woking - the sancho testnet is down and other networks throw error
  // const { data: stakingStatus } = useStakingKeyState(stakePoolKeyHash, { suspense: true });
  // const action = stakingStatus ? mapStakingKeyStateToGovernanceAction(stakingStatus) : null

  const { createCertificate, isLoading: isCreatingDelegationCertificate } = useDelegationCertificate({
    useErrorBoundary: true,
  });
  const { createCertificate: createVotingCertificate, isLoading: isCreatingVotingCertificate } = useVotingCertificate({
    useErrorBoundary: true,
  });

  const pageTitle = governanceVote === 'none' ? 'Register in Governance' : strings.governanceStatus;
  const statusRawText = mapStatus[governanceVote];
  const pageSubtitle =
    governanceVote === 'none'
      ? 'Review the selections carefully to assign yourself a Governance Status'
      : `You have selected ${statusRawText} as your governance status. You can change it at any time by clicking in the card bellow`;

  const openDRepIdModal = (onSubmit: (drepID: string) => void) => {
    openModal({
      title: 'Choose your Drep',
      content: (
        <GovernanceProvider manager={governanceManager}>
          <ChooseDRepModal onSubmit={onSubmit} />
        </GovernanceProvider>
      ),
      width: '648px',
    });
  };

  const handleDelegate = () => {
    openDRepIdModal(drepID => {
      const vote = { kind: 'delegate', drepID };
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
    const vote = { kind: 'abstain' };
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
    const vote = { kind: 'no-confidence' };
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
      title: 'Abstain',
      description: 'You are choosing not to cast a vote on all proposals now and in the future.',
      icon: <Abstein />,
      selected: governanceData?.kind === 'abstain',
      onClick: handleAbstain,
      pending: pendingVote,
    },
    {
      title: 'No Confidence',
      description: 'You are expressing a lack of trust for all proposals now and in the future.',
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
            `Drep ID: ${governanceData?.drepID}`
          </Typography>
        )}
        {governanceData?.kind === 'none' && (
          <Link href={BECOME_DREP_LINK} target="_blank" rel="noopener" variant="body1">
            Want to became a Drep?
          </Link>
        )}
        <Link href={LEARN_MORE_LINK} target="_blank" rel="noopener" variant="body1">
          Learn more About Governance
        </Link>
      </Stack>
    </Container>
  );
};
