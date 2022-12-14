import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useContext } from 'react';
import { signTxMessages } from '../SignTxPage';
import CardanoSignTxSummaryComponent from './SignTxSummaryComponent';

export default function CardanoSignTxComponent({
  intl,
  isOnlyTxFee,
  txFeeAmount,
  txTotalAmount,
  passwordFormField,
}) {
  return (
    <Box>
      <CardanoSignTxSummaryComponent txTotalAmount={txTotalAmount} intl={intl} />
      <Box
        mt="32px"
        width="100%"
        p="16px"
        border="1px solid var(--yoroi-palette-gray-100)"
        borderRadius="8px"
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography color="#4A5065" fontWeight={500}>
            {intl.formatMessage(signTxMessages.transactionFee)}
          </Typography>
          <Typography textAlign="right" color="#242838">
            {txFeeAmount}
          </Typography>
        </Box>
      </Box>
      <Box mt="32px">{passwordFormField}</Box>
    </Box>
  );
}
