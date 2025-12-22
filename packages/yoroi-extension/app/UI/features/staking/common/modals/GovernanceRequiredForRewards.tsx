import { Button, Stack, Typography } from '@mui/material';
import { GovUpdatesIlustration } from './GovUpdatesIlustration';
import { useStrings } from '../hooks/useStrings';
import { useModal } from '../../../../components/modals/ModalContext';

export const GovernanceRequiredForRewards = ({ onDelegateToDrep, onStake }) => {
  const strings = useStrings();

  const { closeModal } = useModal();

  const handleStake = () => {
    closeModal();
    onStake();
  };
  const handleVote = () => {
    closeModal();
    onDelegateToDrep();
  };

  return (
    <Stack direction={'column'} alignItems="center" justifyContent="center">
      <Stack my={48} justifyContent="center" alignItems={'center'}>
        <GovUpdatesIlustration />
      </Stack>
      <Typography variant="h5" color="ds.text_gray_medium" mb={8} textAlign={'center'}>
        {strings.governanceRequired}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_medium" mb={24} textAlign={'center'}>
        {strings.toReceiveRewards}
      </Typography>
      <Button
        // @ts-ignore
        variant="primary"
        fullWidth
        onClick={handleVote}
        sx={{ marginBottom: '8px' }}
      >
        {strings.delegateToYoroiDRep}
      </Button>
      {/* @ts-ignore */}
      <Button variant="secondary" fullWidth onClick={handleStake}>
        {strings.delegateStakeOnly}
      </Button>
    </Stack>
  );
};
