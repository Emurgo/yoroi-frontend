import { Typography, Button, Stack, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useModal } from '../modals/ModalContext';
import { useEffect } from 'react';
import LocalStorageApi from '../../../api/localStorage/index';
import { useStrings } from '../../common/hooks/useStrings';
import { FIREFOX_DEPRECATION_LEARN_MORE_URL } from '../../common/constants';
import { useYoroiRemoteConfig } from '../../common/hooks/useYoroiRemoteConfig';
import { FirefoxsupportIlustration } from './FirefoxsupportIlustration';
import { environment } from '../../../environment';

export const FirefoxSupportBanner = () => {
  const strings = useStrings();
  const { openModal, closeModal } = useModal();
  const { data } = useYoroiRemoteConfig();

  useEffect(() => {
    const checkModalState = async () => {
      const localStorage = new LocalStorageApi();
      const wasClosed = await localStorage.getFirefoxSupportModalClosed();

      if (
        environment.isFirefox() &&
        data?.popups?.firefoxSupportAnnouncement?.display === true &&
        (wasClosed === undefined || wasClosed === 'false')
      ) {
        openModal({
          title: strings.importantUpdates,
          height: '608px',
          width: '612px',
          content: (
            <FirefoxCardContent
              onClose={() => {
                localStorage.setFirefoxSupportModalClosed('true');
                closeModal();
              }}
            />
          ),
          modalId: 'firefoxSupportAnnouncement',
          onClose: () => {
            localStorage.setFirefoxSupportModalClosed('true');
          },
        });
      }
    };

    checkModalState();
  }, [data]);
};

const FirefoxCardContent = ({ onClose }) => {
  const strings = useStrings();
  return (
    <Stack>
      <Stack direction="column" alignItems="center" justifyContent="center" pb="24px">
        <Stack>
          <FirefoxsupportIlustration />
        </Stack>

        <Typography variant="h5" color="ds.text_gray_medium" fontWeight={500} mt={24} mb={8}>
          {strings.firefoxSupportSubtitle}
        </Typography>
        <Typography variant="body1" color="ds.text_gray_medium" textAlign="center">
          {strings.firefoxSupportDescription}
        </Typography>
      </Stack>

      <Stack justifyContent="space-between" direction="column" width="100%" alignItems="center">
        <Link href={FIREFOX_DEPRECATION_LEARN_MORE_URL} target="_blank" rel="noopener noreferrer" textAlign="center">
          {strings.firefoxSupportLearnMore}
        </Link>
        {/* @ts-ignore */}
        <CustomButton variant="primary" onClick={onClose}>
          {strings.understandLabel}
        </CustomButton>
      </Stack>
    </Stack>
  );
};

const CustomButton = styled(Button)(() => ({
  marginTop: '24px',
  width: '100%',
  fontSize: '14px',
}));
