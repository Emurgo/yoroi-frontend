// @flow
import type { Node, ComponentType } from 'react';
import type { ConnectorIntl } from '../../../types';
import type { SummaryAssetsData } from '../CardanoSignTxPage';
import BigNumber from 'bignumber.js';
import { injectIntl } from 'react-intl';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useContext, useState } from 'react';
import { getTokenName } from '../../../../stores/stateless/tokenHelpers';
import { signTxMessages } from '../SignTxPage';
import CardanoSignTxSummary from './SignTxSummary';
import { ReactComponent as ExpandArrow } from '../../../assets/images/arrow-expand.inline.svg';
import { connectorMessages } from '../../../../i18n/global-messages';
import ErrorBlock from '../../../../components/widgets/ErrorBlock';
import LocalizableError from '../../../../i18n/LocalizableError';

type AssetDisplayValueProps = {|
  amount: BigNumber,
  tokenInfo: any,
  renderExplorerHashLink: Function,
|};

export const getAssetDisplayValue = ({
  amount,
  tokenInfo,
  renderExplorerHashLink,
}: AssetDisplayValueProps): Node => (
  <>
    {amount.toNumber() === 1 && tokenInfo.IsNFT ? null : <span>{amount.toNumber() + ' '}</span>}
    {renderExplorerHashLink(tokenInfo)}
  </>
);

type Props = {|
  txAssetsData: SummaryAssetsData,
  renderExplorerHashLink: Function,
  passwordFormField: Node,
  hwWalletError: ?LocalizableError,
  walletType: string,
|};

function CardanoSignTx({
  intl,
  txAssetsData,
  renderExplorerHashLink,
  passwordFormField,
  hwWalletError,
  walletType,
}: Props & ConnectorIntl): Node {
  const { total, isOnlyTxFee, sent, received } = txAssetsData;
  const isSendingNativeToken = Number(total.amount) < 0;
  const isReceivingNativeToken = Number(total.amount) > 0;

  return (
    <Box>
      <CardanoSignTxSummary
        renderExplorerHashLink={renderExplorerHashLink}
        txAssetsData={txAssetsData}
      />
      <Panel>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography color="#4A5065" fontWeight={500}>
            {intl.formatMessage(signTxMessages.transactionFee)}
          </Typography>
          <Typography textAlign="right" color="#242838">
            {total.fee} {total.ticker}
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
            renderExplorerHashLink={renderExplorerHashLink}
          />
          <ExpandableAssetsPanel
            intl={intl}
            total={total}
            hasNativeToken={isReceivingNativeToken}
            assets={received}
            action="received"
            panelTitle={intl.formatMessage(connectorMessages.receive)}
            renderExplorerHashLink={renderExplorerHashLink}
          />
        </>
      )}
      {walletType === 'web' && <Box mt="32px">{passwordFormField}</Box>}

      <ErrorBlock error={hwWalletError} />
    </Box>
  );
}

export default (injectIntl(CardanoSignTx): ComponentType<Props>);

const ExpandableAssetsPanel = ({
  intl,
  assets = [],
  total,
  panelTitle,
  action,
  hasNativeToken,
  renderExplorerHashLink,
}): Node => {
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
          {total.amount} {total.ticker}
        </AsseetValueDisplay>
      )}

      {!isExpandable && assets.length === 1 && (
        <AsseetValueDisplay>
          {getAssetDisplayValue({ ...assets[0], renderExplorerHashLink })}
        </AsseetValueDisplay>
      )}

      {isExpandable && isExpanded && (
        <>
          {assets.map((asset, k) => (
            <AsseetValueDisplay key={k}>
              {getAssetDisplayValue({ ...asset, renderExplorerHashLink })}
            </AsseetValueDisplay>
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

const AsseetValueDisplay = ({ children }): Node => (
  <Box mt="16px">
    <Typography textAlign="right" color="#242838">
      {children}
    </Typography>
  </Box>
);

const Panel = ({ children }): Node => (
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
