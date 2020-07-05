// @flow
import React, { Component, } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import BigNumber from 'bignumber.js';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import styles from './TransferSummaryPage.scss';
import LocalizableError from '../../i18n/LocalizableError';
import RawHash from '../widgets/hashWrappers/RawHash';
import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';
import ExplorableHashContainer from '../../containers/widgets/ExplorableHashContainer';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { calculateAndFormatValue } from '../../utils/unit-of-account';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { SelectedExplorer } from '../../domain/SelectedExplorer';

const messages = defineMessages({
  addressFromLabel: {
    id: 'transfer.summary.addressFrom.label',
    defaultMessage: '!!!From',
  },
  addressToLabel: {
    id: 'transfer.summary.addressTo.label',
    defaultMessage: '!!!To',
  },
  recoveredBalanceLabel: {
    id: 'transfer.summary.recoveredBalance.label',
    defaultMessage: '!!!Recovered balance',
  },
  transactionFeeLabel: {
    id: 'transfer.summary.transactionFee.label',
    defaultMessage: '!!!Transaction fees',
  },
  finalBalanceLabel: {
    id: 'transfer.summary.finalBalance.label',
    defaultMessage: '!!!Final balance',
  },
  transferButtonLabel: {
    id: 'transfer.summary.transferButton.label',
    defaultMessage: '!!!Transfer Funds',
  },
  addressFromSubLabel: {
    id: 'yoroiTransfer.summary.addressFrom.subLabel',
    defaultMessage: '!!!Wallet Addresses',
  }
});

type Props = {|
  +dialogTitle: string,
  +formattedWalletAmount: BigNumber => string,
  +selectedExplorer: SelectedExplorer,
  +transferTx: {|
    +recoveredBalance: BigNumber,
    +fee: BigNumber,
    +id?: string,
    +senders: Array<string>,
    +receiver: string,
    +encodedTx?: Uint8Array,
  |},
  +onSubmit: void => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +onCancel: void => void,
  +error: ?LocalizableError,
  +form: ?Node,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +coinPrice: ?number,
|};

/** Show user what the transfer would do to get final confirmation */
@observer
export default class TransferSummaryPage extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  wrapInDialog: Node => Node = (content) => {
    const { intl } = this.context;
    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: this.props.onCancel,
        className: classnames(['cancelTransferButton']),
        disabled: this.props.isSubmitting,
      },
      {
        label: intl.formatMessage(globalMessages.nextButtonLabel),
        onClick: this.props.onSubmit,
        primary: true,
        className: classnames(['transferButton']),
        isSubmitting: this.props.isSubmitting,
      },
    ];
    return (
      <Dialog
        styleOveride={{ '--theme-modal-min-max-width-cmn': '680px' }}
        title={this.props.dialogTitle}
        actions={actions}
        closeButton={<DialogCloseButton />}
        onClose={this.props.onCancel}
        closeOnOverlayClick={false}
      >
        {content}
      </Dialog>
    );
  }

  render(): Node {
    const { intl } = this.context;
    const { transferTx, isSubmitting, error, unitOfAccountSetting, coinPrice, } = this.props;

    const receiver = transferTx.receiver;
    const recoveredBalance = this.props.formattedWalletAmount(transferTx.recoveredBalance);
    const transactionFee = this.props.formattedWalletAmount(transferTx.fee);
    const finalBalance = this.props.formattedWalletAmount(
      transferTx.recoveredBalance.minus(transferTx.fee)
    );

    return this.wrapInDialog(
      <div className={styles.body}>

        <div className={styles.addressLabelWrapper}>
          <div className={styles.addressLabel}>
            {intl.formatMessage(messages.addressFromLabel)}
          </div>
          <div className={styles.addressSubLabel}>
            {intl.formatMessage(messages.addressFromSubLabel)}
          </div>
          {
            transferTx.senders.map((sender, index) => {
              const addressesClasses = classnames([
                'addressRecovered-' + (index + 1),
                styles.address
              ]);

              return (
                <div
                  key={index /* eslint-disable-line react/no-array-index-key */}
                >
                  <div className={styles.addressSubLabel} />
                  <ExplorableHashContainer
                    selectedExplorer={this.props.selectedExplorer}
                    light
                    hash={sender}
                    linkType="address"
                  >
                    <RawHash light>
                      <span className={addressesClasses}>{sender}</span>
                    </RawHash>
                  </ExplorableHashContainer>
                </div>
              );
            })
          }
        </div>

        <div className={styles.addressLabelWrapper}>
          <div className={styles.addressLabel}>
            {intl.formatMessage(messages.addressToLabel)}
          </div>
          <ExplorableHashContainer
            selectedExplorer={this.props.selectedExplorer}
            light
            hash={receiver}
            linkType="address"
          >
            <RawHash light>
              <span className={styles.address}>{receiver}</span>
            </RawHash>
          </ExplorableHashContainer>
        </div>

        {transferTx.id != null && (this._getTxIdNode(transferTx.id))}

        <div className={styles.amountFeesWrapper}>
          <div className={styles.amountWrapper}>
            <div className={styles.amountLabel}>
              {intl.formatMessage(messages.recoveredBalanceLabel)}
            </div>
            {unitOfAccountSetting.enabled ? (
              <>
                <div className={styles.amount}>
                  {coinPrice != null
                    ? calculateAndFormatValue(transferTx.recoveredBalance, coinPrice)
                    : '-'
                  }
                  <span className={styles.currencySymbol}>&nbsp;
                    {unitOfAccountSetting.currency}
                  </span>
                </div>
                <div className={styles.amountSmall}>{recoveredBalance}
                  <span className={styles.currencySymbol}>&nbsp;ADA</span>
                </div>
              </>
            ) : (
              <div className={styles.amount}>{recoveredBalance}
                <span className={styles.currencySymbol}>&nbsp;ADA</span>
              </div>
            )}
          </div>

          <div className={styles.feesWrapper}>
            <div className={styles.feesLabel}>
              {intl.formatMessage(messages.transactionFeeLabel)}
            </div>
            {unitOfAccountSetting.enabled ? (
              <>
                <div className={styles.fees}>
                  {'+' + (coinPrice != null
                    ? calculateAndFormatValue(transferTx.fee, coinPrice)
                    : '-'
                  )}
                  <span className={styles.currencySymbol}>&nbsp;
                    {unitOfAccountSetting.currency}
                  </span>
                </div>
                <div className={styles.feesSmall}>+{transactionFee}
                  <span className={styles.currencySymbol}>&nbsp;ADA</span>
                </div>
              </>
            ) : (
              <div className={styles.fees}>+{transactionFee}
                <span className={styles.currencySymbol}>&nbsp;ADA</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.totalAmountWrapper}>
          <div className={styles.totalAmountLabel}>
            {intl.formatMessage(messages.finalBalanceLabel)}
          </div>
          {unitOfAccountSetting.enabled ? (
            <>
              <div className={styles.totalAmount}>
                {coinPrice != null
                  ? calculateAndFormatValue(
                    transferTx.recoveredBalance.minus(transferTx.fee),
                    coinPrice
                  )
                  : '-'
                }
                <span className={styles.currencySymbol}>&nbsp;
                  {unitOfAccountSetting.currency}
                </span>
              </div>
              <div className={styles.totalAmountSmall}>{finalBalance}
                <span className={styles.currencySymbol}>&nbsp;ADA</span>
              </div>
            </>
          ) : (
            <div className={styles.totalAmount}>{finalBalance}
              <span className={styles.currencySymbol}>&nbsp;ADA</span>
            </div>
          )}
        </div>

        {this.props.form != null && (
          <div className={styles.form}>
            {this.props.form}
          </div>
        )}

        <div className={styles.errorWrapper}>
          {
            error && !isSubmitting &&
              <p className={styles.error}>{intl.formatMessage(error)}</p>
          }
        </div>
      </div>
    );
  }

  _getTxIdNode: string => Node = (txId) => {
    const { intl } = this.context;
    return (
      <div className={styles.addressLabelWrapper}>
        <div className={styles.addressLabel}>
          {intl.formatMessage(globalMessages.transactionId)}
        </div>
        <ExplorableHashContainer
          selectedExplorer={this.props.selectedExplorer}
          light
          hash={txId}
          linkType="transaction"
        >
          <RawHash light>
            <span className={styles.address}>{txId}</span>
          </RawHash>
        </ExplorableHashContainer>
      </div>
    );
  }
}
