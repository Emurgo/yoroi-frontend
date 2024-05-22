// @flow
import type { Node, ComponentType } from 'react';
import InfoDialog from '../../widgets/infoDialog';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import { Typography, Box } from '@mui/material';
import { observer } from 'mobx-react';

const messages: Object = defineMessages({
  whatIsWalletName: {
    id: 'wallet.create.dialog.walletNameAndPassword.whatIsWalletName',
    defaultMessage: '!!!What is wallet name?',
  },
  walletNameFirstTip: {
    id: 'wallet.create.dialog.walletNameAndPassword.whatIsWalletName.firstTip',
    defaultMessage:
      '!!!It is a wallet identifier that helps you to easier find the exact wallet in your app',
  },
  walletNameSecondTip: {
    id: 'wallet.create.dialog.walletNameAndPassword.whatIsWalletName.secondTip',
    defaultMessage:
      '!!!You can have different wallet names for the same wallet account connected to different devices',
  },
  whatIsWalletPassword: {
    id: 'wallet.create.dialog.walletNameAndPassword.whatIsWalletPassword',
    defaultMessage: '!!!What is password?',
  },
  walletPasswordFirstTip: {
    id: 'wallet.create.dialog.walletNameAndPassword.whatIsWalletPassword.firstTip',
    defaultMessage:
      '!!!Password is an additional security layer used to confirm transactions from this device',
  },
  walletPasswordSecondTip: {
    id: 'wallet.create.dialog.walletNameAndPassword.whatIsWalletPassword.secondTip',
    defaultMessage:
      '!!!Both wallet name and password are stored locally, so you are only person who can change or restore it.',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  open: boolean,
  onClose(): void,
|};

function CreateWalletPage(props: Props & Intl): Node {
  const { open, onClose, intl } = props;

  const content = [
    {
      id: 1,
      title: messages.whatIsWalletName,
      tips: [
        [1, messages.walletNameFirstTip],
        [2, messages.walletNameSecondTip],
      ],
    },
    {
      id: 2,
      title: messages.whatIsWalletPassword,
      tips: [
        [1, messages.walletPasswordFirstTip],
        [2, messages.walletPasswordSecondTip],
      ],
    },
  ];

  return (
    <InfoDialog open={open} onClose={onClose}>
      {content.map(({ id, title, tips }) => (
        <Box key={id} mb={id === 1 ? '16px' : '0px'} id="walletRestorationInfoDialog">
          <Typography component="div" textAlign="center" variant="body1" fontWeight="500" mb="8px">
            {intl.formatMessage(title)}
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
        </Box>
      ))}
    </InfoDialog>
  );
}

export default (injectIntl(observer(CreateWalletPage)): ComponentType<Props>);
