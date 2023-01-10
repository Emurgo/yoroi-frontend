/* eslint-disable no-nested-ternary */
// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { observer } from 'mobx-react';
import CopyableAddress from '../../../../components/widgets/CopyableAddress';
import type { Notification } from '../../../../types/notificationType';
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
import { MultiToken } from '../../../../api/common/lib/MultiToken';
import ExplorableHashContainer from '../../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../../domain/SelectedExplorer';
import { calculateAndFormatValue } from '../../../../utils/unit-of-account';
import type { CardanoConnectorSignRequest } from '../../../types';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';

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
        <span>{truncateToken(getTokenName(tokenInfo))}</span>
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

  displayUnAvailableToken: TokenEntry => Node = tokenEntry => {
    return (
      <>
        <span>+{tokenEntry.amount.toString()}</span>{' '}
        <span>{truncateAddressShort(tokenEntry.identifier)}</span>
      </>
    );
  };

  renderAmountDisplay: ({|
    entry: TokenEntry,
  |}) => Node = request => {
    const nameFromIdentifier = assetNameFromIdentifier(request.entry.identifier);
    const tokenInfo: ?$ReadOnly<TokenRow> = this._resolveTokenInfo(request.entry);

    const numberOfDecimals = tokenInfo ? tokenInfo.Metadata.numberOfDecimals : 0;
    const shiftedAmount = request.entry.amount.shiftedBy(-numberOfDecimals);
    const ticker = tokenInfo ? this.getTicker(tokenInfo) : nameFromIdentifier;

    let fiatAmountDisplay = null;

    if (false && this.props.unitOfAccountSetting.enabled === true) {
      const { currency } = this.props.unitOfAccountSetting;
      const price = this.props.getCurrentPrice(
        tokenInfo ? getTokenName(tokenInfo) : nameFromIdentifier,
        currency
      );
      if (price != null) {
        const fiatAmount = calculateAndFormatValue(shiftedAmount, price);
        const [beforeDecimal, afterDecimal] = fiatAmount.split('.');
        let beforeDecimalSigned;
        if (beforeDecimal.startsWith('-')) {
          beforeDecimalSigned = beforeDecimal;
        } else {
          beforeDecimalSigned = '+' + beforeDecimal;
        }
        fiatAmountDisplay = (
          <>
            <span>{beforeDecimalSigned}</span>
            {afterDecimal && <span>.{afterDecimal}</span>} {currency}
          </>
        );
      }
    }
    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
      shiftedAmount,
      numberOfDecimals
    );

    // we may need to explicitly add + for positive values
    const adjustedBefore = beforeDecimalRewards.startsWith('-')
      ? beforeDecimalRewards
      : '+' + beforeDecimalRewards;

    const cryptoAmountDisplay = (
      <>
        <span>{adjustedBefore}</span>
        <span>{afterDecimalRewards}</span> {ticker}
      </>
    );

    if (fiatAmountDisplay) {
      return (
        <>
          <div>{fiatAmountDisplay}</div>
          <div>{cryptoAmountDisplay}</div>
        </>
      );
    }
    return (
      <>
        <div>{cryptoAmountDisplay}</div>
      </>
    );
  };

  renderRow: ({|
    kind: string,
    address: {|
      address: string,
      value: MultiToken,
      isForeign: ?Boolean,
    |},
    addressIndex: number,
    transform?: BigNumber => BigNumber,
  |}) => Node = request => {
    const notificationElementId = `${request.kind}-address-${request.addressIndex}-copyNotification`;
    const divKey = identifier =>
      `${request.kind}-${request.address.address}-${request.addressIndex}-${identifier}`;
    const renderAmount = entry => {
      return (
        <div>
          {this.renderAmountDisplay({
            entry: {
              ...entry,
              amount: request.transform ? request.transform(entry.amount) : entry.amount,
            },
          })}
        </div>
      );
    };

    return (
      // eslint-disable-next-line react/no-array-index-key
      <Box
        key={divKey(request.address.value.getDefaultEntry().identifier)}
        display="grid"
        gridTemplateColumns="180px 1fr"
        alignItems="flex-start"
        py="16px"
        borderRadius="8px"
      >
        <CopyableAddress
          hash={this.props.addressToDisplayString(request.address.address)}
          elementId={notificationElementId}
          onCopyAddress={() =>
            this.props.onCopyAddressTooltip(request.address.address, notificationElementId)
          }
          notification={this.props.notification}
        >
          <ExplorableHashContainer
            selectedExplorer={this.props.selectedExplorer}
            hash={this.props.addressToDisplayString(request.address.address)}
            light
            linkType="address"
          >
            <Typography as="span" color="var(--yoroi-palette-gray-600)">
              {truncateAddressShort(this.props.addressToDisplayString(request.address.address), 10)}
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
          {renderAmount(request.address.value.getDefaultEntry())}
          {request.address.value.nonDefaultEntries().map(entry => (
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
    const foreignOutputs = txData.outputs.filter(o => {
      return o.isForeign;
    });
    return (
      <Box>
        <Box>
          <Box pb="10px">
            <Typography variant="body1" fontWeight="500" color="#000">
              {intl.formatMessage(globalMessages.fromAddresses)}
              <span>: {txData.inputs.length}</span>
            </Typography>
          </Box>
          <Panel>
            <Box>
              <Typography variant="body1" fontWeight="500" color="#4A5065">
                {/* TODO: use intl */}
                Your Addresses
              </Typography>
              <Box>
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
                  <Typography variant="body1" fontWeight="500" color="#4A5065">
                    {/* TODO: use intl */}
                    Foreign Addresses
                  </Typography>
                  <Box>
                    {txData.foreignInputs.map((address, addressIndex) => {
                      return this.renderRow({
                        kind: 'in',
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
            <Typography variant="body1" fontWeight="500" color="#000">
              {intl.formatMessage(globalMessages.toAddresses)}
              <span>: {txData.outputs.length}</span>
            </Typography>
          </Box>
          <Panel withMargin={false}>
            <Box>
              {/* TODO: use intl */}
              <Typography variant="body1" fontWeight="500" color="#4A5065">
                Your Addresses
              </Typography>
              <Box>
                {txData.outputs
                  .filter(o => !o.isForeign)
                  .map((address, addressIndex) => {
                    return this.renderRow({
                      kind: 'in',
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
                <Box>
                  {/* TODO: use intl */}
                  <Typography variant="body1" fontWeight="500" color="#4A5065">
                    Foreign Addresses
                  </Typography>
                  <Box>
                    {foreignOutputs.map((address, addressIndex) => {
                      return this.renderRow({
                        kind: 'in',
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
