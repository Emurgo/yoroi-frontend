import { Button, Stack, Typography } from '@mui/material';
import { GovUpdatesIlustration } from './GovUpdatesIlustration';
import { useNavigateTo } from '../hooks/useNavigateTo';
import { useStrings } from '../hooks/useStrings';
import { useModal } from '../../../../components/modals/ModalContext';

export const StakeWithdrawUpdates = () => {
  const navigateTo = useNavigateTo();
  const strings = useStrings();
  const { closeModal } = useModal();
  const redirect = () => {
    closeModal();
    navigateTo.selectRevampStatus();
  };

  return (
    <Stack direction={'column'} alignItems="center" justifyContent="space-between" height="100%" pb={24}>
      <Stack>
        <Stack my={48} justifyContent="center" alignItems={'center'}>
          <GovUpdatesIlustration />
        </Stack>
        <Typography variant="h5" color="ds.text_gray_medium" mb={8} textAlign={'center'}>
          {strings.participationInGovernance}
        </Typography>
        <Typography variant="body1" color="ds.text_gray_medium" textAlign={'center'}>
          {strings.participationInfo}
        </Typography>
      </Stack>
      {/* @ts-ignore */}
      <Button variant="primary" fullWidth onClick={redirect} mb={24}>
        {strings.goToGovernance}
      </Button>
    </Stack>
  );
};
