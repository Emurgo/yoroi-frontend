import { Typography, Button, Grid, Stack, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useModal } from '../modals/ModalContext';
import { useEffect } from 'react';
import CardanoCardImage from './CardanoCardImage.png';
import LocalStorageApi from '../../../api/localStorage/index';
import { useStrings } from '../../common/hooks/useStrings';
import { CARDANO_CARD_URL } from '../../common/constants';
import { useYoroiRemoteConfig } from '../../common/hooks/useYoroiRemoteConfig';

export const CardanoCardDialog = () => {
  const strings = useStrings();
  const { openModal, closeModal } = useModal();
  const { data } = useYoroiRemoteConfig();

  useEffect(() => {
    const checkModalState = async () => {
      const localStorage = new LocalStorageApi();
      const wasClosed = await localStorage.getCardanoCardModalClosed();

      if (data?.popups?.cardanoCardAnnouncement?.display === false && (wasClosed === undefined || wasClosed === false)) {
        openModal({
          title: strings.cardanoCardTitle,
          height: '550px',
          width: '612px',
          content: (
            <CardanoCardContent
              onClose={() => {
                localStorage.setCardanoCardModalClosed(true);
                closeModal();
              }}
            />
          ),
          modalId: 'cardanoCard',
          onClose: () => {
            localStorage.setCardanoCardModalClosed(true);
          },
        });
      }
    };

    checkModalState();
  }, [data]);
};

const CardanoCardContent = ({ onClose }) => {
  const strings = useStrings();
  return (
    <Stack>
      <Stack direction="column" alignItems="center" justifyContent="center" pb="24px">
        <Stack my={58}>
          <img src={CardanoCardImage} alt="Midnight Illustration" />
        </Stack>

        <Typography variant="h5" color="ds.text_gray_medium" fontWeight={500} mb="8px">
          {strings.cardanoCardJoin}
        </Typography>
        <Typography variant="body1" color="ds.text_gray_medium" textAlign="center" mx="24px">
          {strings.cardanoCard}
        </Typography>
      </Stack>

      <Grid justifyContent="space-between" direction="column" style={{ marginTop: 18 }}>
        <Link href={CARDANO_CARD_URL} target="_blank" rel="noopener noreferrer" onClick={onClose}>
          <CustomButton variant="contained" color="primary">
            {strings.cardanoCardLearnMore}
          </CustomButton>
        </Link>

        <CustomButton variant="text" onClick={onClose} sx={{ marginTop: '8px' }}>
          {strings.skip}
        </CustomButton>
      </Grid>
    </Stack>
  );
};

const CustomButton = styled(Button)(() => ({
  width: '100%',
  fontSize: '14px',
}));
