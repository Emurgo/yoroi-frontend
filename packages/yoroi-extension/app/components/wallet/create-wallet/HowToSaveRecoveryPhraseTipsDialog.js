// @flow
import type { Node, ComponentType } from 'react';
import InfoDialog from '../../widgets/infoDialog';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import { Typography, Box } from '@mui/material';
import { observer } from 'mobx-react';

const messages: Object = defineMessages({
  title: {
    id: 'wallet.create.dialog.howToSaveRecoveryPhrase.title',
    defaultMessage: '!!!How to save your recovery phrase?',
  },
  firstTip: {
    id: 'wallet.create.dialog.howToSaveRecoveryPhrase.firstTip',
    defaultMessage: '!!!Make sure no one is looking at your screen.',
  },
  secondTip: {
    id: 'wallet.create.dialog.howToSaveRecoveryPhrase.secondTip',
    defaultMessage: '!!!DO NOT take a screenshot.',
  },
  thirdTip: {
    id: 'wallet.create.dialog.howToSaveRecoveryPhrase.thirdTip',
    defaultMessage:
      '!!!Write the recovery phrase on a piece of paper and store in a secure location like a safety deposit box. ',
  },
  forthTip: {
    id: 'wallet.create.dialog.howToSaveRecoveryPhrase.forthTip',
    defaultMessage:
      '!!!It is recommended to have 2 or 3 copies of the recovery phrase in different secure locations.',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  +open: boolean,
  +onClose: void => void,
|};

function HowToSaveRecoveryPhraseTipsDialog(props: Props & Intl): Node {
  const { open, onClose, intl } = props;

  // [tipId, tipTxt]
  const tips = [
    [1, messages.firstTip],
    [2, messages.secondTip],
    [3, messages.thirdTip],
    [4, messages.forthTip],
  ];

  return (
    <InfoDialog open={open} onClose={onClose}>
      <Typography component="div" textAlign="center" variant="body1" fontWeight="500" mb="16px">
        {intl.formatMessage(messages.title)}
      </Typography>
      <Box component="ul" sx={{ listStyle: 'outside', px: '24px' }}>
        {tips.map(([tipId, tipTxt]) => (
          <Box key={tipId} component="li">
            <Typography component="div" variant="body1" color="grey.800">
              {intl.formatMessage(tipTxt)}
            </Typography>
          </Box>
        ))}
      </Box>
    </InfoDialog>
  );
}

export default (injectIntl(observer(HowToSaveRecoveryPhraseTipsDialog)): ComponentType<Props>);
