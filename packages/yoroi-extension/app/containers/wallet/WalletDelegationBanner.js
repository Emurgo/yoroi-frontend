// @flow
import type { Node, ComponentType } from 'react';
import { Box, styled } from '@mui/system';
import { Button, IconButton, Typography, Link } from '@mui/material';

import { injectIntl, defineMessages } from 'react-intl';
import { ReactComponent as CloseIcon } from '../../assets/images/close.inline.svg';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { observer } from 'mobx-react';
import { emptyDashboardMessages } from '../../components/wallet/staking/dashboard/StakingDashboard';
import { toSvg } from 'jdenticon';

import { SocialMediaStakePool } from '../../components/wallet/staking/dashboard-revamp/StakePool/StakePool';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import type { PoolData } from './staking/SeizaFetcher';

type Props = {|
  +isOpen: boolean,
  +onClose: void => void,
  +isWalletWithNoFunds: boolean,
  +poolInfo: PoolData | void,
  +onDelegateClick: string => Promise<void>,
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
  poolSize: {
    id: 'wallet.staking.banner.poolSizeLabel',
    defaultMessage: '!!!Pool size',
  },
  poolShare: {
    id: 'wallet.staking.banner.poolShareLabel',
    defaultMessage: '!!!Share',
  },
  poolCosts: {
    id: 'wallet.staking.banner.poolCostsLabel',
    defaultMessage: '!!!Costs',
  },
  blocksLabel: {
    id: 'wallet.staking.banner.poolBlocksLabel',
    defaultMessage: '!!!Blocks',
  },
  delegateNow: {
    id: 'wallet.staking.banner.delegateNow',
    defaultMessage: '!!!Delegate now with our stake pool and start earning rewards',
  },
  firstRewardHelperMessage: {
    id: 'wallet.staking.banner.firstRewardHelperMessage',
    defaultMessage:
      '!!!1 epoch = 5 days. This means you will receive the first reward after 15-20 days from the delegation moment. All next rewards you will receive rewards every epoch (5 days).',
  },
  firstReward: {
    id: 'wallet.staking.banner.firstReward',
    defaultMessage: '!!!First reward',
  },
  firstRewardDetails: {
    id: 'wallet.staking.banner.firstRewardDetails',
    defaultMessage: '!!!in 3-4 epochs',
  },
  socialMedia: {
    id: 'wallet.staking.banner.socialMedia',
    defaultMessage: '!!!Stake pool social media',
  },
});

function WalletDelegationBanner({
  isOpen,
  onClose,
  isWalletWithNoFunds,
  onDelegateClick,
  intl,
  ticker,
  poolInfo,
}: Props & Intl): Node {
  if (poolInfo == null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py="40px">
        <LoadingSpinner />
      </Box>
    );
  }
  const { id, name, avatar, websiteUrl, roa: estimatedRoa30d, socialLinks, poolSize, share } =
    poolInfo || {};

  const avatarSource = toSvg(id, 36, { padding: 0 });
  const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;

  const poolInfoFields = [
    {
      label: globalMessages.roa30d,
      value: estimatedRoa30d,
    },
    {
      label: messages.poolSize,
      value: poolSize,
    },
    {
      label: messages.poolShare,
      value: share,
    },
    {
      label: messages.poolCosts,
      value: '__c',
    },
    {
      label: messages.blocksLabel,
      value: '__b',
    },
  ];

  return isOpen ? (
    <WrapperBanner
      sx={{
        background: theme => theme.palette.background.gradients.walletEmptyCard,
      }}
    >
      <Box>
        <Typography variant="h3" fontWeight={500} color="comon.black" marginBottom="4px">
          {intl.formatMessage(emptyDashboardMessages.title, { ticker })}
        </Typography>
        <Typography variant="body1" color="common.black">
          {intl.formatMessage(messages.delegateNow)}
        </Typography>
        <Box sx={{ display: 'flex', mb: '16px', mt: '24px' }}>
          <AvatarWrapper>
            {avatar ? (
              <AvatarImg src={avatar} alt={name} />
            ) : (
              <AvatarImg src={avatarGenerated} alt={name} />
            )}
          </AvatarWrapper>
          <Typography color="common.black" variant="body1" fontWeight={500}>
            {name}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '20px',
          }}
        >
          {poolInfoFields.map(({ label: message, value }) => {
            const label = intl.formatMessage(message);
            return (
              <Box
                sx={{
                  minWidth: '85px',
                }}
                key={label}
              >
                <Typography variant="body1" fontWeight={500} color="common.black">
                  {label}
                </Typography>
                <Typography variant="body1" color="common.black">
                  {value ? value.trim() : '-'}
                </Typography>
              </Box>
            );
          })}
        </Box>
        <Box mt="16px">
          <SocialMediaStakePool
            color="common.black"
            socialLinks={socialLinks}
            websiteUrl={websiteUrl}
          />
        </Box>
        <Box sx={{ marginTop: '24px', display: 'flex', flexDirection: 'row', gap: '24px' }}>
          <Link
            as={Button}
            variant="secondary"
            sx={{ textDecoration: 'none' }}
            size="small"
            href="https://emurgohelpdesk.zendesk.com/hc/en-us/articles/4412946533903-What-is-delegation-Is-it-the-same-as-staking-"
            target="_blank"
            rel="noreferrer noopener"
          >
            {intl.formatMessage(globalMessages.learnMore)}
          </Link>
          <Button
            variant="primary"
            size="small"
            onClick={() => onDelegateClick(id)}
            disabled={isWalletWithNoFunds}
          >
            {intl.formatMessage(globalMessages.delegateLabel)}
          </Button>
        </Box>
      </Box>
      <CloseBtn onClick={onClose}>
        <CloseIcon />
      </CloseBtn>
    </WrapperBanner>
  ) : null;
}

export default (injectIntl(observer(WalletDelegationBanner)): ComponentType<Props>);

const WrapperBanner = styled(Box)({
  position: 'relative',
  marginBottom: '40px',
  display: 'flex',
  alignItems: 'start',
  justifyContent: 'space-between',
  padding: '24px',
  borderRadius: '8px',
  overflowY: 'hidden',
});

const CloseBtn = styled(IconButton)({
  position: 'absolute',
  top: 32,
  right: 24,
  padding: '3px',
  color: 'var(--yoroi-palette-common-white)',
});

const AvatarWrapper = styled(Box)({
  width: '24px',
  height: '24px',
  minWidth: '24px',
  marginRight: '12px',
  borderRadius: '20px',
  border: '1px solid rgba(111, 114, 144, 0.24)',
  overflow: 'hidden',
});

const AvatarImg = styled('img')({
  width: '100%',
  background: 'white',
  objectFit: 'scale-down',
});
