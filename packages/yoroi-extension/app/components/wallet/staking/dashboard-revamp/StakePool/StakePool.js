// @flow
import type { Node } from 'react';
import {
  ReactComponent as TwitterIconRevamp
} from '../../../../../assets/images/social/revamp/twitter-24x24.inline.svg';
import {
  ReactComponent as TelegramIconRevamp
} from '../../../../../assets/images/social/revamp/telegram-24x24.inline.svg';
import { ReactComponent as FbIconRevamp } from '../../../../../assets/images/social/revamp/facebook-24x24.inline.svg';
import {
  ReactComponent as YoutubeIconRevamp
} from '../../../../../assets/images/social/revamp/youtube-24x24.inline.svg';
import { ReactComponent as TwitchIconRevamp } from '../../../../../assets/images/social/revamp/twitch-24x24.inline.svg';
import {
  ReactComponent as DiscordIconRevamp
} from '../../../../../assets/images/social/revamp/discord-24x24.inline.svg';
import { ReactComponent as GithubIconRevamp } from '../../../../../assets/images/social/revamp/github-24x24.inline.svg';
import {
  ReactComponent as PersonalIconRevamp
} from '../../../../../assets/images/social/revamp/personal-site-24x24.inline.svg';
import { List, StyledLink } from './StakePool.styles';
import { styled, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { ReactComponent as InfoIconRevamp } from '../../../../../assets/images/info-icon-revamp.inline.svg';
import type { SocialLinks } from '../../../../../containers/wallet/staking/SeizaFetcher';

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

export const SocialMediaStakePool = ({ socialLinks, websiteUrl, color }: Props): Node => {
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
          <TwitterIconRevamp/>
        </SocialExternalLink>
      ) : null}
      {telegram != null ? (
        <SocialExternalLink href={`https://t.me/${telegram}`}>
          <TelegramIconRevamp/>
        </SocialExternalLink>
      ) : null}
      {facebook != null ? (
        <SocialExternalLink href={`https://fb.me/${facebook}`}>
          <FbIconRevamp/>
        </SocialExternalLink>
      ) : null}
      {youtube != null ? (
        <SocialExternalLink href={`https://youtube.com/${youtube}`}>
          <YoutubeIconRevamp/>
        </SocialExternalLink>
      ) : null}
      {twitch != null ? (
        <SocialExternalLink href={`https://twitch.com/${twitch}`}>
          <TwitchIconRevamp/>
        </SocialExternalLink>
      ) : null}
      {discord != null ? (
        <SocialExternalLink href={`https://discord.gg/${discord}`}>
          <DiscordIconRevamp/>
        </SocialExternalLink>
      ) : null}
      {github != null ? (
        <SocialExternalLink href={`https://github.com/${github}`}>
          <GithubIconRevamp/>
        </SocialExternalLink>
      ) : null}
      {websiteUrl != null ? (
        <SocialExternalLink href={websiteUrl}><PersonalIconRevamp/></SocialExternalLink>
      ) : null}
    </List>
  );
};

type HelperTooltipProps = {|
  +message: string | Node,
  +placement?: string,
|};

export const HelperTooltip = ({ message, placement }: HelperTooltipProps): Node => {
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
      <IconWrapper display="inline-flex"><InfoIconRevamp/></IconWrapper>
    </Tooltip>
  );
};

HelperTooltip.defaultProps = {
  placement: 'right',
};

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));
