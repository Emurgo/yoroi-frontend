// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import { Typography, Box, Stack, Button, Dialog, Fade } from '@mui/material';
import { observer } from 'mobx-react';
import globalMessages from '../../../../../i18n/global-messages';
import React from 'react';
import { genLookupOrFail } from '../../../../../stores/stateless/tokenHelpers';
import WalletInfo from '../../../../common/walletInfo/WalletInfo';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { MultiToken } from '../../../../../api/common/lib/MultiToken';
import type { TokenInfoMap } from '../../../../../stores/toplevel/TokenInfoStore';

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
  duplicatedWalletData: {|
    plate: WalletChecksum,
    conceptualWalletName: string,
    balance: MultiToken,
    updateHideBalance: () => Promise<void>,
    shouldHideBalance: boolean,
    tokenInfo: TokenInfoMap,
  |},
  open: boolean,
  onClose(): void,
  onNext(): void,
|};

const Transition = React.forwardRef((props, ref) => {
  return <Fade timeout={500} ref={ref} {...props} />;
});

function DuplicatedWalletDialog(props: Props & Intl): Node {
  const { open, onClose, onNext, intl, duplicatedWalletData } = props;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      id='duplicatedWalletDialog-dialog'
      sx={{
        background: 'rgb(18 31 77 / 70%)',
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
          <Typography
            component="div"
            sx={{ fontWeight: '500', textTransform: 'uppercase', textAlign: 'center' }}
            id='duplicatedWalletDialog-dialogTitle-text'
          >
            {intl.formatMessage(messages.dialogTitle)}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, mb: '24px' }}>
          <Typography component="div" textAlign="left" variant="body1" fontWeight="400" mb="16px">
            {intl.formatMessage(messages.title)}
          </Typography>
          <Box component="ul" sx={{ listStyle: 'outside', mt: '16px' }}>
            <Box sx={{ display: 'flex', flexFlow: 'row', gap: '8px' }}>
              <WalletInfo
                plate={duplicatedWalletData.plate}
                conceptualWalletName={duplicatedWalletData.conceptualWalletName}
                walletAmount={duplicatedWalletData.balance}
                onUpdateHideBalance={duplicatedWalletData.updateHideBalance}
                shouldHideBalance={duplicatedWalletData.shouldHideBalance}
                getTokenInfo={genLookupOrFail(duplicatedWalletData.tokenInfo)}
                isRefreshing={false}
              />
            </Box>
          </Box>
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between" gap="24px">
          <Button
            variant="outlined"
            color="primary"
            disableRipple={false}
            onClick={onClose}
            style={{ width: '100%', height: '48px', fontSize: '16px' }}
            id='duplicatedWalletDialog-cancel-button'
          >
            {intl.formatMessage(globalMessages.cancel)}
          </Button>
          <Button
            variant="contained"
            color="primary"
            disableRipple={false}
            onClick={onNext}
            style={{ width: '100%', height: '48px', fontSize: '16px' }}
            id='duplicatedWalletDialog-openWallet-button'
          >
            {intl.formatMessage(messages.openWallet)}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}

export default (injectIntl(observer(DuplicatedWalletDialog)): ComponentType<Props>);
