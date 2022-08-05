// @flow
import type { ComponentType, Node } from 'react';
import { Box, styled } from '@mui/system';
import { Button, Typography } from '@mui/material';
import { injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { HelperTooltip, SocialMediaStakePool } from './StakePool/StakePool';
import type { PoolData } from '../../../../containers/wallet/staking/SeizaFetcher';
import { getAvatarFromPoolId } from '../utils';

type Props = {|
  delegatedPool: PoolData,
  +undelegate: void | (void => Promise<void>),
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function DelegatedStakePoolCard({ delegatedPool, undelegate, intl }: Props & Intl): Node {
  const { id, name, ticker, poolSize, share, avatar, roa, socialLinks, websiteUrl } =
    delegatedPool || {};
  const avatarGenerated = getAvatarFromPoolId(id);

  return (
    <Card>
      <Box
        sx={{
          padding: '15px 24px',
          borderBottom: '1px solid var(--yoroi-palette-gray-200)',
        }}
      >
        <Typography variant="h5" color="var(--yoroi-palette-gray-900)">
          {intl.formatMessage(globalMessages.stakePoolDelegated)}
        </Typography>
      </Box>
      <Wrapper>
        <AvatarWrapper>
          {avatar != null ? (
            <AvatarImg src={avatar} alt="stake pool logo" />
          ) : (
            <AvatarImg src={avatarGenerated} alt="stake pool logo" />
          )}
        </AvatarWrapper>
        <Box marginLeft="16px" sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Typography color="black" variant="body1" fontWeight="medium" mb="3px">
            {`[${ticker}]`} {name}
          </Typography>
          <SocialMediaStakePool
            color="var(--yoroi-palette-gray-500)"
            websiteUrl={websiteUrl}
            socialLinks={socialLinks}
          />
        </Box>
      </Wrapper>
      <Wrapper justifyContent="space-between">
        {roa != null ? (
          <Box sx={{ display: 'flex', flexFlow: 'column' }}>
            <Typography variant="caption" fontWeight="500" color="var(--yoroi-palette-gray-500)">
              {intl.formatMessage(globalMessages.roa30d)}
            </Typography>
            <Typography as="span" color="black" variant="h2">
              {roa} %
            </Typography>
          </Box>
        ) : null}
        {poolSize && (
          <Box sx={{ display: 'flex', flexFlow: 'column' }}>
            <Typography variant="caption" fontWeight="500" color="var(--yoroi-palette-gray-500)">
              Pool Size
            </Typography>
            <Typography as="span" color="black" variant="h2">
              {poolSize}
            </Typography>
          </Box>
        )}
        {share && (
          <Box sx={{ display: 'flex', flexFlow: 'column' }}>
            <Typography variant="caption" fontWeight="500" color="var(--yoroi-palette-gray-500)">
              Share
            </Typography>
            <Typography as="span" color="black" variant="h2">
              {share} %
            </Typography>
          </Box>
        )}
      </Wrapper>
      <Wrapper>
        <UndelegateButton
          sx={{ border: '2px solid #17D1AA', width: '50%' }}
          color="secondary"
          onClick={undelegate}
        >
          {intl.formatMessage(globalMessages.undelegateLabel)}
        </UndelegateButton>
      </Wrapper>
    </Card>
  );
}
export default (injectIntl(observer(DelegatedStakePoolCard)): ComponentType<Props>);

const Card = styled(Box)({
  backgroundColor: 'var(--yoroi-palette-common-white)',
  borderRadius: '8px',
  flex: '1 1 100%',
  display: 'flex',
  flexDirection: 'column',
});

const Wrapper: any = styled(Box)({
  display: 'flex',
  padding: 24,
});

const AvatarWrapper: any = styled(Box)({
  width: '40px',
  height: '40px',
  minWidth: '40px',
  marginRight: '12px',
  borderRadius: '20px',
  overflow: 'hidden',
});
const AvatarImg: any = styled('img')({
  width: '100%',
  background: 'white',
  objectFit: 'scale-down',
});
const UndelegateButton: any = styled(Button)({
  minWidth: 'auto',
  width: 'unset',
  marginLeft: 'auto',
});
