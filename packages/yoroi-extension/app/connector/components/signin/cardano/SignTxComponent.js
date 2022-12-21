import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useContext } from 'react';
import { signTxMessages } from '../SignTxPage';
import CardanoSignTxSummaryComponent from './SignTxSummaryComponent';

export default function CardanoSignTxComponent({
  intl,
  isOnlyTxFee,
  txFeeAmount,
  txAmount,
  txTotalAmount,
  passwordFormField,
}) {
  return (
    <Box>
      <CardanoSignTxSummaryComponent txTotalAmount={txTotalAmount} intl={intl} />
      <Panel>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography color="#4A5065" fontWeight={500}>
            {intl.formatMessage(signTxMessages.transactionFee)}
          </Typography>
          <Typography textAlign="right" color="#242838">
            {txFeeAmount.cryptoAmount.replace('-', '')} {txFeeAmount.ticker}
          </Typography>
        </Box>
      </Panel>
      {!isOnlyTxFee && (
        <>
          <Panel>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Typography color="#4A5065" fontWeight={500}>
                {/* TODO: use intl */}
                Send
              </Typography>
            </Box>
            <AsseetValueDisplay>
              {txAmount.cryptoAmount.replace('-', '')} {txAmount.ticker}
            </AsseetValueDisplay>
          </Panel>
          <Panel>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Typography color="#4A5065" fontWeight={500}>
                {/* TODO: use intl */}
                Receive
              </Typography>
            </Box>
            <AsseetValueDisplay>
              {/* TODO: use intl */}
              No assets received
            </AsseetValueDisplay>
          </Panel>
        </>
      )}
      <Box mt="32px">{passwordFormField}</Box>
    </Box>
  );
}

const AsseetValueDisplay = ({ children }) => (
  <Box mt="16px">
    <Typography textAlign="right" color="#242838">
      {children}
    </Typography>
  </Box>
);

const Panel = ({ children }) => (
  <Box
    mt="32px"
    width="100%"
    p="16px"
    border="1px solid var(--yoroi-palette-gray-100)"
    borderRadius="8px"
  >
    {children}
  </Box>
);
