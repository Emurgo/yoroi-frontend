// @flow
import type { Node, ComponentType } from 'react';
import { Box } from '@mui/system';
import { Stack, Button, IconButton, Typography } from '@mui/material';

import { injectIntl, defineMessages } from 'react-intl';
import CloseIcon from '../../assets/images/close.inline.svg';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { observer } from 'mobx-react';
import { emptyDashboardMessages } from '../../components/wallet/staking/dashboard/StakingDashboard';

type Props = {|
  isOpen: boolean,
  onClose: void => void,
  onDelegateClick: () => void,
  +ticker: string,
|};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages = defineMessages({
  noDelegated: {
    id: 'wallet.transaction.empty',
    defaultMessage: '!!!Your wallet is empty',
  },
  delegateNow: {
    id: 'wallet.staking.banner.delegateNow',
    defaultMessage: '!!!Delegate now with our stake pool and start earning rewards',
  },
});

function WalletDelegationBanner({
  isOpen,
  onClose,
  onDelegateClick,
  intl,
  ticker,
  poolInfo = {},
}: Props & Intl): Node {
  const {
    name = '[EMUR1] Emurgo #1 ',
    estimatedRoa30d = '5.1 %',
    firstReward = 'in 3-4 epochs',
    socialMedia = 'T',
  } = poolInfo || {};

  return isOpen ? (
    <Box
      sx={{
        position: 'relative',
        background: 'linear-gradient(45.48deg, #244ABF 0%, #4760FF 100%)',
        minHeight: 269,
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '40px',
        borderRadius: '8px',
        paddingRight: '110px',
        overflowY: 'hidden',
      }}
    >
      <Box>
        <Typography variant="h3" color="var(--yoroi-palette-common-white)" marginBottom="3px">
          {intl.formatMessage(emptyDashboardMessages.title, { ticker })}
        </Typography>
        <Typography variant="body1" color="var(--yoroi-palette-common-white)">
          {intl.formatMessage(messages.delegateNow)}
        </Typography>
        <Stack
          spacing="8px"
          sx={{
            marginTop: '33px',
            color: '#889CDF',
            span: {
              marginLeft: '8px',
            },
          }}
        >
          <Typography color="var(--yoroi-palette-common-white)" variant="body1">
            {name}
          </Typography>
          <Typography variant="body1">
            ROA 30d
            <Typography as="span" color="var(--yoroi-palette-common-white)">
              {estimatedRoa30d}
            </Typography>
          </Typography>
          <Typography variant="body1">
            First reward
            <Typography as="span" color="var(--yoroi-palette-common-white)">
              {firstReward}
            </Typography>
          </Typography>
          <Typography variant="body1">
            Stake poool social media
            <Typography as="span">{socialMedia}</Typography>
          </Typography>
        </Stack>
      </Box>
      <Stack direction="row" spacing="24px">
        <Button
          variant="secondary"
          sx={{ width: '220px' }}
          onClick={() => console.log('learn more')}
        >
          {intl.formatMessage(globalMessages.learnMore)}
        </Button>
        <Button variant="primary" sx={{ width: '220px' }} onClick={onDelegateClick}>
          {intl.formatMessage(globalMessages.delegateLabel)}
        </Button>
      </Stack>
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

export default (injectIntl(observer(WalletDelegationBanner)): ComponentType<Props>);
