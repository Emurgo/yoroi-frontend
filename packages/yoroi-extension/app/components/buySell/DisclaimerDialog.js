// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { useState, useEffect } from 'react';
import { defineMessages } from 'react-intl';
import { Box, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import LocalStorageApi from '../../api/localStorage/index';

const messages = defineMessages({
  title: {
    id: 'buySell.disclaimer.title',
    defaultMessage: '!!!Discover a new yoroi',
  },
  description: {
    id: 'buySell.disclaimer.description',
    defaultMessage:
      '!!!test',
  },
  pleaseNote: {
    id: 'buySell.disclaimer.pleaseNote',
    defaultMessage:
      '!!!Please note:',
  },
  note1: {
    id: 'buySell.disclaimer.note1',
    defaultMessage:
      '!!!1',
  },
  note2: {
    id: 'buySell.disclaimer.note2',
    defaultMessage:
      '!!!2',
  },
  note3: {
    id: 'buySell.disclaimer.note3',
    defaultMessage:
      '!!!3',
  },
  note4: {
    id: 'buySell.disclaimer.note4',
    defaultMessage:
      '!!!4',
  },
  checkboxLabel: {
    id: 'buySell.disclaimer.checkboxLabel',
    defaultMessage:
      '!!!test',
  },
  proceed: {
    id: 'buySell.actions.proceed',
    defaultMessage: '!!!Proceed',
  },
});

type Props = {|
  onClose: void => void,
  onAccept: void => void,
  intl: $npm$ReactIntl$IntlFormat
|};

export default function BuySellDisclaimerDialog(props: Props): Node {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const { onClose, onAccept, intl } = props;
  const localStorageApi = new LocalStorageApi();

  useEffect(() => {
    async function checkAcceptanceStatus() {
      const accepted = await localStorageApi.getBuySellDisclaimer();

      if (accepted == "true") {
        handleAccepted();
      }
    }

    checkAcceptanceStatus();
  }, [])

  const toggleDisclaimerAcceptance = () => {
    setDisclaimerAccepted(prevAccepted => !prevAccepted)
  }

  const handleAccepted = () => {
    localStorageApi.setBuySellDisclaimer("true");
    onAccept();
  }

  const handleClose = () => {
    localStorageApi.setBuySellDisclaimer("false");
    onClose();
  }

  const actions = [
    {
      label: intl.formatMessage(messages.proceed),
      onClick: handleAccepted,
      primary: true,
      disabled: !disclaimerAccepted
    },
  ];

  return (
    <Dialog
      title={intl.formatMessage(messages.title)}
      // className={styles.dialog}
      onClose={handleClose}
      closeButton={<DialogCloseButton onClose={handleClose} />}
      dialogActions={actions}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }} id="dialogRevampBox">
        <Typography component="div"
          variant="body1"
          sx={{
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {intl.formatMessage(messages.description)}
        </Typography>

        <Stack gap="16px">
          <Typography component="div" color="grayscale.900" variant="body1" fontWeight={500}>
            {intl.formatMessage(messages.pleaseNote)}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                listStyle: 'inside',
                color: 'grayscale.900',
                width: '100%',
              }}
            >
              {[messages.note1, messages.note2, messages.note3, messages.note4].map((message, i) => (
                <Typography component="li" variant="body1" color="grayscale.900">
                  {i}. {intl.formatMessage(message)}
                </Typography>
              ))}
            </Box>
          </Box>
          <FormControlLabel
            label={intl.formatMessage(messages.checkboxLabel)}
            control={
              <Checkbox
                checked={disclaimerAccepted}
                onChange={toggleDisclaimerAcceptance}
              />
            }
            sx={{ margin: '0px' }}
          />
        </Stack>
      </Box>
    </Dialog>
  );
}