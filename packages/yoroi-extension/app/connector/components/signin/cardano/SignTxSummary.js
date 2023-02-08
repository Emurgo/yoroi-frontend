// @flow
import { Box, Typography } from '@mui/material';
import { signTxMessages } from '../SignTxPage';

export default function CardanoSignTxSummary({ txAssetsData, intl }) {
  const { total, isOnlyTxFee, sent, received } = txAssetsData;
  const showOnlyTxFee = isOnlyTxFee && sent.length == 0 && received.length == 0;
  return (
    <Box
      p="16px"
      borderRadius="8px"
      color="var(--yoroi-palette-common-white)"
      sx={{ background: 'linear-gradient(30.09deg, #244ABF 0%, #4760FF 176.73%)' }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="b1" fontWeight={500}>
          {intl.formatMessage(signTxMessages.summary)}
        </Typography>
        <Typography variant="h3" fontSize="24px" textAlign="right">
          {showOnlyTxFee ? total.cryptoFee : total.cryptoTotal} {total.ticker}
        </Typography>
      </Box>
      {(sent.length > 0 || received.length > 0) && (
        <>
          <Separator />
          <Box textAlign="right">
            {sent.length > 1 && <Box lineHeight="24px">{sent.length} assets sent</Box>}
            {received.length > 1 && <Box lineHeight="24px">{received.length} assets received</Box>}
          </Box>
        </>
      )}
    </Box>
  );
}

const Separator = () => (
  <Box
    sx={{
      height: '1px',
      width: '100%',
      background: 'rgba(255, 255, 255, 0.48)',
      mt: '16px',
      mb: '16px',
    }}
  />
);
