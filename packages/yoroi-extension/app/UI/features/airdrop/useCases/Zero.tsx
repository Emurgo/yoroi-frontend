import { Box, Typography } from '@mui/material';
import { useIntl, defineMessages } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';

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
      }}
    >
      {/*  @ts-ignore */}
      <Typography variant="h1xl">
        {intl.formatMessage(messages.noAllocTitle)}
      </Typography>
      <Box>
        {/*  @ts-ignore */}
        <Typography variant="body1" as="span">
          {intl.formatMessage(messages.noAllocTitle)}
        </Typography>
        &nbsp;
        {/*  @ts-ignore */}
        <Typography variant="body1" as="span">
          <a href="">
            {intl.formatMessage(globalMessages.learnMore)}
          </a>
        </Typography>
      </Box>
    </Box>
  );
}