// @flow
import type { Node, ComponentType } from 'react';
import type { ConnectorIntl } from '../../../types';
import type { SummaryAssetsData } from '../CardanoSignTxPage';
import { Box, Typography } from '@mui/material';
import { defineMessages, injectIntl } from 'react-intl';
import { connectorMessages } from '../../../../i18n/global-messages';

const messages: Object = defineMessages({
  summary: {
    id: 'connector.signin.summary',
    defaultMessage: '!!!Summary',
  },
});

type Props = {|
  txAssetsData: SummaryAssetsData,
  renderExplorerHashLink: Function,
|};

type AssetsSummaryDisplayProps = {| ...Props, ...ConnectorIntl |};

const getAssetsSummaryDisplay = ({
  txAssetsData,
  renderExplorerHashLink,
  intl,
}: AssetsSummaryDisplayProps): Node => {
  const { sent, received } = txAssetsData;
  const [sentAsset = null] = sent;
  const [receivedAsset = null] = received;
  const { assetsSent, assetSent, assetsReceived, assetReceived } = connectorMessages;

  return (
    <>
      {/* SENT ASSETS */}
      {sent.length > 1 && (
        <Box lineHeight="24px">{intl.formatMessage(assetsSent, { quantity: sent.length })}</Box>
      )}
      {sent.length === 1 && (
        <Box
          lineHeight="24px"
          sx={{
            '& .ExplorableHash_url': { color: '#fff' },
            '& .ExplorableHash_url svg': { marginRight: '3px' },
            '& .ExplorableHash_url svg path': { fill: '#fff' },
          }}
        >
          {renderExplorerHashLink(sentAsset?.tokenInfo)}
          {intl.formatMessage(assetSent, { assetName: '' })}
        </Box>
      )}

      {/* RECEIVED ASSETS */}
      {received.length > 1 && (
        <Box lineHeight="24px">
          {intl.formatMessage(assetsReceived, { quantity: received.length })}
        </Box>
      )}
      {received.length === 1 && (
        <Box
          lineHeight="24px"
          sx={{
            '& .ExplorableHash_url': { color: '#fff' },
            '& .ExplorableHash_url svg': { marginRight: '3px' },
            '& .ExplorableHash_url svg path': { fill: '#fff' },
          }}
        >
          {renderExplorerHashLink(receivedAsset?.tokenInfo)}{' '}
          {intl.formatMessage(assetReceived, { assetName: '' })}
        </Box>
      )}
    </>
  );
};

function CardanoSignTxSummary({
  txAssetsData,
  renderExplorerHashLink,
  intl,
}: Props & ConnectorIntl): Node {
  const { total, isOnlyTxFee, sent, received } = txAssetsData;
  const showOnlyTxFee = isOnlyTxFee && sent.length === 0 && received.length === 0;
  return (
    <Box
      p="16px"
      borderRadius="8px"
      color="var(--yoroi-palette-common-white)"
      sx={{ background: 'linear-gradient(30.09deg, #244ABF 0%, #4760FF 176.73%)' }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" id="signTxMessagesSummaryBox">
        <Typography component="div" variant="b1" fontWeight={500}>
          {intl.formatMessage(messages.summary)}
        </Typography>
        <Typography component="div" variant="h3" fontSize="24px" textAlign="right" id="signTxMessagesSummaryBox-total">
          {showOnlyTxFee ? total.fee : total.total} {total.ticker}
        </Typography>
      </Box>
      {(sent.length > 0 || received.length > 0) && (
        <>
          <Separator />
          <Box textAlign="right">
            {getAssetsSummaryDisplay({ txAssetsData, renderExplorerHashLink, intl })}
          </Box>
        </>
      )}
    </Box>
  );
}

export default (injectIntl(CardanoSignTxSummary): ComponentType<Props>);

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
