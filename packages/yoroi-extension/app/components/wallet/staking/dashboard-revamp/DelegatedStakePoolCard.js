// @flow
import type { ComponentType, Node } from 'react';
import { Box, styled } from '@mui/system';
import { Stack, Typography, useTheme } from '@mui/material';
import { injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { SocialMediaStakePool } from './StakePool/StakePool';
import type { PoolData } from '../../../../containers/wallet/staking/SeizaFetcher';
import { getAvatarFromPoolId } from '../utils';
import type { PoolTransition } from '../../../../stores/toplevel/DelegationStore';
import { UndelegateButton } from './UndelegateButton';
import { truncateAddress } from '../../../../utils/formatters';
import { poolIdHexToBech32 } from '../../../../api/ada/lib/cardanoCrypto/utils';

type Props = {|
  delegatedPool: PoolData,
    poolTransition: ?PoolTransition,
      delegateToSpecificPool: (id: ?string) => void,
        stores: any,
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function DelegatedStakePoolCard({ delegatedPool, intl, poolTransition, delegateToSpecificPool, stores }: Props & Intl): Node {
  const { id, name, ticker, poolSize, share, avatar, roa, socialLinks, websiteUrl } = delegatedPool || {};
  const theme = useTheme();
  const avatarGenerated = getAvatarFromPoolId(id);

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'grayscale.200',
        bgcolor: 'ds.bg_color_max',
        paddingBottom: '24px',
      }}
    >
      <Stack direction="row" px={4} py={2} alignItems="center">
        <Typography component="div" variant="h5" color={theme.palette.ds.text_gray_medium} fontWeight={500}>
          {intl.formatMessage(globalMessages.stakePoolDelegated)}
        </Typography>
        <UndelegateButton
          poolId={id}
          poolName={name}
          poolTransition={poolTransition}
          intl={intl}
          delegateToSpecificPool={delegateToSpecificPool}
          stores={stores}
        />
      </Stack>
      <Box
        sx={{
          borderBottom: '1px solid',
          borderBottomColor: 'grayscale.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      />
      <Wrapper sx={{ paddingBottom: 0 }}>
        <AvatarWrapper>
          {avatar != null ? (
            <AvatarImg src={avatar} alt="stake pool logo" />
          ) : (
            <AvatarImg src={avatarGenerated} alt="stake pool logo" />
          )}
        </AvatarWrapper>
        <Box marginLeft="16px" sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Typography component="div" color={theme.palette.ds.text_gray_medium} variant="body1" fontWeight="medium" mb="3px">
            {ticker != null ? `[${ticker}]` : ''} {name ?? truncateAddress(poolIdHexToBech32(id))}
          </Typography>
          <SocialMediaStakePool color="grayscale.500" websiteUrl={websiteUrl} socialLinks={socialLinks} />
          <br/>
        </Box>
      </Wrapper>
      <Wrapper justifyContent="space-between" sx={{ paddingBottom: '25px' }}>
        {roa != null ? (
          <Box sx={{ display: 'flex', flexFlow: 'column' }}>
            <Typography
              component="div"
              variant="caption1"
              color={theme.palette.ds.text_gray_low}
              sx={{ textTransform: 'uppercase' }}
            >
              {intl.formatMessage(globalMessages.roa30d)}
            </Typography>
            <Typography as="span" fontWeight={500} color={theme.palette.ds.text_gray_medium} variant="h2">
              {roa} %
            </Typography>
          </Box>
        ) : null}
        {poolSize != null && (
          <Box sx={{ display: 'flex', flexFlow: 'column' }}>
            <Typography
              component="div"
              variant="caption1"
              color={theme.palette.ds.text_gray_low}
              sx={{ textTransform: 'uppercase' }}
            >
              {intl.formatMessage(globalMessages.poolSize)}
            </Typography>
            <Typography as="span" fontWeight={500} color={theme.palette.ds.text_gray_medium} variant="h2">
              {poolSize}
            </Typography>
          </Box>
        )}
        {share != null && (
          <Box sx={{ display: 'flex', flexFlow: 'column' }}>
            <Typography
              component="div"
              variant="caption1"
              color={theme.palette.ds.text_gray_low}
              sx={{ textTransform: 'uppercase' }}
            >
              {intl.formatMessage(globalMessages.poolSaturation)}
            </Typography>
            <Typography as="span" fontWeight={500} color={theme.palette.ds.text_gray_medium} variant="h2">
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
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
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

const AvatarImg = styled('img')(({ theme }) => ({
  width: '100%',
  background: theme.palette.ds.primary_100,
  objectFit: 'scale-down',
}));
