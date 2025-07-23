// @flow
import type { Node, ComponentType } from 'react';
import { Box } from '@mui/system';
import { Button, Stack, Typography } from '@mui/material';
import { injectIntl, defineMessages } from 'react-intl';
import { ReactComponent as CoverBg } from '../../assets/images/transaction/wallet-empty-banner.inline.svg';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { observer } from 'mobx-react';
import { ampli } from '../../../ampli/index';
import links from '../../links';

type Props = {|
  onBuySellClick: () => void,
  isTestnet: boolean,
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages = defineMessages({
  welcomeMessage: {
    id: 'wallet.emptyWalletMessage',
    defaultMessage: '!!!Your wallet is empty',
  },
  welcomeMessageSubtitle: {
    id: 'wallet.emptyWalletMessageSubtitle',
    defaultMessage: '!!!Top up your wallet safely using our trusted partners',
  },
});

function WalletEmptyBanner({ isTestnet, onBuySellClick, intl }: Props & Intl): Node {
  return (
    <Box>
      <Box
        sx={{
          background: theme => theme.palette.ds.bg_gradient_1,
          marginBottom: '40px',
          borderRadius: '8px',
          overflowY: 'hidden',
          position: 'relative',
          padding: '16px',
          height: 'auto',
        }}
        id="wallet|staking-emptyWalletBanner-box"
      >
        <Box sx={{ position: 'absolute', right: '1%', top: 'auto', bottom: '-3px' }}>
          <CoverBg />
        </Box>
        <Box>
          <Typography component="div" variant="h3" color="ds.gray_max" fontWeight={500} fontSize="18px" mb="8px">
            {intl.formatMessage(isTestnet? globalMessages.welcomeMessageTestnet : messages.welcomeMessage)}
          </Typography>
          <Typography component="div" variant="body1" color="ds.gray_max" mb="24px">
            {intl.formatMessage(isTestnet? globalMessages.welcomeMessageSubtitleTestnet: messages.welcomeMessageSubtitle)}
            {isTestnet ?
              <>
                <br />
                {intl.formatMessage(globalMessages.welcomeMessageSubtitleTestnetExtra)}
              </>
              : null
            }
          </Typography>
        </Box>
        <Stack direction="row" gap="16px">
          <Button
            variant="contained"
            color="primary"
            size="medium"
            sx={{
              '&.MuiButton-sizeMedium': {
                padding: '9px 20px',
                height: 'unset',
              },
            }}
            onClick={() => {
              if (isTestnet) {
                window.open(links.testnetFaucet, '_blank');
              } else {
                onBuySellClick();
                ampli.walletPageBuyBannerClicked();
              }
            }}
          >
            <Typography
              component="div"
              variant="button2"
              fontWeight={500}
              sx={{
                lineHeight: '19px',
              }}
            >
              {intl.formatMessage(isTestnet? globalMessages.goToFaucetButton: globalMessages.buyAda)}
            </Typography>
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default (injectIntl(observer(WalletEmptyBanner)): ComponentType<Props>);
