import { Typography, Button, Grid, Stack, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useIntl } from 'react-intl';
import { useModal } from '../modals/ModalContext';
import { useEffect } from 'react';
import { MidnightIlustration } from './MidnightIlustration';
import LocalStorageApi from '../../../api/localStorage/index';
import { messages } from '../../common/hooks/useStrings';
import { MIDNIGHT_DISTRIBUTION_URL } from '../../common/constants';
import { useYoroiRemoteConfig } from '../../common/hooks/useYoroiRemoteConfig';

export const MidnightDialog = () => {
  const intl = useIntl();
  const { openModal, closeModal } = useModal();
  const { data } = useYoroiRemoteConfig();

  useEffect(() => {
    const checkModalState = async () => {
      const localStorage = new LocalStorageApi();
      const wasClosed = await localStorage.getMidnightModalClosed();

      if (data?.popups?.midnightDistribution?.display === true && (wasClosed === undefined || wasClosed === false)) {
        openModal({
          title: intl.formatMessage(messages.importantUpdates),
          height: '597px',
          width: '650px',
          content: (
            <MidnightDialogContent
              onClose={() => {
                localStorage.setMidnightModalClosed(true);
                closeModal();
              }}
            />
          ),
          modalId: 'midnight',
          onClose: () => {
            localStorage.setMidnightModalClosed(true);
          },
        });
      }
    };

    checkModalState();
  }, [data]);
};

const MidnightDialogContent = ({ onClose }) => {
  const intl = useIntl();
  return (
    <Stack>
      <Stack direction="column" alignItems="center" justifyContent="center" py="24px">
        <MidnightIlustration />
        <Typography variant="h5" color="ds.text_gray_medium" fontWeight={500} mt="32px" mb="8px">
          {intl.formatMessage(messages.takePartInMidnight)}
        </Typography>
        <Typography variant="body1" color="ds.text_gray_medium" textAlign="center" mx="24px">
          {intl.formatMessage(messages.midnightSupport)}
        </Typography>
      </Stack>

      <Grid justifyContent="space-between" direction="column" style={{ marginTop: 18 }}>
        <Link href={MIDNIGHT_DISTRIBUTION_URL} target="_blank" rel="noopener noreferrer" onClick={onClose}>
          <CustomButton variant="contained" color="primary">
            {intl.formatMessage(messages.learnMore)}
          </CustomButton>
        </Link>

        <CustomButton variant="text" onClick={onClose} sx={{ marginTop: '8px' }}>
          {intl.formatMessage(messages.skip)}
        </CustomButton>
      </Grid>
    </Stack>
  );
};

const CustomButton = styled(Button)(() => ({
  width: '100%',
  fontSize: '14px',
}));
