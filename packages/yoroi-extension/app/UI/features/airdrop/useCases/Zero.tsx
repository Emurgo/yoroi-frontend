import { Box, Typography, Link } from '@mui/material';
import { useIntl, defineMessages } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { MIDNIGHT_DISTRIBUTION_URL } from '../../../common/constants';

const messages = defineMessages({
  noAllocTitle: {
    id: 'aidrop.noAllocTitle',
    defaultMessage: '!!!No eligible addresses found in your wallet',
  },
  noAllocText: {
    id: 'aidrop.noAllocText',
    defaultMessage: '!!!None of the addresses provided are eligible for an allocation',
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
        textAlign: 'center'
      }}
    >
      {/*  @ts-ignore */}
      <Typography variant="h1xl">
        {intl.formatMessage(messages.noAllocTitle)}
      </Typography>

      {/*  @ts-ignore */}
      <Typography variant="body1">
        {intl.formatMessage(messages.noAllocText)}
      </Typography>

      {/*  @ts-ignore */}
      <Typography variant="body1">
        <Link href={MIDNIGHT_DISTRIBUTION_URL}  target="_blank" rel="noopener noreferrer">
          {intl.formatMessage(globalMessages.learnMore)}
        </Link>
      </Typography>

    </Box>
  );
}