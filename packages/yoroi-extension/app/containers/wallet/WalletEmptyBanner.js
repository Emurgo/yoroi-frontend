// @flow
import type { Node, ComponentType } from 'react';
import { Box } from '@mui/system';
import { Button, IconButton, Typography } from '@mui/material';
import { injectIntl, defineMessages } from 'react-intl';
import { ReactComponent as CloseIcon }  from '../../assets/images/close.inline.svg';
import { ReactComponent as CoverBg }  from '../../assets/images/transaction/wallet-empty-banner.inline.svg';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { observer } from 'mobx-react';

type Props = {|
  isOpen: boolean,
  onClose: void => void,
  onBuySellClick: () => void,
|};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages = defineMessages({
  walletEmpty: {
    id: 'wallet.transaction.empty',
    defaultMessage: '!!!Your wallet is empty',
  },
  walletEmptySubtitle: {
    id: 'wallet.transaction.emptySubtitle',
    defaultMessage: '!!!Top up your wallet safely using our trusted partners',
  },
});

function WalletEmptyBanner({ isOpen, onClose, onBuySellClick, intl }: Props & Intl): Node {
  return isOpen ? (
    <Box
      sx={{
        background: 'linear-gradient(45.48deg, #244ABF 0%, #4760FF 100%)',
        minHeight: 198,
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '40px',
        borderRadius: '8px',
        paddingRight: '110px',
        overflowY: 'hidden',
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', left: '50%', top: 0 }}>
        <CoverBg />
      </Box>
      <Box>
        <Typography variant="h3" color="var(--yoroi-palette-common-white)">
          {intl.formatMessage(messages.walletEmpty)}
        </Typography>
        <Typography variant="body1" color="var(--yoroi-palette-common-white)">
          {intl.formatMessage(messages.walletEmptySubtitle)}
        </Typography>
      </Box>
      <Button variant="primary" sx={{ width: '230px' }} onClick={onBuySellClick}>
        {intl.formatMessage(globalMessages.buyAda)}
      </Button>
      <IconButton
        sx={{
          position: 'absolute',
          top: 32,
          right: 24,
          padding: '3px',
          color: 'var(--yoroi-palette-common-white)',
        }}
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  ) : null;
}

export default (injectIntl(observer(WalletEmptyBanner)): ComponentType<Props>);
