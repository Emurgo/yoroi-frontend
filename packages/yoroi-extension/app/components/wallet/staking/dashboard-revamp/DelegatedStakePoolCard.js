// @flow
import type { ComponentType, Node } from 'react';
import { Box, styled } from '@mui/system';
import { Button, Typography } from '@mui/material';
import { injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { SocialMediaStakePool } from './StakePool/StakePool';
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
    <Card sx={{ border: '1px solid', borderColor: 'ds.gray_c200', bgcolor: 'background.card' }}>
      <Box
        sx={{
          padding: '16px 9px 16px 24px',
          borderBottom: '1px solid',
          borderBottomColor: 'ds.gray_c200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography component="div" variant="h5" color="ds.black_static" fontWeight={500}>
          {intl.formatMessage(globalMessages.stakePoolDelegated)}
        </Typography>
        <UndelegateButton
          variant="text"
          onClick={undelegate}
          disabled={!undelegate}
          sx={{
            lineHeight: '21px',
            '&.MuiButton-sizeMedium': {
              height: 'unset',
              p: '9px 15px',
            },
          }}
        >
          {intl.formatMessage(globalMessages.undelegateLabel)}
        </UndelegateButton>
      </Box>
      <Wrapper sx={{ paddingBottom: 0 }}>
        <AvatarWrapper>
          {avatar != null ? (
            <AvatarImg src={avatar} alt="stake pool logo" />
          ) : (
            <AvatarImg src={avatarGenerated} alt="stake pool logo" />
          )}
        </AvatarWrapper>
        <Box marginLeft="16px" sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Typography component="div" color="ds.gray_cmax" variant="body1" fontWeight="medium" mb="3px">
            {ticker !== undefined ? `[${ticker}]` : ''} {name}
          </Typography>
          <SocialMediaStakePool
            color="ds.gray_c500"
            websiteUrl={websiteUrl}
            socialLinks={socialLinks}
          />
        </Box>
      </Wrapper>
      <Wrapper justifyContent="space-between" sx={{ paddingBottom: 0 }}>
        {roa != null ? (
          <Box sx={{ display: 'flex', flexFlow: 'column' }}>
            <Typography component="div"
              variant="caption1"
              color="ds.gray_c500"
              sx={{ textTransform: 'uppercase' }}
            >
              {intl.formatMessage(globalMessages.roa30d)}
            </Typography>
            <Typography as="span" fontWeight={500} color="ds.gray_cmax" variant="h2">
              {roa} %
            </Typography>
          </Box>
        ) : null}
        {poolSize != null && (
          <Box sx={{ display: 'flex', flexFlow: 'column' }}>
            <Typography component="div"
              variant="caption1"
              color="ds.gray_c500"
              sx={{ textTransform: 'uppercase' }}
            >
              {intl.formatMessage(globalMessages.poolSize)}
            </Typography>
            <Typography as="span" fontWeight={500} color="ds.gray_cmax" variant="h2">
              {poolSize}
            </Typography>
          </Box>
        )}
        {share != null && (
          <Box sx={{ display: 'flex', flexFlow: 'column' }}>
            <Typography component="div"
              variant="caption1"
              color="ds.gray_c500"
              sx={{ textTransform: 'uppercase' }}
            >
              {intl.formatMessage(globalMessages.poolSaturation)}
            </Typography>
            <Typography as="span" fontWeight={500} color="ds.gray_cmax" variant="h2">
              {share} %
            </Typography>
          </Box>
        )}
      </Wrapper>
    </Card>
  );
}
export default (injectIntl(observer(DelegatedStakePoolCard)): ComponentType<Props>);

const Card = styled(Box)({
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
