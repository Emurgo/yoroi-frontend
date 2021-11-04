// @flow
import type { Node, ComponentType } from 'react';
import { Box, styled } from '@mui/system';
import { Stack, Button, IconButton, Typography, Tooltip } from '@mui/material';

import { injectIntl, defineMessages } from 'react-intl';
import CloseIcon from '../../assets/images/close.inline.svg';
import QuestionMarkIcon from '../../assets/images/question-mark.inline.svg';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { observer } from 'mobx-react';
import { emptyDashboardMessages } from '../../components/wallet/staking/dashboard/StakingDashboard';

type Props = {|
  isOpen: boolean,
  onClose: void => void,
  isWalletWithFunds: boolean,
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
  roaHelperMessage: {
    id: 'wallet.staking.banner.roaHelperMessage',
    defaultMessage:
      '!!!Estimated ROA (Return of ADA) based on staking result from the last 30 days',
  },
  firstRewardHelperMessage: {
    id: 'wallet.staking.banner.firstRewardHelperMessage',
    defaultMessage:
      '!!!1 epoch = 5 days. This means you will receive the first reward after 15-20 days from the delegation moment. All next rewards you will receive rewards every epoch (5 days).',
  },
});

type HelperTooltipProps = {|
  +message: string,
|};

function HelperTooltip({ message }: HelperTooltipProps): Node {
  return (
    <Tooltip title={<Typography variant="body2">{message}</Typography>} arrow placement="right">
      <Box display="inline-flex">
        <QuestionMarkIcon />
      </Box>
    </Tooltip>
  );
}

function WalletDelegationBanner({
  isOpen,
  onClose,
  isWalletWithFunds,
  onDelegateClick,
  intl,
  ticker,
  poolInfo = {},
}: Props & Intl): Node {
  const {
    name = '[EMUR1] Emurgo #1 ',
    estimatedRoa30d = '4.97%',
    firstReward = 'in 3-4 epochs',
    socialMedia = '',
  } = poolInfo || {};

  return isOpen ? (
    <WrapperBanner>
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
          <Typography display="flex" variant="body1" alignItems="center">
            ROA 30d
            <Typography as="span" color="var(--yoroi-palette-common-white)" marginRight="10px">
              {estimatedRoa30d}
            </Typography>
            <HelperTooltip message={intl.formatMessage(messages.roaHelperMessage)} />
          </Typography>
          <Typography display="flex" variant="body1" alignItems="center">
            First reward
            <Typography as="span" color="var(--yoroi-palette-common-white)" marginRight="10px">
              {firstReward}
            </Typography>
            <HelperTooltip message={intl.formatMessage(messages.firstRewardHelperMessage)} />
          </Typography>
          {socialMedia ? (
            <Typography variant="body1">
              Stake pool social media
              <Typography as="span">{socialMedia}</Typography>
            </Typography>
          ) : null}
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
        <Button
          variant="primary"
          sx={{ width: '220px' }}
          onClick={onDelegateClick}
          disabled={isWalletWithFunds}
        >
          {intl.formatMessage(globalMessages.delegateLabel)}
        </Button>
      </Stack>
      <CloseBtn onClick={onClose}>
        <CloseIcon />
      </CloseBtn>
    </WrapperBanner>
  ) : null;
}

export default (injectIntl(observer(WalletDelegationBanner)): ComponentType<Props>);

const WrapperBanner = styled(Box)({
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
});

const CloseBtn = styled(IconButton)({
  position: 'absolute',
  top: 32,
  right: 24,
  padding: '3px',
  color: 'var(--yoroi-palette-common-white)',
});
