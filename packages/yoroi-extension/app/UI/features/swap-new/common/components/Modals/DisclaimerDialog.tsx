import { useEffect, useState } from 'react';
import { useStrings } from '../../hooks/useStrings';
import { Stack, Typography, Checkbox, FormControlLabel, Box, Button } from '@mui/material';
import { useModal } from '../../../../../components/modals/ModalContext';
import LocalStorageApi from '../../../../../../api/localStorage/index';
import { useNavigateTo } from '../../../../../common/hooks/useNavigateTo';

export const DisclaimerDialog = () => {
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);
  const strings = useStrings();
  const navigate = useNavigateTo();
  const { openModal, closeModal } = useModal();
  const localStorage = new LocalStorageApi();
  const onAcceptDisclaimer = () => {
    localStorage.setSwapDisclaimerModalClosed(true);
    closeModal();
  };
  const action = {
    onClick: onAcceptDisclaimer,
    primary: true,
    label: strings.disclaimerProceed,
  };

  useEffect(() => {
    const checkModalState = async () => {
      try {
        const wasClosed = await localStorage.getSwapDisclaimerModalClosed();
        if (wasClosed === undefined || wasClosed === 'false') {
          openModal({
            title: strings.disclaimerTitle,
            content: (
              <DisclaimerDialogBody
                action={action}
                disclaimerAgreed={disclaimerAgreed}
                setDisclaimerAgreed={setDisclaimerAgreed}
              />
            ),
            height: '588px',
            width: '702px',
            modalId: 'swapDisclaimer',
            onClose: () => {
              navigate.walletTransactions();
              localStorage.setSwapDisclaimerModalClosed('false');
            },
          });
        }
      } catch (error) {
        console.error('Error checking modal state:', error);
      }
    };

    checkModalState();
  }, [disclaimerAgreed]);

  return <></>;
};

const DisclaimerDialogBody = ({ action, disclaimerAgreed, setDisclaimerAgreed }) => {
  const strings = useStrings();
  console.log('DisclaimerDialog render', { disclaimerAgreed });

  return (
    <Stack>
      <Box display="flex" maxWidth="648px" flexDirection="column" gap="24px">
        <Box>
          <Typography component="div" variant="body1" color="grayscale.900" align="justify">
            {strings.disclaimerDescription}
          </Typography>
        </Box>
        <Box>
          <Typography component="div" fontWeight={500} variant="body1" color="grayscale.900" align="justify">
            {strings.disclaimerPleaseNote}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexFlow: 'column',
            }}
          >
            {[strings.disclaimerNote1, strings.disclaimerNote2, strings.disclaimerNote3, strings.disclaimerNote4].map(
              (message, i) => (
                <Box
                  sx={{
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                  }}
                >
                  <Typography component="div" variant="body1" color="grayscale.900">
                    {i + 1}.&nbsp;
                  </Typography>
                  <Typography component="div" variant="body1" color="grayscale.900">
                    {message}
                  </Typography>
                </Box>
              )
            )}
          </Box>
        </Box>

        <FormControlLabel
          label={
            <Typography component="div" variant="body1" color="grayscale.900">
              {strings.disclaimerCheckboxLabel}
            </Typography>
          }
          control={
            <Checkbox
              onChange={() => {
                setDisclaimerAgreed(!disclaimerAgreed);
              }}
              checked={disclaimerAgreed}
              sx={{ marginRight: '8px' }}
            />
          }
          sx={{ margin: '0px' }}
        />
      </Box>

      <Stack pt={20}>
        <Button
          // @ts-ignore
          variant="primary"
          onClick={action.onClick}
          disabled={disclaimerAgreed ? false : true}
        >
          {action.label}
        </Button>
      </Stack>
    </Stack>
  );
};
