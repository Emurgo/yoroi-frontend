// @flow
import type { Node, ComponentType } from 'react';
import type { ConnectorIntl, Cip95Info } from '../../../types';
import type { SummaryAssetsData } from '../CardanoSignTxPage';
import BigNumber from 'bignumber.js';
import { defineMessages, injectIntl } from 'react-intl';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import CardanoSignTxSummary from './SignTxSummary';
import { ReactComponent as ExpandArrow } from '../../../assets/images/arrow-expand.inline.svg';
import { connectorMessages } from '../../../../i18n/global-messages';
import ErrorBlock from '../../../../components/widgets/ErrorBlock';
import LocalizableError from '../../../../i18n/LocalizableError';

const messages: Object = defineMessages({
  transactionFee: {
    id: 'connector.signin.transactionFee',
    defaultMessage: '!!!Transaction Fee',
  },
});


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
  cip95Info: Array<Cip95Info>,
|};

function CardanoSignTx({
  intl,
  txAssetsData,
  renderExplorerHashLink,
  passwordFormField,
  hwWalletError,
  walletType,
  cip95Info,
}: Props & ConnectorIntl): Node {
  const { total, isOnlyTxFee, sent, received } = txAssetsData;
  const isSendingNativeToken = Number(total.amount) < 0;
  const isReceivingNativeToken = Number(total.amount) > 0;

  return (
    <Box>
      <Box>
        <RenderCip95Info cip95Info={cip95Info} />
        <br />
      </Box>
      <CardanoSignTxSummary
        renderExplorerHashLink={renderExplorerHashLink}
        txAssetsData={txAssetsData}
      />
      <Panel id="signTxAdditionalInfoPanel">
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" id="signTxAdditionalInfoPanelBox">
          <Typography component="div" color="#4A5065" fontWeight={500}>
            {intl.formatMessage(messages.transactionFee)}
          </Typography>
          <Typography component="div" textAlign="right" color="#242838" id="signTxAdditionalInfoPanelBox-fee">
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
        <Typography component="div" color="#4A5065" fontWeight={500}>
          {panelTitle}
        </Typography>
        {isExpandable && (
          <Box sx={{ rotate: isExpanded ? '180deg' : 'none' }}>
            <ExpandArrow />
          </Box>
        )}
      </Box>

      {((total.amount.startsWith('-') && action === 'sent') || (
        !total.amount.startsWith('-') && action === 'received')) && (
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
  <Box mt="16px" id="asseetValueDisplayBox">
    <Typography component="div" textAlign="right" color="#242838">
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

const RenderCip95Info = ({
  cip95Info
}): Node => {
  function renderCoin(c) {
    try {
      return new BigNumber(c).div(1_000_000).toString();
    } catch (e) {
      console.error(e);
      return String(c);
    }
  }
  return [
    ...cip95Info.filter(c => c.type === 'StakeRegistrationCert').map((c, i) => {
      if (c.type !== 'StakeRegistrationCert') {
        throw new Error('unexpected type');
      }
      return (
        <div key={`StakeRegistrationCert${i}`}>
          <span>Register stake credential</span>
          {c.coin && (
            <span>with {renderCoin(c.coin)} ADA deposit</span>
          )}
        </div>
      );
    }),
    ...cip95Info.filter(c => c.type === 'StakeDeregistrationCert').map((c, i) => {
      if (c.type !== 'StakeDeregistrationCert') {
        throw new Error('unexpected type');
      }
      return (
        <div key={`StakeDeregistrationCert${i}`}>
          <span>Deregister stake credential</span>
          {c.coin && (
            <span>and return {renderCoin(c.coin)} ADA deposit</span>
          )}
        </div>
      );
    }),
    ...cip95Info.filter(c => c.type === 'StakeDelegationCert').map((c, i) => {
      if (c.type !== 'StakeDelegationCert') {
        throw new Error('unexpected type');
      }
      return (
        <div key={`StakeDelegationCert${i}`}>Stake delegation to the pool: {c.poolKeyHash}</div>
      );
    }),
    ...cip95Info.filter(c => c.type === 'VoteDelegCert').map((c, i) => {
      if (c.type !== 'VoteDelegCert') {
        throw new Error('unexpected type');
      }
      return (
        <div key={`VoteDelegCert${i}`}>Vote delegation to DRep: {c.drep}</div>
      );
    }),
    ...cip95Info.filter(c => c.type === 'StakeVoteDelegCert').map((c, i) => {
      if (c.type !== 'StakeVoteDelegCert') {
        throw new Error('unexpected type');
      }
      return (
        <div key={`StakeVoteDelegCert${i}`}>
          <div>Delegate to the stake pool ${c.poolKeyHash}</div>
          <div>and DRep ${c.drep}</div>
        </div>
      );
    }),
    ...cip95Info.filter(c => c.type === 'StakeRegDelegCert').map((c, i) => {
      if (c.type !== 'StakeRegDelegCert') {
        throw new Error('unexpected type');
      }
      return (
        <div key={`StakeRegDelegCert${i}`}>
          <div>Register your stake credential with deposit of {renderCoin(c.coin)} ADA and delegate to stake pool</div>
          <div>${c.poolKeyHash}</div>
        </div>
      );
    }),
    ...cip95Info.filter(c => c.type === 'VoteRegDelegCert').map((c, i) => {
      if (c.type !== 'VoteRegDelegCert') {
        throw new Error('unexpected type');
      }
      return (
        <div key={`VoteRegDelegCert${i}`}>
          <div>Register your stake credential with deposit of {renderCoin(c.coin)} ADA and delegate to the DRep</div>
          <div>${c.drep}</div>
        </div>
      );
    }),
    ...cip95Info.filter(c => c.type === 'StakeVoteRegDelegCert').map((c, i) => {
      if (c.type !== 'StakeVoteRegDelegCert') {
        throw new Error('unexpected type');
      }
      return (
        <div key={`StakeVoteRegDelegCert${i}`}>
          <div>Register your stake credential with deposit of {renderCoin(c.coin)} ADA and delegate to the DRep</div>
          <div>${c.drep} and the stake pool</div>
          <div>${c.poolKeyHash}</div>
        </div>
      );
    }),
    ...cip95Info.filter(c => c.type === 'RegDrepCert').map((c, i) => {
      if (c.type !== 'RegDrepCert') {
        throw new Error('unexpected type');
      }
      return (
        <div key={`RegDrepCert${i}`}>
          <div>Register DRep credential with deposit {renderCoin(c.coin)} ADA</div>
          {c.anchor && (
            <>
              <div>URL: {c.anchor.url}</div>
              <div>Hash: {c.anchor.dataHash}</div>
            </>
          )}
        </div>
      );
    }),
    ...cip95Info.filter(c => c.type === 'UnregDrepCert').map((c, i) => {
      if (c.type !== 'UnregDrepCert') {
        throw new Error('unexpected type');
      }
      return (
        <div key={`UnregDrepCert${i}`}>
          Unregister DRep credential and return {renderCoin(c.coin)} ADA deposit
        </div>
      );
    }),
    ...cip95Info.filter(c => c.type === 'UpdateDrepCert').map((c, i) => {
      if (c.type !== 'UpdateDrepCert') {
        throw new Error('unexpected type');
      }
      return (
        <div key={`UpdateDrepCert${i}`}>
          <div>Update DRep credential</div>
          {c.anchor && (
            <>
              <div>URL: {c.anchor.url}</div>
              <div>Hash: {c.anchor.dataHash}</div>
            </>
          )}
        </div>
      );
    }),
    ...cip95Info.filter(c => c.type === 'TreasuryValue').map((c, i) => {
      if (c.type !== 'TreasuryValue') {
        throw new Error('unexpected type');
      }
      return (
        <div key={`TreasuryValue${i}`}>Treasury value: {renderCoin(c.coin)} ADA</div>
      );
    }),
    ...cip95Info.filter(c => c.type === 'TreasuryDonation').map((c, i) => {
      if (c.type !== 'TreasuryDonation') {
        throw new Error('unexpected type');
      }
      return (
        <div key={`TreasuryDonation${i}`}>Treasury donation: {renderCoin(c.positiveCoin)} ADA</div>
      );
    }),
    ...cip95Info.filter(c => c.type === 'VotingProcedure').map((c, i) => {
      if (c.type !== 'VotingProcedure') {
        throw new Error('unexpected type');
      }
      return (
        <div key={`VotingProcedure${i}`}>
          <div>Voter: {c.voterHash}</div>
          <div>Governance action transaction: {c.govActionTxId}</div>
          <div>Governance action index: {c.govActionIndex}</div>
          <div>Vote: {['no', 'yes', 'abstain'][c.vote]}</div>
          {c.anchor && (
            <div>
              <div>URL: {c.anchor.url}</div>
              <div>Hash: {c.anchor.dataHash}</div>
            </div>
          )}
        </div>
      );
    }),
 ];
}
