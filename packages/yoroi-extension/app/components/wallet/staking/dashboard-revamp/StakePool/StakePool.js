// @flow
import type { Node } from 'react';
import { ReactComponent as TwitterIcon }  from '../../../../../assets/images/social/revamp/twitter.inline.svg';
import { ReactComponent as TelegramIcon }  from '../../../../../assets/images/social/revamp/telegram.inline.svg';
import { ReactComponent as FbIcon }  from '../../../../../assets/images/social/revamp/facebook.inline.svg';
import { ReactComponent as YoutubeIcon }  from '../../../../../assets/images/social/revamp/youtube.inline.svg';
import { ReactComponent as TwitchIcon }  from '../../../../../assets/images/social/revamp/twitch.inline.svg';
import { ReactComponent as DiscordIcon }  from '../../../../../assets/images/social/revamp/discord.inline.svg';
import { ReactComponent as GithubIcon }  from '../../../../../assets/images/social/revamp/github.inline.svg';
import { ReactComponent as PersonalIcon }  from '../../../../../assets/images/social/revamp/personal.inline.svg';
import { List, StyledLink } from './StakePool.styles';
import { Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { ReactComponent as QuestionMarkIcon }  from '../../../../../assets/images/question-mark.inline.svg';
import type { SocialLinks } from '../../../../../containers/wallet/staking/SeizaFetcher';

// eslint-disable-next-line react/require-default-props
type Props = {| socialLinks?: SocialLinks, websiteUrl?: string, +color: string |};

const SocialExternalLink = ({ href, children }: {| href: string, children: Node |}): Node => (
  <StyledLink href={href} target="_blank" rel="noreferrer noopener">
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
          <TwitterIcon />
        </SocialExternalLink>
      ) : null}
      {telegram != null ? (
        <SocialExternalLink href={`https://t.me/${telegram}`}>
          <TelegramIcon />{' '}
        </SocialExternalLink>
      ) : null}
      {facebook != null ? (
        <SocialExternalLink href={`https://fb.me/${facebook}`}>
          <FbIcon />
        </SocialExternalLink>
      ) : null}
      {youtube != null ? (
        <SocialExternalLink href={`https://youtube.com/${youtube}`}>
          <YoutubeIcon />
        </SocialExternalLink>
      ) : null}
      {twitch != null ? (
        <SocialExternalLink href={`https://twitch.com/${twitch}`}>
          <TwitchIcon />
        </SocialExternalLink>
      ) : null}
      {discord != null ? (
        <SocialExternalLink href={`https://discord.gg/${discord}`}>
          <DiscordIcon />
        </SocialExternalLink>
      ) : null}
      {github != null ? (
        <SocialExternalLink href={`https://github.com/${github}`}>
          <GithubIcon />
        </SocialExternalLink>
      ) : null}
      {websiteUrl != null ? (
        <SocialExternalLink href={websiteUrl}>
          <PersonalIcon />
        </SocialExternalLink>
      ) : null}
    </List>
  );
};

type HelperTooltipProps = {|
  +message: string,
|};
export const HelperTooltip = ({ message }: HelperTooltipProps): Node => {
  return (
    <Tooltip title={<Typography variant="body2">{message}</Typography>} arrow placement="right">
      <Box display="inline-flex">
        <QuestionMarkIcon />
      </Box>
    </Tooltip>
  );
};
