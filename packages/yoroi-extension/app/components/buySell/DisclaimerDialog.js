// @flow
import type { Node } from 'react';
import { useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Box, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import LocalStorageApi from '../../api/localStorage/index';

const messages = defineMessages({
  title: {
    id: 'buySell.disclaimer.title',
    defaultMessage: '!!!Disclaimer',
  },
  description: {
    id: 'buySell.disclaimer.description',
    defaultMessage:
      '!!!By clicking "Proceed," you acknowledge that you will be redirected to a third-party service provider offering Web3 on-and-off ramp solutions for fiat-to-ADA exchanges. You may be required to agree to the terms, conditions, and privacy policies of the third-party provider to complete the transaction. Yoroi Wallet does not control, endorse, or assume responsibility for the content, security, policies, or services provided by the third party.',
  },
  pleaseNote: {
    id: 'buySell.disclaimer.pleaseNote',
    defaultMessage: '!!!Please note:',
  },
  note1: {
    id: 'buySell.disclaimer.note1',
    defaultMessage:
      '!!!Yoroi Wallet is not liable for any losses, delays, or errors that may occur while using the third-party service.',
  },
  note2: {
    id: 'buySell.disclaimer.note2',
    defaultMessage:
      "!!!Transactions may be subject to restrictions based on your geographic location, applicable laws, financial institution policies, or the service provider's limitations.",
  },
  note3: {
    id: 'buySell.disclaimer.note3',
    defaultMessage:
      "!!!Ensure you review and understand the third party's terms, as your interactions are solely governed by their agreements.",
  },
  note4: {
    id: 'buySell.disclaimer.note4',
    defaultMessage:
      '!!!Yoroi Wallet does not collect or store any personal or financial data submitted through the third-party platform.',
  },
  checkboxLabel: {
    id: 'buySell.disclaimer.checkboxLabel',
    defaultMessage: '!!!I understand this disclaimer',
  },
  proceed: {
    id: 'buySell.actions.proceed',
    defaultMessage: '!!!Proceed',
  },
});

type Props = {|
  onClose: void => void,
  onAccept: void => void,
  onNotAcceptedYet: void => void,
|};

export default function BuySellDisclaimerDialog(props: Props): Node {
  const intl = useIntl();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { onClose, onAccept, onNotAcceptedYet } = props;
  const localStorageApi = new LocalStorageApi();

  useEffect(() => {
    async function checkAcceptanceStatus() {
      const accepted = await localStorageApi.getBuySellDisclaimer();

      if (accepted === 'true') {
        handleAccepted();
      } else {
        onNotAcceptedYet();
      }

      setIsLoaded(true);
    }

    // eslint-disable-next-line no-floating-promise/no-floating-promise
    checkAcceptanceStatus();
  }, []);

  const toggleDisclaimerAcceptance = () => {
    setDisclaimerAccepted(prevAccepted => !prevAccepted);
  };

  const handleAccepted = () => {
    localStorageApi.setBuySellDisclaimer('true');
    onAccept();
  };

  const handleClose = () => {
    localStorageApi.setBuySellDisclaimer('false');
    onClose();
  };

  const actions = [
    {
      label: intl.formatMessage(messages.proceed),
      onClick: handleAccepted,
      primary: true,
      disabled: !disclaimerAccepted,
    },
  ];

  if (!isLoaded) {
    return null;
  }

  return (
    <Dialog
      title={intl.formatMessage(messages.title)}
      onClose={handleClose}
      closeButton={<DialogCloseButton onClose={handleClose} />}
      dialogActions={actions}
      styleContentOverride={{ paddingTop: 0 }}
      styleOverride={{ maxWidth: '648px' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }} id="dialogRevampBox">
        <Typography component="div" variant="body1" color="ds.text_gray_medium">
          {intl.formatMessage(messages.description)}
        </Typography>

        <Stack gap="16px">
          <Typography component="div" color="grayscale.900" variant="body1" fontWeight={500}>
            {intl.formatMessage(messages.pleaseNote)}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexFlow: 'column',
            }}
          >
            {[messages.note1, messages.note2, messages.note3, messages.note4].map((message, i) => (
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
                  {intl.formatMessage(message)}
                </Typography>
              </Box>
            ))}
          </Box>
          <FormControlLabel
            label={intl.formatMessage(messages.checkboxLabel)}
            control={<Checkbox checked={disclaimerAccepted} onChange={toggleDisclaimerAcceptance} sx={{ marginRight: '8px' }} />}
            sx={{
              margin: '0px',
              color: 'ds.text_gray_medium',
            }}
          />
        </Stack>
      </Box>
    </Dialog>
  );
}
