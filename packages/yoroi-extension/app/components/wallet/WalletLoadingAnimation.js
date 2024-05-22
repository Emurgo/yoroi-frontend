// @flow
import type { Node, ComponentType } from 'react';
import { useLottie } from 'lottie-react';
import prepareWalletAnimation from '../../assets/animations/prepare-wallet.json';
import { Box } from '@mui/system';
import { defineMessages, injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Typography } from '@mui/material';
import dotFlashingStyles from '../widgets/DotFlashing.scss';

const messages: * = defineMessages({
  walletLoading: {
    id: 'wallet.create.walletLoading',
    defaultMessage: '!!!Preparing your wallet',
  },
});

type Props = {||};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function WalletLoadingAnimation(props: Props & Intl): Node {
  const { intl } = props;
  const { View } = useLottie({
    animationData: prepareWalletAnimation,
    loop: true,
    width: 10,
  });

  return (
    <Stack alignItems="center" justifyContent="center" height="100%">
      <Box
        sx={{
          width: '140px',
          height: '120px',
        }}
      >
        {View}
      </Box>
      <Typography component="div"
        variant="h1"
        mt="25px"
        color="primary.600"
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {intl.formatMessage(messages.walletLoading)}
        <Box
          sx={{
            mb: '8px',
            ml: '15px',
          }}
          className={dotFlashingStyles.component}
        />
      </Typography>
    </Stack>
  );
}

export default (injectIntl(observer(WalletLoadingAnimation)): ComponentType<Props>);
