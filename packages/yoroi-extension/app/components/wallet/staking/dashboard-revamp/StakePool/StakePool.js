// @flow
import type { ComponentType, Node } from 'react';
import { ReactComponent as TwitterIcon } from '../../../../../assets/images/social/revamp/twitter.inline.svg';
import { ReactComponent as TwitterIconRevamp } from '../../../../../assets/images/social/revamp/twitter-24x24.inline.svg';
import { ReactComponent as TelegramIcon } from '../../../../../assets/images/social/revamp/telegram.inline.svg';
import { ReactComponent as TelegramIconRevamp } from '../../../../../assets/images/social/revamp/telegram-24x24.inline.svg';
import { ReactComponent as FbIcon } from '../../../../../assets/images/social/revamp/facebook.inline.svg';
import { ReactComponent as FbIconRevamp } from '../../../../../assets/images/social/revamp/facebook-24x24.inline.svg';
import { ReactComponent as YoutubeIcon } from '../../../../../assets/images/social/revamp/youtube.inline.svg';
import { ReactComponent as YoutubeIconRevamp } from '../../../../../assets/images/social/revamp/youtube-24x24.inline.svg';
import { ReactComponent as TwitchIcon } from '../../../../../assets/images/social/revamp/twitch.inline.svg';
import { ReactComponent as TwitchIconRevamp } from '../../../../../assets/images/social/revamp/twitch-24x24.inline.svg';
import { ReactComponent as DiscordIcon } from '../../../../../assets/images/social/revamp/discord.inline.svg';
import { ReactComponent as DiscordIconRevamp } from '../../../../../assets/images/social/revamp/discord-24x24.inline.svg';
import { ReactComponent as GithubIcon } from '../../../../../assets/images/social/revamp/github.inline.svg';
import { ReactComponent as GithubIconRevamp } from '../../../../../assets/images/social/revamp/github-24x24.inline.svg';
import { ReactComponent as PersonalIcon } from '../../../../../assets/images/social/revamp/personal.inline.svg';
import { ReactComponent as PersonalIconRevamp } from '../../../../../assets/images/social/revamp/personal-site-24x24.inline.svg';
import { List, StyledLink } from './StakePool.styles';
import { Tooltip, Typography, styled } from '@mui/material';
import { Box } from '@mui/system';
import { ReactComponent as QuestionMarkIcon } from '../../../../../assets/images/question-mark.inline.svg';
import { ReactComponent as InfoIconRevamp } from '../../../../../assets/images/info-icon-revamp.inline.svg';
import type { SocialLinks } from '../../../../../containers/wallet/staking/SeizaFetcher';
import { withLayout } from '../../../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../../../../styles/context/layout';

// eslint-disable-next-line react/require-default-props
type Props = {| socialLinks?: SocialLinks, websiteUrl?: string, +color: string |};

const SocialExternalLink = ({ href, children }: {| href: string, children: Node |}): Node => (
  <StyledLink
    href={href}
    target="_blank"
    rel="noreferrer noopener"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </StyledLink>
);

const StakingPoolSocialMedia = ({ socialLinks, websiteUrl, color, isRevampLayout }: Props & InjectedLayoutProps): Node => {
  const twitter = socialLinks?.tw;
  const telegram = socialLinks?.tg;
  const facebook = socialLinks?.fb;
  const youtube = socialLinks?.yt;
  const twitch = socialLinks?.tc;
  const discord = socialLinks?.di;
  const github = socialLinks?.gh;

  return (
    <List color={color}>
      {twitter != null ? (
        <SocialExternalLink href={`https://twitter.com/${twitter}`}>
          {isRevampLayout ? <TwitterIconRevamp /> : <TwitterIcon />}
        </SocialExternalLink>
      ) : null}
      {telegram != null ? (
        <SocialExternalLink href={`https://t.me/${telegram}`}>
          {isRevampLayout ? <TelegramIconRevamp /> : <TelegramIcon />}
        </SocialExternalLink>
      ) : null}
      {facebook != null ? (
        <SocialExternalLink href={`https://fb.me/${facebook}`}>
          {isRevampLayout ? <FbIconRevamp /> : <FbIcon />}
        </SocialExternalLink>
      ) : null}
      {youtube != null ? (
        <SocialExternalLink href={`https://youtube.com/${youtube}`}>
          {isRevampLayout ? <YoutubeIconRevamp /> : <YoutubeIcon />}
        </SocialExternalLink>
      ) : null}
      {twitch != null ? (
        <SocialExternalLink href={`https://twitch.com/${twitch}`}>
          {isRevampLayout ? <TwitchIconRevamp /> : <TwitchIcon />}
        </SocialExternalLink>
      ) : null}
      {discord != null ? (
        <SocialExternalLink href={`https://discord.gg/${discord}`}>
          {isRevampLayout ? <DiscordIconRevamp /> : <DiscordIcon />}
        </SocialExternalLink>
      ) : null}
      {github != null ? (
        <SocialExternalLink href={`https://github.com/${github}`}>
          {isRevampLayout ? <GithubIconRevamp /> : <GithubIcon />}
        </SocialExternalLink>
      ) : null}
      {websiteUrl != null ? (
        <SocialExternalLink href={websiteUrl}>{isRevampLayout ? <PersonalIconRevamp /> : <PersonalIcon />}</SocialExternalLink>
      ) : null}
    </List>
  );
};

export const SocialMediaStakePool = (withLayout(StakingPoolSocialMedia): ComponentType<Props>);

type HelperTooltipProps = {|
  +message: string | Node,
  +placement?: string,
|};
const HelperTooltipComp = ({ message, isRevampLayout, placement }: HelperTooltipProps & InjectedLayoutProps): Node => {
  return (
    <Tooltip
      title={
        <Typography component="div" variant="body2">
          {message}
        </Typography>
      }
      arrow
      placement={placement || 'right'}
    >
      <IconWrapper display="inline-flex">{isRevampLayout ? <InfoIconRevamp /> : <QuestionMarkIcon />}</IconWrapper>
    </Tooltip>
  );
};

HelperTooltipComp.defaultProps = {
  placement: 'right',
};

export const HelperTooltip = (withLayout(HelperTooltipComp): ComponentType<HelperTooltipProps>);

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_normal,
    },
  },
}));
