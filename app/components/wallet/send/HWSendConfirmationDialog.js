// @flow
import type { Node } from 'react';
import React, { Component, } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import BigNumber from 'bignumber.js';
import type { MessageDescriptor, $npm$ReactIntl$IntlFormat } from 'react-intl';

import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import ErrorBlock from '../../widgets/ErrorBlock';
import WarningBox from '../../widgets/WarningBox';

import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';

import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import RawHash from '../../widgets/hashWrappers/RawHash';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';

import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import styles from './HWSendConfirmationDialog.scss';

type ExpectedMessages = {|
  infoLine1: MessageDescriptor,
  infoLine2: MessageDescriptor,
  sendUsingHWButtonLabel: MessageDescriptor,
|};

type Props = {|
  +staleTx: boolean,
  +selectedExplorer: SelectedExplorer,
  +amount: BigNumber,
  +receivers: Array<string>,
  +totalAmount: BigNumber,
  +transactionFee: BigNumber,
  +currencyUnit: string,
  +messages: ExpectedMessages,
  +isSubmitting: boolean,
  +error: ?LocalizableError,
  +onSubmit: void => PossiblyAsync<void>,
  +onCancel: void => void,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +coinPrice: ?number,
  +formattedWalletAmount: BigNumber => string,
|};

@observer
export default class HWSendConfirmationDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      amount,
      receivers,
      totalAmount,
      transactionFee,
      currencyUnit,
      isSubmitting,
      messages,
      error,
      onCancel,
      unitOfAccountSetting,
      coinPrice,
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
            hash={receiver}
            light
            linkType="address"
          >
            <RawHash light>
              <span className={styles.addressTo}>
                {receiver}
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
          {unitOfAccountSetting.enabled ? (
            <>
              <div className={styles.amount}>
                {coinPrice != null ? calculateAndFormatValue(amount, coinPrice) : '-'}
                &nbsp;{unitOfAccountSetting.currency}
              </div>
              <div className={styles.amountSmall}>{this.props.formattedWalletAmount(amount)}
                <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
              </div>
            </>
          ) : (
            <div className={styles.amount}>{this.props.formattedWalletAmount(amount)}
              <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
            </div>
          )}
        </div>

        <div className={styles.feesWrapper}>
          <div className={styles.feesLabel}>
            {intl.formatMessage(globalMessages.walletSendConfirmationFeesLabel)}
          </div>
          {unitOfAccountSetting.enabled ? (
            <>
              <div className={styles.fees}>+
                {coinPrice != null ? calculateAndFormatValue(transactionFee, coinPrice) : '-'}
                &nbsp;{unitOfAccountSetting.currency}
              </div>
              <div className={styles.feesSmall}>+{this.props.formattedWalletAmount(transactionFee)}
                <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
              </div>
            </>
          ) : (
            <div className={styles.fees}>+{this.props.formattedWalletAmount(transactionFee)}
              <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
            </div>
          )}
        </div>
      </div>);

    const totalAmountBlock = (
      <div className={styles.totalAmountWrapper}>
        <div className={styles.totalAmountLabel}>
          {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
        </div>
        {unitOfAccountSetting.enabled ? (
          <>
            <div className={styles.totalAmount}>
              {coinPrice != null ? calculateAndFormatValue(totalAmount, coinPrice) : '-'}
              &nbsp;{unitOfAccountSetting.currency}
            </div>
            <div className={styles.totalAmountSmall}>{this.props.formattedWalletAmount(totalAmount)}
              <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
            </div>
          </>
        ) : (
          <div className={styles.totalAmount}>{this.props.formattedWalletAmount(totalAmount)}
            <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
          </div>
        )}
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
