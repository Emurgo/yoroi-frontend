import { Box, Typography } from '@mui/material';
import { useStrings } from '../common/hooks/useStrings';

export default function Zero() {
  const strings = useStrings();

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
      <Typography variant="h1xl">{strings.noAllocTitle}</Typography>

      {/*  @ts-ignore */}
      <Typography variant="body1">{strings.noRedemptionText}</Typography>

      {/*  @ts-ignore */}
      <Typography variant="body1">
        <a href="https://www.midnight.gd/" rel="noopener noreferrer">
          {strings.learnMore}
        </a>
      </Typography>
    </Box>
  );
}
