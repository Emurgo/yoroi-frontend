import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { GovernanceProvider } from '@yoroi/staking';
import * as React from 'react';
import { NotEnoughMoneyToSendError } from '../../../../../api/common/errors';
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
  ALWAYS_ABSTAIN: 'Abstaining',
  ALWAYS_NO_CONFIDENCE: 'No confidence',
};

export const GovernanceStatusSelection = () => {
  const { governanceStatus, governanceManager, governanceVoteChanged, createDrepDelegationTransaction } = useGovernance();
  const [error, setError] = React.useState<string | null>(null);
  const navigateTo = useNavigateTo();
  const { openModal, closeModal } = useModal();
  const strings = useStrings();

  const pageTitle = governanceStatus.status !== 'none' ? strings.governanceStatus : strings.registerGovernance;
  const statusRawText = mapStatus[governanceStatus.status || ''];
  const pageSubtitle = governanceStatus.status === 'none' ? strings.reviewSelection : strings.statusSelected(statusRawText);

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

  const handleDelegate = async () => {
    openDRepIdModal(drepID => {
      const vote: Vote = { kind: 'delegate', drepID };
      createUnsignTx(drepID);
      governanceVoteChanged(vote);
    });
  };

  const handleAbstain = async () => {
    await createUnsignTx(DREP_ALWAYS_ABSTAIN);
    const vote: Vote = { kind: DREP_ALWAYS_ABSTAIN };
    governanceVoteChanged(vote);
  };

  const handleNoConfidence = async () => {
    await createUnsignTx(DREP_ALWAYS_NO_CONFIDENCE);
    const vote: Vote = { kind: DREP_ALWAYS_NO_CONFIDENCE };
    governanceVoteChanged(vote);
  };

  const createUnsignTx = async kind => {
    try {
      await createDrepDelegationTransaction(kind);
      setError(null);
      navigateTo.delegationForm();
    } catch (e) {
      if (e instanceof NotEnoughMoneyToSendError) {
        setError('Not enoght ADA to Vote');
        closeModal();
      }
      return;
    }
  };

  const optionsList = [
    {
      title: governanceStatus.status === 'delegate' ? strings.delegatingToDRep : strings.delegateToDRep,
      description: strings.designatingSomeoneElse,
      icon: <DRepIlustration />,
      selected: governanceStatus.status === 'delegate' ? true : false,
      onClick: handleDelegate,
      pending: governanceStatus.status === null,
    },
    {
      title: strings.abstain,
      description: strings.abstainInfo,
      icon: <Abstein />,
      selected: governanceStatus.status === DREP_ALWAYS_ABSTAIN ? true : false,
      onClick: handleAbstain,
      pending: governanceStatus.status === null,
    },
    {
      title: strings.noConfidence,
      description: strings.noConfidenceInfo,
      icon: <NoConfidance />,
      selected: governanceStatus.status === DREP_ALWAYS_NO_CONFIDENCE ? true : false,
      onClick: handleNoConfidence,
      pending: governanceStatus.status === null,
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
        {governanceStatus.status !== null
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
        {error && (
          <Typography variant="body2" sx={{ color: 'ds.sys_magenta_c500' }}>
            {error}
          </Typography>
        )}
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
