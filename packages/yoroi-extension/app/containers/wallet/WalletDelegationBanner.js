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
import { toSvg } from 'jdenticon';

import DiscordIcon from '../../assets/images/social/revamp/discord.inline.svg';
import FbIcon from '../../assets/images/social/revamp/facebook.inline.svg';
import GithubIcon from '../../assets/images/social/revamp/github.inline.svg';
import PersonalIcon from '../../assets/images/social/revamp/personal.inline.svg';
import TelegramIcon from '../../assets/images/social/revamp/telegram.inline.svg';
import TwitchIcon from '../../assets/images/social/revamp/twitch.inline.svg';
import TwitterIcon from '../../assets/images/social/revamp/twitter.inline.svg';
import YoutubeIcon from '../../assets/images/social/revamp/youtube.inline.svg';

type Props = {|
  +isOpen: boolean,
  +onClose: void => void,
  +isWalletWithNoFunds: boolean,
  +poolInfo: Object,
  +onDelegateClick: (string) => Promise<void>,
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
  isWalletWithNoFunds,
  onDelegateClick,
  intl,
  ticker,
  poolInfo = {},
}: Props & Intl): Node {
  const {
    id,
    name,
    avatar,
    websiteUrl,
    roa: estimatedRoa30d,
    firstReward = 'in 3-4 epochs',
    socialLinks = {},
  } = poolInfo || {};

  const avatarSource = toSvg(id, 36, { padding: 0 });
  const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;
  const twitter = socialLinks.tw;
  const telegram = socialLinks.tg;
  const facebook = socialLinks.fb;
  const youtube = socialLinks.yt;
  const twitch = socialLinks.tc;
  const discord = socialLinks.di;
  const github = socialLinks.gh;

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
          <Box sx={{ display: 'flex' }}>
            <AvatarWrapper>
              {avatar ? (
                <AvatarImg src={avatar} alt={name} />
              ) : (
                <AvatarImg src={avatarGenerated} alt={name} />
              )}
            </AvatarWrapper>
            <Typography color="var(--yoroi-palette-common-white)" variant="body1">
              {name}
            </Typography>
          </Box>
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
          <Box display="flex">
            <Typography variant="body1">Stake pool social media</Typography>
            <SocialList>
              {twitter ? (
                <a
                  href={`https://twitter.com/${twitter}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <TwitterIcon />
                </a>
              ) : null}
              {telegram ? (
                <a href={`https://t.me/${telegram}`} target="_blank" rel="noreferrer noopener">
                  <TelegramIcon />{' '}
                </a>
              ) : null}
              {facebook ? (
                <a href={`https://fb.me/${facebook}`} target="_blank" rel="noreferrer noopener">
                  <FbIcon />
                </a>
              ) : null}
              {youtube ? (
                <a
                  href={`https://youtube.com/${youtube}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <YoutubeIcon />
                </a>
              ) : null}
              {twitch ? (
                <a href={`https://twitch.com/${twitch}`} target="_blank" rel="noreferrer noopener">
                  <TwitchIcon />
                </a>
              ) : null}
              {discord ? (
                <a href={`https://discord.gg/${discord}`} target="_blank" rel="noreferrer noopener">
                  <DiscordIcon />
                </a>
              ) : null}
              {github ? (
                <a href={`https://github.com/${github}`} target="_blank" rel="noreferrer noopener">
                  <GithubIcon />
                </a>
              ) : null}
              {websiteUrl ? (
                <a href={websiteUrl} target="_blank" rel="noreferrer noopener">
                  <PersonalIcon />
                </a>
              ) : null}
            </SocialList>
          </Box>
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
          onClick={() => onDelegateClick(id)}
          disabled={isWalletWithNoFunds}
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
  padding: '32px',
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

const SocialList = styled(Box)({
  display: 'flex',
  marginLeft: '8px',
  a: {
    color: 'white',
    opacity: 0.5,
    marginRight: '3px',
    width: '24px',
    svg: {
      transform: 'scale(0.8)',
    },
  },
});
