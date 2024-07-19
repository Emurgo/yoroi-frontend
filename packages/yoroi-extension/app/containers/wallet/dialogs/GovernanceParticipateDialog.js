// @flow
import Dialog from '../../../components/widgets/Dialog';
import { Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import DialogCloseButton from '../../../components/widgets/DialogCloseButton';
import { defineMessages } from 'react-intl';

import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ROUTES } from '../../../routes-config';

type Props = {|
  onClose: () => void,
  actions: any,
  intl: $npm$ReactIntl$IntlFormat,
|};

const messages = defineMessages({
  title: {
    id: 'governance.participateDialog.title',
    defaultMessage: '!!!Withdraw warning',
  },
  contentInfo: {
    id: 'governance.participateDialog.contentInfo',
    defaultMessage:
      '!!!To withdraw your rewards, you need to participate in the Cardano Governance. Your rewards will continue to accumulate, but you are only able to withdraw it once you join the Governance process.',
  },
  buttonText: {
    id: 'governance.participateDialog.buttonText',
    defaultMessage: '!!!Participate on governance',
  },
});

export const GovernanceParticipateDialog = ({ onClose, actions, intl }: Props): React$Node => {
  return (
    <Dialog
      onClose={onClose}
      title={intl.formatMessage(messages.title)}
      styleOverride={{ width: '648px', height: '240px', padding: 0 }}
      styleContentOverride={{ padding: 0 }}
      closeOnOverlayClick
      closeButton={<DialogCloseButton />}
    >
      <Typography variant="body1" mb={2} mx="24px">
        {intl.formatMessage(messages.contentInfo)}
      </Typography>

      <CustomButton
        variant="contained"
        color="primary"
        width="100%"
        onClick={() => {
          onClose();
          actions.router.goToRoute.trigger({
            route: ROUTES.Governance.ROOT,
          });
        }}
        sx={{ marginTop: '12px' }}
      >
        {intl.formatMessage(messages.buttonText)}
      </CustomButton>
    </Dialog>
  );
};

const CustomButton = styled(Button)(({ _theme, _color }) => ({
  width: '100%',
  fontSize: '16px',
  marginLeft: '24px',
  marginRight: '24px',
  maxWidth: '600px',
}));
