import { Box, Chip as MuiChip, Stack, Typography, useTheme } from '@mui/material';
import { defineMessages, useIntl } from 'react-intl';
import { type Schedule, formatNumber } from '../../../../api/ada/midnightRedemption';
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
    defaultMessage: '!!!🧩 Thawing & Redemption of Midnight airdrop has started.',
  },
  redeemableNow: {
    id: 'airdrop.addrDetails.redeemableNow',
    defaultMessage: '!!!Redeemable now',
  },
  dstAddrLabel: {
    id: 'airdrop.addrCard.destAddrLabel',
    defaultMessage: '!!!Destination address',
  },
});

interface Props {
  schedule: Schedule;
  redeemableAmount: string;
  address: string;
}

export default function AddressDetails({ schedule, redeemableAmount, address }: Props) {
  const intl = useIntl();

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
          {intl.formatMessage(messages.subTitle)}
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
          {/*  @ts-ignore */}
          <Typography as="span" fontSize="30px" fontWeight="500">
            {redeemableAmount}
          </Typography>
          {/*  @ts-ignore */}
          <Typography as="span" variant="body1" fontWeight="500">
            NIGHT
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="var(--text-gray-low, #6B7384)">
            {intl.formatMessage(messages.dstAddrLabel)}
          </Typography>
          {/*  @ts-ignore */}
          <CopyableText value={address} copyButtonFollowText>
            <Typography variant="body1">
              {address}
            </Typography>
          </CopyableText>
        </Box>
      </Box>

      <ScheduleCard schedule={schedule} />

      <Box sx={{ height: '1px', background: 'var(--grayscale-200, #DCE0E9)' }}/>

      <Box>
        <Typography variant="body1" fontWeight="500">
          {intl.formatMessage(messages.details)}
        </Typography>
      </Box>

      <Box>
        {/* allocation size
            no. of claimed allocations
            ...
         */}
      </Box>
    </Box>
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
          const isActive = isRedeemable || isRedeemed;
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
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCurrent || isPast ? 'ds.primary_500' : 'ds.gray_200',
                    color: isCurrent || isPast ? 'ds.white_static' : 'ds.text_gray_low',
                    fontSize: '12px',
                    fontWeight: 500,
                    zIndex: 1,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
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
                    sx={{
                      fontSize: isActive ? '24px' : '18px',
                      fontWeight: 500,
                      lineHeight: 1.2,
                      color: isActive ? 'ds.text_gray_medium' : 'ds.text_gray_low',
                    }}
                  >
                    {formatNumber(thaw.amount)}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={500}
                    color={isActive ? 'ds.text_gray_medium' : 'ds.text_gray_low'}
                  >
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
