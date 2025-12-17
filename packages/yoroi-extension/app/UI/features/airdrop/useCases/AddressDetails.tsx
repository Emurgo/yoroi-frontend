import { Box, Chip as MuiChip, Stack, Typography, useTheme } from '@mui/material';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { type Schedule, formatNumber } from '../../../../api/ada/midnightRedemption';
import { Collapsible } from '../../../components/Collapsible/Collapsible';
import CopyableText from '../../../components/CopyableText';

const messages = defineMessages({
  details: {
    id: 'aidrop.addrDetail.detailsLabel',
    defaultMessage: '!!!More Midnight airdrop details',
  },
  currentThaw: {
    id: 'airdrop.schedule.currentThaw',
    defaultMessage: '!!!Current thaw: {current}/{total}',
  },
  thawTitle: {
    id: 'airdrop.schedule.thawTitle',
    defaultMessage: '!!!Thaw {index}/{total}',
  },
  redeemable: {
    id: 'airdrop.schedule.redeemable',
    defaultMessage: '!!!Redeemable',
  },
  notAvailable: {
    id: 'airdrop.schedule.notAvailable',
    defaultMessage: '!!!Not available yet',
  },
  redeemed: {
    id: 'airdrop.schedule.redeemed',
    defaultMessage: '!!!Redeemed',
  },
  thawExplanation: {
    id: 'airdrop.schedule.thawExplanation',
    defaultMessage: '!!!Each thaw is 25% of your claimed NIGHT allocation',
  },
  status: {
    id: 'airdrop.addrDetails.statusLabel',
    defaultMessage: '!!!Redemption status',
  },
  subTitle: {
    id: 'airdrop.addrDetails.subTitle',
    defaultMessage: '!!!🧩 <strong>Thawing & Redemption</strong> of Midnight airdrop has started.',
  },
  redeemableNow: {
    id: 'airdrop.addrDetails.redeemableNow',
    defaultMessage: '!!!Redeemable now',
  },
  dstAddrLabel: {
    id: 'airdrop.addrCard.destAddrLabel',
    defaultMessage: '!!!Destination address',
  },
  allocationSize: {
    id: 'airdrop.addrDetails.allocationSize',
    defaultMessage: '!!!Allocation size',
  },
  claimedAllocations: {
    id: 'airdrop.addrDetails.claimedAllocations',
    defaultMessage: '!!!No. of claimed allocations',
  },
  redeemedSoFar: {
    id: 'airdrop.addrDetails.redeemedSoFar',
    defaultMessage: '!!!Redeemed so far',
  },
  totalLeftToRedeem: {
    id: 'airdrop.addrDetails.totalLeftToRedeem',
    defaultMessage: '!!!Total left to redeem',
  },
  totalToRedeem: {
    id: 'airdrop.addrDetails.totalToRedeem',
    defaultMessage: '!!!Total to redeem',
  },
  detailsOn: {
    id: 'airdrop.addrDetails.detailsOn',
    defaultMessage: '!!!Details on',
  },
  cardanoscan: {
    id: 'airdrop.addrDetails.cardanoscan',
    defaultMessage: '!!!Cardanoscan',
  },
  adaex: {
    id: 'airdrop.addrDetails.adaex',
    defaultMessage: '!!!Adaex',
  },
});

const strong = chunks => (
  <Typography fontWeight="500" display="inline">
    {chunks}
  </Typography>
);

function getTotalAllocation(schedule: Schedule): number {
  return schedule.thaws.reduce((sum, thaw) => sum + thaw.amount, 0);
}

function getRedeemedSoFar(schedule: Schedule): number {
  return schedule.thaws.filter(thaw => thaw.status === 'confirmed').reduce((sum, thaw) => sum + thaw.amount, 0);
}

interface Props {
  schedule: Schedule;
  redeemableAmount: string;
  address: string;
  networkId: number;
}

export default function AddressDetails({ schedule, redeemableAmount, address }: Props) {
  const intl = useIntl();

  const totalAllocation = getTotalAllocation(schedule);
  const redeemedSoFar = getRedeemedSoFar(schedule);
  const totalLeftToRedeem = totalAllocation - redeemedSoFar;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <Box>
        {/*  @ts-ignore */}
        <Typography variant="heading-4-regular" sx={{ fontWeight: 500, fontSize: '20px', lineHeight: '28px' }}>
          {intl.formatMessage(messages.status)}
        </Typography>
        {/*  @ts-ignore */}
        <Typography variant="body1">
          <FormattedMessage {...messages.subTitle} values={{ strong }} />
        </Typography>
      </Box>

      <Box
        sx={{
          borderRadius: 'var(--corner-radius-8, 8px)',
          background: 'var(--light-theme-gradients-bg-gradient-1, linear-gradient(312deg, #C6F7ED 0%, #E4E8F7 70.58%))',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <Typography variant="body1" fontWeight="500">
          {intl.formatMessage(messages.redeemableNow)}
        </Typography>
        <Box>
          <Typography
            variant="h4"
            component="span"
            sx={{
              fontSize: '20px',
              lineHeight: '28px',
              fontWeight: 500,
              color: 'ds.text_gray_medium',
            }}
          >
            {redeemableAmount}
          </Typography>
          {/*  @ts-ignore */}
          <Typography as="span" variant="body1" fontWeight="500" sx={{ color: 'ds.text_gray_medium' }}>
            {' '}
            NIGHT
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="var(--text-gray-low, #6B7384)">
            {intl.formatMessage(messages.dstAddrLabel)}
          </Typography>
          {/*  @ts-ignore */}
          <CopyableText value={address} copyButtonFollowText>
            <Typography variant="body1">{address}</Typography>
          </CopyableText>
        </Box>
      </Box>

      <ScheduleCard schedule={schedule} />

      <Box sx={{ height: '1px', background: 'var(--grayscale-200, #DCE0E9)' }} />

      <Collapsible
        expanded={true}
        title={
          <Typography variant="body1" fontWeight="500" color="ds.text_gray_medium">
            {intl.formatMessage(messages.details)}
          </Typography>
        }
        content={
          <Stack spacing="16px" sx={{ paddingBottom: '16px' }}>
            <DetailRow label={intl.formatMessage(messages.allocationSize)} value={`${formatNumber(totalAllocation)} NIGHT`} />
            <DetailRow
              label={intl.formatMessage(messages.claimedAllocations)}
              value={String(schedule.numberOfClaimedAllocations)}
            />
            <DetailRow label={intl.formatMessage(messages.redeemedSoFar)} value={`${formatNumber(redeemedSoFar)} NIGHT`} />
            <DetailRow
              label={intl.formatMessage(messages.totalLeftToRedeem)}
              value={`${formatNumber(totalLeftToRedeem)} NIGHT`}
            />
          </Stack>
        }
      />
    </Box>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body1" color="ds.text_gray_low">
        {label}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_medium">
        {value}
      </Typography>
    </Stack>
  );
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCurrentThawIndex(schedule: Schedule): number {
  const redeemableIndex = schedule.thaws.findIndex(thaw => thaw.status === 'redeemable');
  if (redeemableIndex >= 0) return redeemableIndex;
  const upcomingIndex = schedule.thaws.findIndex(thaw => thaw.status === 'upcoming');
  if (upcomingIndex >= 0) return upcomingIndex;
  return 0;
}

type ThawStatus = 'redeemable' | 'confirmed' | 'upcoming';

function getThawStatusType(status: string): ThawStatus {
  if (status === 'redeemable') return 'redeemable';
  if (status === 'confirmed') return 'confirmed';
  return 'upcoming';
}

function getStatusBadgeStyle(status: ThawStatus, theme: any) {
  switch (status) {
    case 'redeemable':
      return {
        background: 'linear-gradient(90deg, #17D1AA 0%, #1ACBAF 15%, #21B8BC 37%, #2E9BD3 62%, #3F71F1 89%, #475FFF 100%)',
        borderRadius: '1200px',
        color: theme.palette.ds?.gray_min ?? '#FFFFFF',
      };
    case 'confirmed':
      return {
        backgroundColor: theme.palette.ds?.secondary_600 ?? '#00A876',
        borderRadius: '1200px',
        color: theme.palette.ds?.gray_min ?? '#FFFFFF',
      };
    default:
      return {
        backgroundColor: theme.palette.ds?.gray_600 ?? '#6B7384',
        borderRadius: '1200px',
        color: theme.palette.ds?.gray_min ?? '#FFFFFF',
      };
  }
}

function getStatusMessage(status: ThawStatus, intlMessages: typeof messages) {
  switch (status) {
    case 'redeemable':
      return intlMessages.redeemable;
    case 'confirmed':
      return intlMessages.redeemed;
    default:
      return intlMessages.notAvailable;
  }
}

function ScheduleCard({ schedule }: { schedule: Schedule }) {
  const intl = useIntl();
  const theme = useTheme() as any;
  const totalThaws = schedule.thaws.length;
  const currentThawIndex = getCurrentThawIndex(schedule);

  return (
    <Box
      sx={{
        backgroundColor: 'ds.bg_color_max',
        borderRadius: '8px',
        padding: '24px',
        border: '1px solid',
        borderColor: 'ds.gray_200',
      }}
    >
      <Box sx={{ mb: '24px' }}>
        <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium">
          {intl.formatMessage(messages.currentThaw, { current: currentThawIndex + 1, total: totalThaws })}
        </Typography>
      </Box>

      <Stack direction="row" alignItems="flex-start" gap="0" sx={{ mb: '24px' }}>
        {schedule.thaws.map((thaw, index) => {
          const statusType = getThawStatusType(thaw.status);
          const isRedeemable = statusType === 'redeemable';
          const isRedeemed = statusType === 'confirmed';
          const isCurrent = index === currentThawIndex;
          const isPast = index < currentThawIndex;
          const isLast = index === totalThaws - 1;

          return (
            <Box key={index} sx={{ flex: 1, position: 'relative' }}>
              <Stack direction="row" alignItems="center" sx={{ mb: '16px' }}>
                <Box
                  sx={{
                    width: '24px',
                    height: '24px',
                    padding: '4px',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isPast ? 'ds.primary_300' : isCurrent ? 'ds.primary_500' : 'ds.gray_200',
                    color: isPast || isCurrent ? 'ds.white_static' : 'ds.text_gray_min',
                    fontSize: '12px',
                    fontWeight: 500,
                    zIndex: 1,
                    flexShrink: 0,
                  }}
                >
                  {isPast ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13.7007 4.28655C14.0947 4.67354 14.1004 5.30668 13.7134 5.70071L6.83845 12.7007C6.65042 12.8922 6.39334 13 6.125 13C5.85666 13 5.59958 12.8922 5.41155 12.7007L2.28655 9.51889C1.89956 9.12486 1.90527 8.49172 2.29929 8.10473C2.69332 7.71774 3.32646 7.72345 3.71345 8.11747L6.125 10.5729L12.2866 4.29929C12.6735 3.90527 13.3067 3.89956 13.7007 4.28655Z"
                          fill="white"
                        />
                      </svg>
                    </Box>
                  ) : (
                    index + 1
                  )}
                </Box>
                {!isLast && (
                  <Box
                    sx={{
                      flex: 1,
                      height: '2px',
                      backgroundColor: isPast ? 'ds.primary_500' : 'ds.gray_200',
                    }}
                  />
                )}
              </Stack>

              <Box sx={{ pr: isLast ? 0 : '16px' }}>
                <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium" sx={{ mb: '4px' }}>
                  {intl.formatMessage(messages.thawTitle, { index: index + 1, total: totalThaws })}
                </Typography>

                <Typography variant="body2" color="ds.text_gray_low" sx={{ mb: '8px' }}>
                  {formatDate(thaw.thawing_period_start, intl.locale)}
                </Typography>

                <Stack direction="row" alignItems="baseline" gap="4px" sx={{ mb: '8px' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: isRedeemable ? 'ds.text_gray_medium' : 'ds.text_gray_low',
                      textDecorationLine: isRedeemed ? 'line-through' : 'none',
                    }}
                  >
                    {formatNumber(thaw.amount)}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={500}
                    color={isRedeemable ? 'ds.text_gray_medium' : 'ds.text_gray_low'}
                  >
                    {' '}
                    NIGHT
                  </Typography>
                </Stack>

                <MuiChip
                  label={intl.formatMessage(getStatusMessage(statusType, messages))}
                  sx={{
                    height: 'auto',
                    ...getStatusBadgeStyle(statusType, theme),
                    '& .MuiChip-label': {
                      padding: '3px 8px',
                      fontSize: '12px',
                      fontWeight: 400,
                      textTransform: 'none',
                      lineHeight: '16px',
                    },
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>

      <Typography variant="caption" color="ds.text_gray_low">
        {intl.formatMessage(messages.thawExplanation)}
      </Typography>
    </Box>
  );
}
