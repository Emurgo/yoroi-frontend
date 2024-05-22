// @flow
import type { Node, ComponentType } from 'react';
import InfoDialog from '../../widgets/infoDialog';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import { Typography, Box } from '@mui/material';
import { observer } from 'mobx-react';

const messages: Object = defineMessages({
  title: {
    id: 'wallet.create.dialog.saveRecoveryPhrase.title',
    defaultMessage: '!!!Read this before saving your recovery phrase',
  },
  firstTip: {
    id: 'wallet.create.dialog.saveRecoveryPhrase.firstTip',
    defaultMessage:
      '!!!DO NOT share the recovery phrase as this will allow anyone to access your assets and wallet.',
  },
  secondTip: {
    id: 'wallet.create.dialog.saveRecoveryPhrase.secondTip',
    defaultMessage: '!!!The recovery phrase is the only way to access your wallet.',
  },
  thirdTip: {
    id: 'wallet.create.dialog.saveRecoveryPhrase.thirdTip',
    defaultMessage:
      '!!!Yoroi will NEVER ask for the recovery phrase. Watch out for scammers and impersonators.',
  },
  forthTip: {
    id: 'wallet.create.dialog.saveRecoveryPhrase.forthTip',
    defaultMessage:
      '!!!If you lose your recovery phrase, it will not be possible to recover your wallet.',
  },
  fifthTip: {
    id: 'wallet.create.dialog.saveRecoveryPhrase.fifthTip',
    defaultMessage: '!!!Remember: you are the only person who should know this recovery phrase.',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  open: boolean,
  onClose(): void,
|};

function SaveRecoveryPhraseTipsDialog(props: Props & Intl): Node {
  const { open, onClose, intl } = props;

  // [tipId, tipTxt]
  const tips = [
    [1, messages.firstTip],
    [2, messages.secondTip],
    [3, messages.thirdTip],
    [4, messages.forthTip],
    [5, messages.fifthTip],
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

export default (injectIntl(observer(SaveRecoveryPhraseTipsDialog)): ComponentType<Props>);
