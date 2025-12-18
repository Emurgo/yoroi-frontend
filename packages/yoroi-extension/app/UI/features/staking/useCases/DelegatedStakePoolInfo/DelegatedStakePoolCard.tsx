import React from 'react';
import { Box, Divider, Stack, styled, Typography } from '@mui/material';
import { getAvatarFromPoolId } from '../../common/helpers';
import { PoolData, PoolTransition } from '../../common/types';
import { useStrings } from '../../common/hooks/useStrings';
import { poolIdHexToBech32, useStaking } from '../../module/StakingContextProvider';
import { truncateAddress } from '../../../../../utils/formatters';
import { UndelegateButton } from './UndelegateButton';

export type DelegatedStakePoolCardProps = {
  delegatedPool: PoolData;
  poolTransition?: PoolTransition | null;
  delegateToSpecificPool: (id: string | null) => void;
};

const DelegatedStakePoolCard: React.FC<DelegatedStakePoolCardProps> = ({
  delegatedPool,
  poolTransition,
  delegateToSpecificPool,
}) => {
  const strings = useStrings();
  const { defaultDelegatedAsset } = useStaking();

  const { id, name, ticker, poolSize, share, avatar, roa, socialLinks, websiteUrl } = delegatedPool || ({} as PoolData);

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
      <Stack direction="row" pl={24} pr={8} py={10} alignItems="center">
        <Typography component="div" variant="h5" color="ds.text_gray_medium" fontWeight={500}>
          {strings.stakePoolDelegated}
        </Typography>

        <UndelegateButton
          poolId={id}
          poolName={name}
          poolTransition={poolTransition}
          delegateToSpecificPool={delegateToSpecificPool}
          socialMediaInfo={{ socialLinks, websiteUrl }}
        />
      </Stack>

      <Divider sx={{ borderColor: 'ds.gray_200' }} />

      <Wrapper sx={{ paddingBottom: 0 }}>
        <AvatarWrapper>
          <AvatarImg src={avatar ?? avatarGenerated} alt="stake pool logo" />
        </AvatarWrapper>

        <Box marginLeft="16px" sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Typography component="div" color="ds.text_primary_medium" variant="body1" fontWeight="medium" mb="3px">
            {ticker != null ? `[${ticker}]` : ''} {name && name !== '' ? name : truncateAddress(poolIdHexToBech32(id))}
          </Typography>
        </Box>
      </Wrapper>

      <Wrapper justifyContent="space-between" sx={{ paddingBottom: '25px' }}>
        {roa != null && (
          <Box sx={{ display: 'flex', flexFlow: 'column' }}>
            <Typography variant="caption" color="ds.text_gray_low" sx={{ textTransform: 'uppercase' }}>
              {strings.roa30dLabel}
            </Typography>
            <Typography fontWeight={500} color="ds.text_gray_medium" variant="h2">
              {roa} %
            </Typography>
          </Box>
        )}

        {poolSize != null && (
          <Box sx={{ display: 'flex', flexFlow: 'column' }}>
            <Typography variant="caption" color="ds.text_gray_low" sx={{ textTransform: 'uppercase' }}>
              {strings.poolSizeLabel}
            </Typography>
            <Typography fontWeight={500} color="ds.text_gray_medium" variant="h2">
              {poolSize} {defaultDelegatedAsset.Metadata.ticker}
            </Typography>
          </Box>
        )}

        {share != null && (
          <Box sx={{ display: 'flex', flexFlow: 'column' }}>
            <Typography variant="caption" color="ds.text_gray_low" sx={{ textTransform: 'uppercase' }}>
              {strings.poolSaturation}
            </Typography>
            <Typography fontWeight={500} color="ds.text_gray_medium" variant="h2">
              {share} %
            </Typography>
          </Box>
        )}
      </Wrapper>
    </Card>
  );
};

export default DelegatedStakePoolCard;

const Card = styled(Box)({
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
});

const Wrapper = styled(Box)({
  display: 'flex',
  padding: 24,
});

const AvatarWrapper = styled(Box)({
  width: '40px',
  height: '40px',
  minWidth: '40px',
  marginRight: '12px',
  borderRadius: '20px',
  overflow: 'hidden',
});

const AvatarImg = styled('img')(({ theme }: any) => ({
  width: '100%',
  background: theme.palette.ds.primary_100,
  objectFit: 'scale-down',
}));
