import { Box, Typography } from '@mui/material';
import { useIntl, defineMessages } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';

const messages = defineMessages({
  noAllocTitle: {
    id: 'aidrop.noAllocTitle',
    defaultMessage: '!!!No eligible addresses found in your wallet',
  },
  noRedemptionText: {
    id: 'aidrop.noRedemptionText',
    defaultMessage: '!!!None of the addresses in this wallet are eligible for redemption',
  },
});

export default function Zero() {
  const intl = useIntl();

  return (
    <Box
      sx={{
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '612px',
        borderRadius: '8px',
        bgcolor: 'ds.bg_color_contrast_min',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      {/*  @ts-ignore */}
      <Typography variant="h1xl">{intl.formatMessage(messages.noAllocTitle)}</Typography>

      {/*  @ts-ignore */}
      <Typography variant="body1">{intl.formatMessage(messages.noRedemptionText)}</Typography>

      {/*  @ts-ignore */}
      <Typography variant="body1">
        <a href="https://www.midnight.gd/" rel="noopener noreferrer">
          {intl.formatMessage(globalMessages.learnMore)}
        </a>
      </Typography>
    </Box>
  );
}
