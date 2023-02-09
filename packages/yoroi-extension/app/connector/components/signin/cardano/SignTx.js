// @flow
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useContext, useState } from 'react';
import { getTokenName } from '../../../../stores/stateless/tokenHelpers';
import { signTxMessages } from '../SignTxPage';
import CardanoSignTxSummary from './SignTxSummary';
import { ReactComponent as ExpandArrow } from '../../../assets/images/arrow-expand.inline.svg';
import { connectorMessages } from '../../../../i18n/global-messages';

const getAssetDisplayValue = ({ amount, tokenInfo }) => {
  const tokenName = getTokenName(tokenInfo);
  return `${tokenInfo.IsNFT && amount == 1 ? '' : amount + ' '}${tokenName}`;
};

export default function CardanoSignTx({
  intl,
  txAssetsData,
  // getAddressUrlHash,
  passwordFormField,
}) {
  const { total, isOnlyTxFee, sent, received } = txAssetsData;
  const isSendingNativeToken = Number(total.cryptoAmount) < 0;
  const isReceivingNativeToken = Number(total.cryptoAmount) > 0;

  return (
    <Box>
      <CardanoSignTxSummary txAssetsData={txAssetsData} intl={intl} />
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
          <ExpandableAssetsPanel
            intl={intl}
            total={total}
            hasNativeToken={isSendingNativeToken}
            assets={sent}
            action="sent"
            panelTitle={intl.formatMessage(connectorMessages.send)}
          />
          <ExpandableAssetsPanel
            intl={intl}
            total={total}
            hasNativeToken={isReceivingNativeToken}
            assets={received}
            action="received"
            panelTitle={intl.formatMessage(connectorMessages.receive)}
          />
        </>
      )}
      <Box mt="32px">{passwordFormField}</Box>
    </Box>
  );
}

const ExpandableAssetsPanel = ({
  intl,
  assets = [],
  total,
  panelTitle,
  action,
  hasNativeToken,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpandable = assets.length > 1;
  const { assetsSent, assetsReceived, noAssetsSent, noAssetsReceived } = connectorMessages;
  const assetsMsg = action === 'sent' ? assetsSent : assetsReceived;
  const noAssetsMsg = action === 'sent' ? noAssetsSent : noAssetsReceived;

  return (
    <Panel>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        sx={{ cursor: 'pointer' }}
        onClick={() => setIsExpanded(expanded => !expanded)}
      >
        <Typography color="#4A5065" fontWeight={500}>
          {panelTitle}
        </Typography>
        {isExpandable && (
          <Box sx={{ rotate: isExpanded ? '180deg' : 'none' }}>
            <ExpandArrow />
          </Box>
        )}
      </Box>

      {(hasNativeToken || assets.length !== 0) && (
        <AsseetValueDisplay>
          {total.cryptoAmount} {total.ticker}
        </AsseetValueDisplay>
      )}

      {!isExpandable && assets.length === 1 && (
        <AsseetValueDisplay>{getAssetDisplayValue(assets[0])}</AsseetValueDisplay>
      )}

      {isExpandable && isExpanded && (
        <>
          {assets.map((asset, k) => (
            <AsseetValueDisplay key={k}>{getAssetDisplayValue(asset)}</AsseetValueDisplay>
          ))}
        </>
      )}

      {isExpandable && !isExpanded && (
        <AsseetValueDisplay>
          {intl.formatMessage(assetsMsg, { quantity: assets.length })}
        </AsseetValueDisplay>
      )}

      {!hasNativeToken && assets.length === 0 && (
        <AsseetValueDisplay>{intl.formatMessage(noAssetsMsg)}</AsseetValueDisplay>
      )}
    </Panel>
  );
};

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
