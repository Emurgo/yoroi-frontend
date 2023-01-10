import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useContext } from 'react';
import { getTokenName } from '../../../../stores/stateless/tokenHelpers';
import { signTxMessages } from '../SignTxPage';
import CardanoSignTxSummaryComponent from './SignTxSummaryComponent';

const getAssetDisplayValue = ({ amount, tokenInfo }) => {
  const tokenName = getTokenName(tokenInfo);
  return `${tokenInfo.IsNFT && amount == 1 ? '' : amount + ' '}${tokenName}`;
};

export default function CardanoSignTxComponent({ intl, txAssetsData, passwordFormField }) {
  const { total, isOnlyTxFee, sent, received } = txAssetsData;
  const isSendingNativeToken = Number(total.cryptoAmount) < 0;
  const isReceivingNativeToken = Number(total.cryptoAmount) > 0;

  return (
    <Box>
      <CardanoSignTxSummaryComponent txAssetsData={txAssetsData} intl={intl} />
      <Panel>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography color="#4A5065" fontWeight={500}>
            {intl.formatMessage(signTxMessages.transactionFee)}
          </Typography>
          <Typography textAlign="right" color="#242838">
            {total.cryptoFee} {total.ticker}
          </Typography>
        </Box>
      </Panel>
      {(!isOnlyTxFee || sent.length > 0 || received.length > 0) && (
        <>
          <Panel>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Typography color="#4A5065" fontWeight={500}>
                {/* TODO: use intl */}
                Send
              </Typography>
            </Box>

            {isSendingNativeToken && (
              <AsseetValueDisplay>
                {total.cryptoAmount} {total.ticker}
              </AsseetValueDisplay>
            )}

            {sent.length > 0 && (
              <>
                {sent.map(asset => (
                  <AsseetValueDisplay>{getAssetDisplayValue(asset)}</AsseetValueDisplay>
                ))}
              </>
            )}

            {/* TODO: use intl */}
            {!isSendingNativeToken && sent.length === 0 && (
              <AsseetValueDisplay>No assets sent</AsseetValueDisplay>
            )}
          </Panel>
          <Panel>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Typography color="#4A5065" fontWeight={500}>
                {/* TODO: use intl */}
                Receive
              </Typography>
            </Box>

            {isReceivingNativeToken && (
              <AsseetValueDisplay>
                {total.cryptoAmount} {total.ticker}
              </AsseetValueDisplay>
            )}

            {received.length > 0 && (
              <>
                {received.map(asset => (
                  <AsseetValueDisplay>{getAssetDisplayValue(asset)}</AsseetValueDisplay>
                ))}
              </>
            )}
            {/* TODO: use intl */}
            {!isReceivingNativeToken && received.length === 0 && (
              <AsseetValueDisplay>No assets received</AsseetValueDisplay>
            )}
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
