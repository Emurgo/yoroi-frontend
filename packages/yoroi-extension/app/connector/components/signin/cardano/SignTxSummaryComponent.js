import { Box, Typography } from '@mui/material';
import { signTxMessages } from '../SignTxPage';

export default function CardanoSignTxSummaryComponent({ txTotalAmount, intl }) {
  return (
    <Box
      p="16px"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      borderRadius="8px"
      color="var(--yoroi-palette-common-white)"
      sx={{ background: 'linear-gradient(30.09deg, #244ABF 0%, #4760FF 176.73%)' }}
    >
      <Typography variant="b1" fontWeight={500}>
        {intl.formatMessage(signTxMessages.summary)}
      </Typography>
      <Typography variant="h3" fontSize="24px" textAlign="right">
        {txTotalAmount.cryptoAmount} {txTotalAmount.ticker}
      </Typography>
    </Box>
  );
}
