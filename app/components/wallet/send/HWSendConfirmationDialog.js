// @flow
import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import BigNumber from 'bignumber.js';
import type { MessageDescriptor } from 'react-intl';

import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import ErrorBlock from '../../widgets/ErrorBlock';
import WarningBox from '../../widgets/WarningBox';

import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';

import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import RawHash from '../../widgets/hashWrappers/RawHash';
import { formattedWalletAmount } from '../../../utils/formatters';

import type { ExplorerType } from '../../../domain/Explorer';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';

import styles from './HWSendConfirmationDialog.scss';

type ExpectedMessages = {
  infoLine1: MessageDescriptor,
  infoLine2: MessageDescriptor,
  sendUsingHWButtonLabel: MessageDescriptor,
};

type Props = {|
  staleTx: boolean,
  selectedExplorer: ExplorerType,
  amount: BigNumber,
  receivers: Array<string>,
  totalAmount: BigNumber,
  transactionFee: BigNumber,
  currencyUnit: string,
  amountToNaturalUnits: Function,
  messages: ExpectedMessages,
  isSubmitting: boolean,
  error: ?LocalizableError,
  onSubmit: void => void,
  onCancel: Function,
  classicTheme: boolean,
  unitOfAccountSetting: UnitOfAccountSettingType,
  coinPrice: ?number
|};

@observer
export default class HWSendConfirmationDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
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
      classicTheme,
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
            {intl.formatMessage(globalMessages.walletSendConfirmationAmountLabel)}
          </div>
          {unitOfAccountSetting.enabled ? (
            <Fragment>
              <div className={styles.amount}>
                {coinPrice ? amount.multipliedBy(coinPrice).toString() : '-'}
                &nbsp;{unitOfAccountSetting.currency}
              </div>
              <div className={styles.amountSmall}>{formattedWalletAmount(amount)}
                <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
              </div>
            </Fragment>
          ) : (
            <div className={styles.amount}>{formattedWalletAmount(amount)}
              <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
            </div>
          )}
        </div>

        <div className={styles.feesWrapper}>
          <div className={styles.feesLabel}>
            {intl.formatMessage(globalMessages.walletSendConfirmationFeesLabel)}
          </div>
          {unitOfAccountSetting.enabled ? (
            <Fragment>
              <div className={styles.fees}>+
                {coinPrice ? transactionFee.multipliedBy(coinPrice).toString() : '-'}
                &nbsp;{unitOfAccountSetting.currency}
              </div>
              <div className={styles.feesSmall}>+{formattedWalletAmount(transactionFee)}
                <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
              </div>
            </Fragment>
          ) : (
            <div className={styles.fees}>+{formattedWalletAmount(transactionFee)}
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
          <Fragment>
            <div className={styles.totalAmount}>
              {coinPrice ? totalAmount.multipliedBy(coinPrice).toString() : '-'}
              &nbsp;{unitOfAccountSetting.currency}
            </div>
            <div className={styles.totalAmountSmall}>{formattedWalletAmount(totalAmount)}
              <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
            </div>
          </Fragment>
        ) : (
          <div className={styles.totalAmount}>{formattedWalletAmount(totalAmount)}
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
        onClick: isSubmitting
          ? () => {} // noop
          : onCancel
      },
      {
        label: intl.formatMessage(messages.sendUsingHWButtonLabel),
        onClick: this.props.onSubmit,
        primary: true,
        className: confirmButtonClasses,
        disabled: isSubmitting,
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
        classicTheme={classicTheme}
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
