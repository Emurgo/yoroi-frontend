// @flow
import type { Node } from 'react';
import React, { Component, } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import type { MessageDescriptor, $npm$ReactIntl$IntlFormat } from 'react-intl';

import Dialog from '../../widgets/Dialog/Dialog';
import DialogCloseButton from '../../widgets/Dialog/DialogCloseButton';
import ErrorBlock from '../../widgets/ErrorBlock';
import WarningBox from '../../widgets/WarningBox';

import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';

import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import RawHash from '../../widgets/hashWrappers/RawHash';

import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import styles from './HWSendConfirmationDialog.scss';
import { truncateAddress, truncateToken } from '../../../utils/formatters';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import type {
  TokenLookupKey, TokenEntry,
} from '../../../api/common/lib/MultiToken';
import { getTokenName, genFormatTokenAmount, } from '../../../stores/stateless/tokenHelpers';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';

type ExpectedMessages = {|
  infoLine1: MessageDescriptor,
  infoLine2: MessageDescriptor,
  sendUsingHWButtonLabel: MessageDescriptor,
|};

type Props = {|
  +staleTx: boolean,
  +selectedExplorer: SelectedExplorer,
  +amount: MultiToken,
  +receivers: Array<string>,
  +totalAmount: MultiToken,
  +transactionFee: MultiToken,
  +messages: ExpectedMessages,
  +isSubmitting: boolean,
  +error: ?LocalizableError,
  +onSubmit: void => PossiblyAsync<void>,
  +onCancel: void => void,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +addressToDisplayString: string => string,
  +getCurrentPrice: (from: string, to: string) => ?string,
|};

@observer
export default class HWSendConfirmationDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  renderSingleAmount: TokenEntry => Node = (entry) => {
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);

    return (
      <div className={styles.amount}>{formatValue(entry)}
        <span className={styles.currencySymbol}>&nbsp;{
          truncateToken(getTokenName(this.props.getTokenInfo(entry)))
        }
        </span>
      </div>
    );
  }
  renderTotalAmount: TokenEntry => Node = (entry) => {
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);

    return (
      <div className={styles.totalAmount}>{formatValue(entry)}
        <span className={styles.currencySymbol}>&nbsp;{
          truncateToken(getTokenName(this.props.getTokenInfo(entry)))
        }
        </span>
      </div>
    );
  }
  renderSingleFee: TokenEntry => Node = (entry) => {
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);

    return (
      <div className={styles.fees}>
        +{formatValue(entry)}
        <span className={styles.currencySymbol}>&nbsp;{
          truncateToken(getTokenName(this.props.getTokenInfo(
            entry
          )))
        }
        </span>
      </div>
    );
  }

  renderBundle: {|
    amount: MultiToken,
    render: TokenEntry => Node,
  |} => Node = (request) => {
    return (
      <>
        {request.render(request.amount.getDefaultEntry())}
        {request.amount.nonDefaultEntries().map(entry => (
          <React.Fragment key={entry.identifier}>
            {request.render(entry)}
          </React.Fragment>
        ))}
      </>
    );
  }

  render(): Node {
    const { intl } = this.context;
    const {
      amount,
      receivers,
      isSubmitting,
      messages,
      error,
      onCancel,
    } = this.props;

    const staleTxWarning = (
      <div className={styles.warningBox}>
        <WarningBox>
          {intl.formatMessage(globalMessages.staleTxnWarningLine1)}<br />
          {intl.formatMessage(globalMessages.staleTxnWarningLine2)}
        </WarningBox>
      </div>
    );

    const infoBlock = (
      <div className={styles.infoBlock}>
        <ul>
          <li key="1"><span>{intl.formatMessage(messages.infoLine1)}</span><br /></li>
          <li key="2"><span>{intl.formatMessage(messages.infoLine2)}</span><br /></li>
        </ul>
      </div>);

    const addressBlock = (
      <div className={styles.addressToLabelWrapper}>
        <div className={styles.addressToLabel}>
          {intl.formatMessage(globalMessages.walletSendConfirmationAddressToLabel)}
        </div>
        {receivers.map((receiver, i) => (
          <ExplorableHashContainer
            key={receiver + i} // eslint-disable-line react/no-array-index-key
            selectedExplorer={this.props.selectedExplorer}
            hash={this.props.addressToDisplayString(receiver)}
            light
            linkType="address"
          >
            <RawHash light>
              <span className={styles.addressTo}>
                {truncateAddress(this.props.addressToDisplayString(receiver))}
              </span>
            </RawHash>
          </ExplorableHashContainer>
        ))}
      </div>);

    const amountBlock = (
      <div className={styles.amountFeesWrapper}>
        <div className={styles.amountWrapper}>
          <div className={styles.amountLabel}>
            {intl.formatMessage(globalMessages.amountLabel)}
          </div>
          {this.renderBundle({
            amount,
            render: this.renderSingleAmount,
          })}
        </div>

        <div className={styles.feesWrapper}>
          <div className={styles.feesLabel}>
            {intl.formatMessage(globalMessages.walletSendConfirmationFeesLabel)}
          </div>
          {this.renderBundle({
            amount: this.props.transactionFee,
            render: this.renderSingleFee,
          })}
        </div>
      </div>);

    const totalAmountBlock = (
      <div className={styles.totalAmountWrapper}>
        <div className={styles.totalAmountLabel}>
          {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
        </div>
        {this.renderBundle({
          amount: this.props.totalAmount,
          render: this.renderTotalAmount,
        })}
      </div>);

    const confirmButtonClasses = classnames([
      'confirmButton',
      isSubmitting ? styles.submitButtonSpinning : null,
    ]);
    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        disabled: isSubmitting,
        onClick: onCancel,
      },
      {
        label: intl.formatMessage(messages.sendUsingHWButtonLabel),
        onClick: this.props.onSubmit,
        primary: true,
        className: confirmButtonClasses,
        isSubmitting,
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={!isSubmitting ? onCancel : null}
        className={styles.dialog}
        closeButton={<DialogCloseButton />}
      >
        {this.props.staleTx && staleTxWarning}
        {infoBlock}
        {addressBlock}
        {amountBlock}
        {totalAmountBlock}
        <ErrorBlock error={error} />
      </Dialog>);
  }
}
