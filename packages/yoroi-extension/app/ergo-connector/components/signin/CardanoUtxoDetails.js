/* eslint-disable no-nested-ternary */
// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './UtxoDetails.scss';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import CopyableAddress from '../../../components/widgets/CopyableAddress';
import type { Notification } from '../../../types/notificationType';
import { splitAmount, truncateAddressShort, truncateToken } from '../../../utils/formatters';
import ProgressBar from '../ProgressBar';
import type {
  TokenLookupKey,
  TokenEntry,
} from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import {
  getTokenName,
  getTokenIdentifierIfExists,
  assetNameFromIdentifier
} from '../../../stores/stateless/tokenHelpers';
import BigNumber from 'bignumber.js';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import classnames from 'classnames';
import ArrowLeft from '../../../assets/images/arrow-left.inline.svg'
import type { CardanoConnectorSignRequest } from '../../types';

type Props = {|
  +txData: CardanoConnectorSignRequest,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => ?$ReadOnly<TokenRow>,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +addressToDisplayString: string => string,
  +selectedExplorer: SelectedExplorer,
  +getCurrentPrice: (from: string, to: string) => ?number,
  +toggleUtxoDetails: (newState: boolean) => void
|};

const messages = defineMessages({
  utxoDetails: {
    id: 'connector.signin.txDetails',
    defaultMessage: '!!!Transaction Details',
  }
});

@observer
class CardanoUtxoDetails extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };


  getTicker: $ReadOnly<TokenRow> => Node = tokenInfo => {
    const fingerprint = this.getFingerprint(tokenInfo);
    return fingerprint !== undefined
      ? (
        <ExplorableHashContainer
          selectedExplorer={this.props.selectedExplorer}
          hash={fingerprint}
          light
          linkType="token"
        >
          <span className={styles.rowData}>{truncateToken(getTokenName(tokenInfo))}</span>
        </ExplorableHashContainer>
      )
      : truncateToken(getTokenName(tokenInfo))
  };

  getFingerprint: $ReadOnly<TokenRow> => string | void = tokenInfo => {
    if (tokenInfo.Metadata.type === 'Cardano') {
      return getTokenIdentifierIfExists(tokenInfo);
    }
    return undefined;
  }

  // Tokens can be minted inside the transaction so we have to look it up there first
  _resolveTokenInfo: TokenEntry => ?$ReadOnly<TokenRow> = tokenEntry => {
    return this.props.getTokenInfo(tokenEntry);
  }

  displayUnAvailableToken: TokenEntry => Node = (tokenEntry) => {
    return (
      <>
        <span className={styles.amountRegular}>{'+'}{tokenEntry.amount.toString()}</span>
        {' '}
        <span>
          {truncateAddressShort(
           tokenEntry.identifier
          )}
        </span>
      </>
    )
  }

  renderAmountDisplay: {|
    entry: TokenEntry,
  |} => Node = (request) => {
    const tokenInfo = this._resolveTokenInfo(request.entry);
    const numberOfDecimals = tokenInfo ? tokenInfo.Metadata.numberOfDecimals : 0;
    const shiftedAmount = request.entry.amount.shiftedBy(-numberOfDecimals);
    const ticker = tokenInfo ? this.getTicker(tokenInfo)
      : assetNameFromIdentifier(request.entry.identifier);

    if (this.props.unitOfAccountSetting.enabled === true) {
      const { currency } = this.props.unitOfAccountSetting;
      const price = this.props.getCurrentPrice(
        request.entry.identifier,
        currency
      );
      if (price != null) {
        return (
          <>
            <span className={styles.amountRegular}>
              {calculateAndFormatValue(shiftedAmount, price)}
            </span>
            {' '}{currency}
            <div className={styles.amountSmall}>
              {shiftedAmount.toString()} {ticker}
            </div>
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

    return (
      <>
        <span className={styles.amountRegular}>{adjustedBefore}</span>
        <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
        {' '}{ticker}
      </>
    );
  }


  renderRow: {|
    kind: string,
    address: {| address: string, value: MultiToken |},
    addressIndex: number,
    transform?: BigNumber => BigNumber,
  |} => Node = (request) => {
    const notificationElementId = `${request.kind}-address-${request.addressIndex}-copyNotification`;
    const divKey = (identifier) => `${request.kind}-${request.address.address}-${request.addressIndex}-${identifier}`;
    const renderAmount = (entry) => {
      return (
        <div className={styles.amount}>
          {this.renderAmountDisplay({
            entry: {
              ...entry,
              amount: request.transform
                ? request.transform(entry.amount)
                : entry.amount,
            },
          })}
        </div>
      );
    };

    return (
      // eslint-disable-next-line react/no-array-index-key
      <div
        key={divKey(request.address.value.getDefaultEntry().identifier)}
        className={styles.addressItem}
      >
        <CopyableAddress
          hash={this.props.addressToDisplayString(request.address.address)}
          elementId={notificationElementId}
          onCopyAddress={
            () => this.props.onCopyAddressTooltip(request.address.address, notificationElementId)
          }
          notification={this.props.notification}
        >
          <ExplorableHashContainer
            selectedExplorer={this.props.selectedExplorer}
            hash={this.props.addressToDisplayString(request.address.address)}
            light
            linkType="address"
          >
            <span className={classnames([styles.rowData, styles.hash])}>
              {truncateAddressShort(
                this.props.addressToDisplayString(request.address.address), 10
              )}
            </span>
          </ExplorableHashContainer>
        </CopyableAddress>
        {renderAmount(request.address.value.getDefaultEntry())}
        {request.address.value.nonDefaultEntries().map(entry => (
          <React.Fragment key={divKey(entry.identifier)}>
            <div />
            <div />
            {renderAmount(entry)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  render(): Node {
    const { intl } = this.context;
    const { txData } = this.props;

    return (
      <>
        <ProgressBar step={2} />
        <div className={styles.component}>
          <div>
            <button onClick={() => this.props.toggleUtxoDetails(false)} className={styles.back} type='button'>
              <ArrowLeft />
              <p>{intl.formatMessage(messages.utxoDetails)}</p>
            </button>
          </div>
          <div>
            <div className={styles.addressHeader}>
              <div className={styles.addressFrom}>
                <p className={styles.label}>
                  {intl.formatMessage(globalMessages.fromAddresses)}:{' '}
                  <span>{txData.inputs.length}</span>
                </p>
              </div>
              <div className={styles.addressFrom}>
                <p className={styles.label}>
                  {intl.formatMessage(globalMessages.amount)}
                </p>
              </div>
            </div>
            <div className={styles.addressFromList}>
              {txData.inputs.map((address, addressIndex) => {
                return this.renderRow({
                  kind: 'in',
                  address,
                  addressIndex,
                  transform: amount => amount.abs().negated(),
                });
              })}
            </div>
            <div className={styles.addressHeader}>
              <div className={styles.addressTo}>
                <p className={styles.label}>
                  {intl.formatMessage(globalMessages.toAddresses)}:{' '}
                  <span>{txData.outputs.length}</span>
                </p>
              </div>
              <div className={styles.addressTo}>
                <p className={styles.label}>
                  {intl.formatMessage(globalMessages.amount)}
                </p>
              </div>
            </div>
            <div className={styles.addressToList}>
              {txData.outputs.map((address, addressIndex) => {
                return this.renderRow({
                  kind: 'out',
                  address,
                  addressIndex,
                  transform: amount => amount.abs(),
                });
              })}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default CardanoUtxoDetails;
