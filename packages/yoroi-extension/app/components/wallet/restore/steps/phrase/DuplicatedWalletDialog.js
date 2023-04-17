// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import { Typography, Box, Stack, Button, Dialog, Fade } from '@mui/material';
import { observer } from 'mobx-react';
import InfoDialog from '../../../../widgets/infoDialog';
import globalMessages from '../../../../../i18n/global-messages';
import React from 'react';
import StepController from '../../StepController';

const messages: Object = defineMessages({
  dialogTitle: {
    id: 'wallet.restore.dialog.existingWallet.dialogTitle',
    defaultMessage: '!!!Wallet already exists',
  },
  title: {
    id: 'wallet.restore.dialog.existingWallet.title',
    defaultMessage:
      '!!!This wallet already exists on your device, You can open it or go back and restore another wallet.',
  },
  openWallet: {
    id: 'wallet.restore.dialog.walletExist.openWallet',
    defaultMessage: '!!!Open Wallet',
  },
});

type Intl = {| intl: $npm$ReactIntl$IntlShape |};

type Props = {|
  duplicatedWalletData: any,
  open: boolean,
  onClose(): void,
  onNext(): void,
|};

const Transition = React.forwardRef((props, ref) => {
  return <Fade timeout={500} ref={ref} {...props} />;
});

function DuplicatedWalletDialog(props: Props & Intl): Node {
  const { open, onClose, onNext, intl } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      sx={{
        background: 'var(--yoroi-comp-dialog-overlay-background-color)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '& .MuiPaper-root': { background: 'none', maxWidth: 'unset' },
      }}
    >
      <Box
        sx={{
          width: '648px',
          background: 'var(--yoroi-palette-common-white)',
          borderRadius: '8px',
          boxShadow: '0px 13px 20px -1px rgba(0, 0, 0, 0.15)',
          border: '1px solid grey.200',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: '500', textTransform: 'uppercase', textAlign: 'center' }}>
            {intl.formatMessage(messages.dialogTitle)}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, mb: '24px' }}>
          <Typography textAlign="left" variant="body1" fontWeight="400" mb="16px">
            {intl.formatMessage(messages.title)}
          </Typography>
          <Box component="ul" sx={{ listStyle: 'outside', mt: '16px' }}>
            [DuplicatedWallet]
          </Box>
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between" gap="24px">
          <Button
            variant="outlined"
            disableRipple={false}
            onClick={onClose}
            sx={{
              width: '100%',
              height: '48px',
              minWidth: 'unset',
              minHeight: 'unset',
              fontSize: '16px',
              borderWidth: 2,
              borderColor: 'var(--yoroi-palette-primary-200)',
              '&:hover': { borderWidth: 2 },
            }}
          >
            {intl.formatMessage(globalMessages.cancel)}
          </Button>

          <Button
            variant="rv-primary"
            disableRipple={false}
            onClick={onNext}
            sx={{ width: '100%', height: '48px', fontSize: '16px' }}
          >
            {intl.formatMessage(messages.openWallet)}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}

export default (injectIntl(observer(DuplicatedWalletDialog)): ComponentType<Props>);
