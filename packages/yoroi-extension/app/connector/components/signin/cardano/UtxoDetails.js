// @flow
/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { connectorMessages } from '../../../../i18n/global-messages';
import { observer } from 'mobx-react';
import CopyableAddress from '../../../../components/widgets/CopyableAddress';
import type { Notification } from '../../../../types/notification.types';
import { splitAmount, truncateAddressShort, truncateToken } from '../../../../utils/formatters';
import type { TokenLookupKey, TokenEntry } from '../../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import {
  getTokenName,
  getTokenIdentifierIfExists,
  assetNameFromIdentifier,
} from '../../../../stores/stateless/tokenHelpers';
import BigNumber from 'bignumber.js';
import type { UnitOfAccountSettingType } from '../../../../types/unitOfAccountType';
import ExplorableHashContainer from '../../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../../domain/SelectedExplorer';
import type { CardanoConnectorSignRequest, TxDataInput, TxDataOutput } from '../../../types';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { ReactComponent as ExternalLinkIcon } from '../../../assets/images/external-link.inline.svg';

type Props = {|
  +txData: CardanoConnectorSignRequest,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => ?$ReadOnly<TokenRow>,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +addressToDisplayString: string => string,
  +selectedExplorer: SelectedExplorer,
  +getCurrentPrice: (from: string, to: string) => ?string,
|};

@observer
class CardanoUtxoDetails extends Component<Props> {
  static contextTypes: {|
    intl: $npm$ReactIntl$IntlFormat,
  |} = {
    intl: intlShape.isRequired,
  };

  getTicker: ($ReadOnly<TokenRow>) => Node = tokenInfo => {
    const fingerprint = this.getFingerprint(tokenInfo);
    return fingerprint !== undefined ? (
      <ExplorableHashContainer
        selectedExplorer={this.props.selectedExplorer}
        hash={fingerprint}
        light
        linkType="token"
      >
        <span>{truncateToken(getTokenName(tokenInfo))}</span> <ExternalLinkIcon />
      </ExplorableHashContainer>
    ) : (
      truncateToken(getTokenName(tokenInfo))
    );
  };

  getFingerprint: ($ReadOnly<TokenRow>) => string | void = tokenInfo => {
    if (tokenInfo.Metadata.type === 'Cardano') {
      return getTokenIdentifierIfExists(tokenInfo);
    }
    return undefined;
  };

  // Tokens can be minted inside the transaction so we have to look it up there first
  _resolveTokenInfo: TokenEntry => ?$ReadOnly<TokenRow> = tokenEntry => {
    return this.props.getTokenInfo(tokenEntry);
  };

  renderAmountDisplay: ({|
    entry: TokenEntry,
  |}) => Node = request => {
    const nameFromIdentifier = assetNameFromIdentifier(request.entry.identifier);
    const tokenInfo: ?$ReadOnly<TokenRow> = this._resolveTokenInfo(request.entry);

    const numberOfDecimals = tokenInfo ? tokenInfo.Metadata.numberOfDecimals : 0;
    const shiftedAmount = request.entry.amount.shiftedBy(-numberOfDecimals);
    const ticker = tokenInfo ? this.getTicker(tokenInfo) : nameFromIdentifier;

    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
      shiftedAmount,
      numberOfDecimals
    );

    // we may need to explicitly add + for positive values
    const adjustedBefore = beforeDecimalRewards.startsWith('-')
      ? beforeDecimalRewards
      : '+' + beforeDecimalRewards;

    return (
      <div>
        <span>{adjustedBefore}</span>
        <span>{afterDecimalRewards}</span> {ticker}
      </div>
    );
  };

  renderRow: ({|
    kind: string,
    address: TxDataInput | TxDataOutput,
    addressIndex: number,
    transform?: BigNumber => BigNumber,
  |}) => Node = request => {
    if (!Boolean(request.address)) return null;

    const addressValue = request.address.value;

    if (addressValue == null) return null;

    const notificationElementId = `${request.kind}-address-${request.addressIndex}-copyNotification`;
    const divKey = identifier =>
      `${request.kind}-${request.address.address}-${request.addressIndex}-${identifier}`;
    const renderAmount = entry => {
      return (
        <div id="addressRow-amount">
          {this.renderAmountDisplay({
            entry: {
              ...entry,
              amount: request.transform ? request.transform(entry.amount) : entry.amount,
            },
          })}
        </div>
      );
    };

    const addressHash = request.address.address
      ? this.props.addressToDisplayString(request.address.address)
      : '';

    return (
      // eslint-disable-next-line react/no-array-index-key
      <Box
        key={divKey(addressValue.getDefaultEntry().identifier)}
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        py="16px"
        borderRadius="8px"
        id="addressRow"
      >
        <CopyableAddress
          id={'utxoDetails_' + request.addressIndex}
          hash={addressHash}
          elementId={notificationElementId}
          onCopyAddress={() =>
            this.props.onCopyAddressTooltip(request.address.address, notificationElementId)
          }
          notification={this.props.notification}
        >
          <ExplorableHashContainer
            selectedExplorer={this.props.selectedExplorer}
            hash={addressHash}
            light
            linkType="address"
          >
            <Typography as="span" color="#242838">
              {truncateAddressShort(addressHash, 10)}
            </Typography>
          </ExplorableHashContainer>
        </CopyableAddress>
        <Box
          textAlign="right"
          color="var(--yoroi-palette-gray-600)"
          sx={{
            '& > *': {
              paddingTop: '6px',
              ':first-child': {
                color: 'var(--yoroi-palette-gray-900)',
              },
            },
          }}
        >
          {renderAmount(addressValue.getDefaultEntry())}
          {addressValue.nonDefaultEntries().map(entry => (
            <React.Fragment key={divKey(entry.identifier)}>
              <div />
              <div />
              {renderAmount(entry)}
            </React.Fragment>
          ))}
        </Box>
      </Box>
    );
  };

  render(): Node {
    const { intl } = this.context;
    const { txData } = this.props;
    const foreignOutputs = txData.outputs.filter(o => o.isForeign);

    return (
      <Box>
        <Box>
          <Box pb="10px">
            <Typography component="div" variant="body1" fontWeight="500" color="#000">
              {intl.formatMessage(connectorMessages.fromAddresses, { qty: txData.inputs.length })}
            </Typography>
          </Box>
          <Panel>
            <Box>
              <Typography component="div" variant="body1" fontWeight="500" color="#4A5065">
                {intl.formatMessage(connectorMessages.yourAddresses)}
              </Typography>
              <Box id="fromAddressesBox-yourInputs">
                {txData.inputs.map((address, addressIndex) => {
                  return this.renderRow({
                    kind: 'in',
                    address,
                    addressIndex,
                    transform: amount => amount.abs().negated(),
                  });
                })}
              </Box>
            </Box>

            {txData.foreignInputs.length > 0 && (
              <>
                <Separator />
                <Box>
                  <Typography component="div" variant="body1" fontWeight="500" color="#4A5065">
                    {intl.formatMessage(connectorMessages.foreignAddresses)}
                  </Typography>
                  <Box id="fromAddressesBox-foreignInputs">
                    {txData.foreignInputs.map((address, addressIndex) => {
                      return this.renderRow({
                        kind: 'in-foreign',
                        address,
                        addressIndex,
                        transform: amount => amount.abs().negated(),
                      });
                    })}
                  </Box>
                </Box>
              </>
            )}
          </Panel>
        </Box>
        <Box>
          <Box pb="10px">
            <Typography component="div" variant="body1" fontWeight="500" color="#000">
              {intl.formatMessage(connectorMessages.toAddresses, { qty: txData.outputs.length })}
            </Typography>
          </Box>
          <Panel withMargin={false}>
            <Box>
              <Typography component="div" variant="body1" fontWeight="500" color="#4A5065">
                {intl.formatMessage(connectorMessages.yourAddresses)}
              </Typography>
              <Box id="toAddressesBox-yourOutputs">
                {txData.outputs
                  .filter(o => !o.isForeign)
                  .map((address, addressIndex) => {
                    return this.renderRow({
                      kind: 'out',
                      address,
                      addressIndex,
                      transform: amount => amount.abs(),
                    });
                  })}
              </Box>
            </Box>
            {foreignOutputs.length > 0 && (
              <>
                <Separator />
                <Box id="toAddressesBox-foreignOutputs">
                  <Typography component="div" variant="body1" fontWeight="500" color="#4A5065">
                    {intl.formatMessage(connectorMessages.foreignAddresses)}
                  </Typography>
                  <Box>
                    {foreignOutputs.map((address, addressIndex) => {
                      return this.renderRow({
                        kind: 'out-foreign',
                        address,
                        addressIndex,
                        transform: amount => amount.abs(),
                      });
                    })}
                  </Box>
                </Box>
              </>
            )}
          </Panel>
        </Box>
      </Box>
    );
  }
}

const Panel = ({ children, withMargin = true }) => (
  <Box
    sx={{
      border: '1px solid #DCE0E9',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: withMargin ? '40px' : 0,
    }}
  >
    {children}
  </Box>
);

const Separator = () => (
  <Box sx={{ height: '1px', width: '100%', backgroundColor: '#DCE0E9', mt: '16px', mb: '16px' }} />
);

export default CardanoUtxoDetails;
