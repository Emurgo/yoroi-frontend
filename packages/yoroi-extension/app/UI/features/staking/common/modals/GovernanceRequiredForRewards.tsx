import { Button, Stack, Typography } from '@mui/material';
import { GovUpdatesIlustration } from './GovUpdatesIlustration';
import { useStrings } from '../hooks/useStrings';
import { useGovernanceDelegationToYoroiDrep } from '../../../governace/common/hooks/useGovernanceDelegationToYoroiDrep';
import { useModal } from '../../../../components/modals/ModalContext';
import { useGovernance } from '../../../governace/module/GovernanceContextProvider';
import { YOROI_DREP_ID, YOROI_DREP_ID_TESTNET } from '../../../governace/common/constants';

export const GovernanceRequiredForRewards = ({ onDelegate }) => {
  const strings = useStrings();
  const { delegateToDrep } = useGovernanceDelegationToYoroiDrep();
  const { isTestnet } = useGovernance();
  const yoroiDrepId = isTestnet ? YOROI_DREP_ID_TESTNET : YOROI_DREP_ID;

  const { closeModal } = useModal();

  const handleStake = () => {
    closeModal();
    onDelegate();
  };
  const handleVote = () => {
    closeModal();
    delegateToDrep(yoroiDrepId);
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
      <Button variant="outlined" fullWidth onClick={handleStake}>
        {strings.delegateStakeOnly}
      </Button>
    </Stack>
  );
};
