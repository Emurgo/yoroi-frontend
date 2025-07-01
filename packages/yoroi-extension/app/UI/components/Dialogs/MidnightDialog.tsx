// @flow
import { Typography, Button, Grid, Stack, Box, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useIntl } from 'react-intl';
import { useModal } from '../modals/ModalContext';
import { useEffect } from 'react';
import { MidnightIlustration } from './MidnightIlustration';
import LocalStorageApi from '../../../api/localStorage/index';

export const MidnightDialog = (): React$Node => {
  const intl = useIntl();

  const { openModal, closeModal } = useModal();

  useEffect(() => {
    const checkModalState = async () => {
      const localStorage = new LocalStorageApi();
      const wasClosed = await localStorage.getMidnightModalClosed();

      console.log('wasClosed', wasClosed);
      if (wasClosed === undefined || wasClosed === false) {
        openModal({
          title: 'Important updates',
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
        });
      }
    };

    checkModalState();
  }, []);
};

const MidnightDialogContent = ({ onClose }) => {
  return (
    <Stack>
      <Stack direction="column" alignItems="center" justifyContent="center" py="24px">
        <MidnightIlustration />
        <Typography variant="h5" color="ds.text_gray_medium" fontWeight={500} mt="32px" mb="8px">
          {/* {intl.formatMessage(messages.currentStakePool)} */}
          Take part in the Midnight NIGHT token distribution
        </Typography>
        <Typography variant="body1" color="ds.text_gray_medium" textAlign="center" mx="24px">
          Yoroi will support Midnight’s multi-phase token distribution — a bold initiative to empower a diverse, global community.
        </Typography>
      </Stack>

      <Grid justifyContent="space-between" direction="column" style={{ marginTop: 18 }}>
        <Link href="https://www.midnight.gd/" target="_blank" rel="noopener noreferrer">
          <CustomButton variant="contained" color="primary" onClick={() => {}}>
            {/* {intl.formatMessage(messages.skipAndStop)} */}
            LEARN MORE
          </CustomButton>
        </Link>

        <CustomButton variant="text" onClick={onClose} sx={{ marginTop: '8px' }}>
          {/* {intl.formatMessage(messages.updateNow)} */}
          skip
        </CustomButton>
      </Grid>
    </Stack>
  );
};

const CustomButton = styled(Button)(() => ({
  width: '100%',
  fontSize: '14px',
}));
