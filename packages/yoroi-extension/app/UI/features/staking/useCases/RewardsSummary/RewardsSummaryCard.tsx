import { ReactNode } from 'react';
import { Box, styled } from '@mui/system';
import { Divider, Typography } from '@mui/material';
import RewardHistoryGraph from './RewardHistoryGraph';
import LoadingSpinner from '../../../../../components/widgets/LoadingSpinner';
import { WithdrawButton } from './WithdrawButton';
import { useStrings } from '../../common/hooks/useStrings';
import { maybe, useStaking } from '../../module/StakingContextProvider';
import { HIDDEN_AMOUNT } from '../../../../common/constants';
import { truncateToken } from '../../../../../utils/formatters';
import { Icon } from '../../../../components';

const StakingIconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& rect': {
      fill: theme.palette.ds.primary_100,
    },
    '& path': {
      fill: theme.palette.ds.primary_600,
    },
  },
}));

const TotalDelegatedIconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& rect': {
      fill: theme.palette.ds.secondary_100,
    },
    '& path': {
      fill: theme.palette.ds.secondary_600,
    },
  },
}));

const Card = styled(Box)({
  borderRadius: '8px',
  width: '100%',
});

const InfoRow = styled(Box)({
  width: '100%',
  padding: 24,
  margin: '0',
  display: 'flex',
  flexFlow: 'column',
  borderStyle: 'solid',
  borderBottomWidth: '1px',
  gap: 8,
  '&:not(:first-child)': {
    borderLeftWidth: '1px',
  },
});

const InfoDetails = styled(Box)({});

export const RewardsSummaryCard: React.FC = () => {
  const strings = useStrings();
  const { getTokenInfo, totalRewards, totalDelegated, shouldHideBalance, historyGraphData, toUnitOfAccount } = useStaking();

  const formatTokenEntry = (tokenEntry): ReactNode => {
    const tokenInfo = getTokenInfo(tokenEntry);
    const decimals = tokenInfo.Metadata.numberOfDecimals;

    const splitAmount = tokenEntry.amount.shiftedBy(-decimals).toFormat(decimals).split('.');

    const integerPart = splitAmount[0];
    const fractionalPart = splitAmount[1] ?? '0';

    const amountNode = shouldHideBalance ? (
      <>{HIDDEN_AMOUNT}</>
    ) : (
      <>
        {integerPart}
        <span>.{fractionalPart} </span>
      </>
    );

    return (
      <>
        <span>{amountNode} </span>
        {truncateToken(tokenInfo?.assetName || '', 12)}
      </>
    );
  };

  const renderAmount = (token?: any | null): ReactNode | null => {
    return maybe(token, t => formatTokenEntry(t.getDefaultEntry()));
  };

  const renderAmountWithUnitOfAccount = (token?: any | null): ReactNode | null => {
    const unitOfAccountCalculated = maybe(token, t => toUnitOfAccount(t.getDefaultEntry()));
    return maybe(unitOfAccountCalculated, u =>
      u && typeof u !== 'undefined' && 'amount' in u ? `${shouldHideBalance ? HIDDEN_AMOUNT : u.amount} ${u.currency}` : null
    );
  };

  const hasNoRewards = token => maybe(token, t => t.getDefaultEntry()?.amount?.isZero?.()) ?? false;

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'grayscale.200',
        bgcolor: 'ds.bg_color_max',
      }}
    >
      <Box
        sx={{
          pr: '8px',
          pl: '24px',
          py: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography component="div" variant="h5" color="ds.text_gray_medium" fontWeight={500}>
          {strings.rewardsSummary}
        </Typography>

        <WithdrawButton isDisabled={hasNoRewards(totalRewards)} />
      </Box>

      <Divider sx={{ borderColor: 'ds.gray_200' }} />

      <Box sx={{ display: 'flex' }}>
        <InfoRow sx={{ borderColor: 'ds.gray_200' }}>
          <StakingIconWrapper>
            <Icon.StakingActive />
          </StakingIconWrapper>

          <InfoDetails>
            <Typography variant="caption" color="ds.gray_600" sx={{ textTransform: 'uppercase' }}>
              {strings.totalRewardsLabel}
            </Typography>
          </InfoDetails>

          <InfoDetails>
            <Typography variant="h2" color="ds.text_gray_medium" fontWeight={500}>
              {totalRewards ? renderAmount(totalRewards) : <LoadingSpinner small />}
            </Typography>
            <Typography variant="body1" color="ds.gray_600" fontWeight={500}></Typography>
          </InfoDetails>
        </InfoRow>

        <InfoRow sx={{ borderColor: 'ds.gray_200' }}>
          <TotalDelegatedIconWrapper>
            <Icon.TotalDelegated />
          </TotalDelegatedIconWrapper>

          <InfoDetails>
            <Typography variant="caption" color="ds.gray_600" marginBottom="4px" sx={{ textTransform: 'uppercase' }}>
              {strings.totalDelegated}
            </Typography>
          </InfoDetails>

          <InfoDetails>
            {totalDelegated ? (
              <Typography variant="h2" fontWeight={500} color="ds.text_gray_medium">
                {renderAmount(totalDelegated)}
              </Typography>
            ) : (
              <div>
                <LoadingSpinner small />
              </div>
            )}
            {totalDelegated && (
              <Typography variant="body1" color="ds.gray_600" fontWeight={500}>
                {renderAmountWithUnitOfAccount(totalDelegated)}
              </Typography>
            )}
          </InfoDetails>
        </InfoRow>
      </Box>

      {historyGraphData && <RewardHistoryGraph graphData={historyGraphData} />}
    </Card>
  );
};
