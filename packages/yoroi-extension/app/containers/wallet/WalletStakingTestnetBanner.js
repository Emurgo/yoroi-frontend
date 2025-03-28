import type { Node, ComponentType } from 'react';
import { Box, Typography } from '@mui/material';
import { injectIntl, defineMessages } from 'react-intl';
import { observer } from 'mobx-react';
import { ReactComponent as CoverBg } from '../../assets/images/dashboard/staking-illustration.inline.svg';

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages = defineMessages({
  stakingTestnetSupportYoroiTitle: {
    id: 'wallet.staking.testnet.supportYoroiTitle',
    defaultMessage: '!!!Stake test ADA and support Yoroi',
  },
  stakingTestnetSupportYoroiMessage: {
    id: 'wallet.staking.testnet.supportYoroiMessage',
    defaultMessage:
      "!!!Stake your test ADA and support Yoroi by participating in our testnet staking program. Experience the mechanism of staking firsthand and help us improve Yoroi's functionality and user experience.",
  },
});

function WalletStakingTestnet({ intl }: Intl): Node {
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
          height: '138px',
        }}
        id="staking-suppotYoroiTestnetBanner-box"
      >
        <Box
          sx={{
            position: 'absolute',
            right: '0.5%',
            top: '-10px',
            '& svg': {
              width: '230px',
              height: '232px',
            },
          }}
        >
          <CoverBg />
        </Box>
        <Box>
          <Typography component="div" variant="h3" color="ds.gray_max" fontWeight={500} fontSize="18px" mb="8px" lineHeight="26px">
            {intl.formatMessage(messages.stakingTestnetSupportYoroiTitle)}
          </Typography>
          <Typography component="div" variant="body1" color="ds.gray_max" width="512px">
            {intl.formatMessage(messages.stakingTestnetSupportYoroiMessage)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default (injectIntl(observer(WalletStakingTestnet)): ComponentType<Props>);
