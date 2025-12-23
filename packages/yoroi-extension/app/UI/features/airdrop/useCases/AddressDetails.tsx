import { Button, Box, Chip as MuiChip, Stack, Typography, useTheme } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { type Schedule, formatNumber } from '../../../../api/ada/midnightRedemption';
import { Collapsible } from '../../../components/Collapsible/Collapsible';
import CopyableText from '../../../components/CopyableText';
import { useStrings, messages } from '../common/hooks/useStrings';

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
  isRedeemable: boolean;
  onRedeem: () => void;
  redeemableAmount: string;
  address: string;
}

export default function AddressDetails({ schedule, redeemableAmount, address, isRedeemable, onRedeem }: Props) {
  const strings = useStrings();
  const theme: any = useTheme();

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
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Box>
          {/*  @ts-ignore */}
          <Typography variant="heading-4-regular" sx={{ fontWeight: 500, fontSize: '20px', lineHeight: '28px' }}>
            {strings.statusLabel}
          </Typography>
          {/*  @ts-ignore */}
          <Typography variant="body1">
            <FormattedMessage {...messages.subTitle} values={{ strong }} />
          </Typography>
        </Box>
        {/*  @ts-ignore */}

        <Button variant="primary" onClick={onRedeem} disabled={!isRedeemable}>
          {strings.redeemButton}
        </Button>
      </Box>

      <Box
        sx={{
          borderRadius: '8px',
          background: theme.palette.ds.bg_gradient_1,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <Typography variant="body1" fontWeight="500">
          {strings.redeemableNow}
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
          <Typography variant="body2" color="ds.text_gray_low">
            {strings.dstAddrLabel}
          </Typography>
          {/*  @ts-ignore */}
          <CopyableText value={address} copyButtonFollowText>
            <Typography variant="body1">{address}</Typography>
          </CopyableText>
        </Box>
      </Box>

      <ScheduleCard schedule={schedule} />

      <Box sx={{ height: '1px', background: 'ds.gray_200' }} />

      <Collapsible
        expanded={true}
        title={
          <Typography variant="body1" fontWeight="500" color="ds.text_gray_medium">
            {strings.details}
          </Typography>
        }
        content={
          <Stack spacing="16px" sx={{ paddingBottom: '16px' }}>
            <DetailRow label={strings.allocationSize} value={`${formatNumber(totalAllocation)} NIGHT`} />
            <DetailRow label={strings.claimedAllocations} value={String(schedule.numberOfClaimedAllocations)} />
            <DetailRow label={strings.redeemedSoFar} value={`${formatNumber(redeemedSoFar)} NIGHT`} />
            <DetailRow label={strings.totalLeftToRedeem} value={`${formatNumber(totalLeftToRedeem)} NIGHT`} />
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
        background: theme.palette.ds.illustration_static,
        borderRadius: '8px',
        color: theme.palette.ds.gray_min,
      };
    case 'confirmed':
      return {
        backgroundColor: theme.palette.ds.secondary_600,
        borderRadius: '8px',
        color: theme.palette.ds.gray_min,
      };
    default:
      return {
        backgroundColor: theme.palette.ds.gray_600,
        borderRadius: '8px',
        color: theme.palette.ds.gray_min,
      };
  }
}

function getStatusMessage(status: ThawStatus, strings: ReturnType<typeof useStrings>) {
  switch (status) {
    case 'redeemable':
      return strings.redeemable;
    case 'confirmed':
      return strings.redeemed;
    default:
      return strings.notAvailable;
  }
}

function ScheduleCard({ schedule }: { schedule: Schedule }) {
  const strings = useStrings();
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
          {strings.currentThaw(currentThawIndex + 1, totalThaws)}
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
                  {strings.thawTitle(index + 1, totalThaws)}
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
                  label={getStatusMessage(statusType, strings)}
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
        {strings.thawExplanation}
      </Typography>
    </Box>
  );
}
