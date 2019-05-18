// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';
import { NumericInput } from 'react-polymorph/lib/components/NumericInput';
import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
import { CheckboxSkin } from 'react-polymorph/lib/skins/simple/CheckboxSkin';
import { defineMessages, intlShape } from 'react-intl';
import BigNumber from 'bignumber.js';
import SvgInline from 'react-svg-inline';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import AmountInputSkin from '../skins/AmountInputSkin';
import BorderedBox from '../../widgets/BorderedBox';
import styles from './WalletSendForm.scss';
import globalMessages from '../../../i18n/global-messages';
import WalletSendConfirmationDialog from './WalletSendConfirmationDialog';
import HWSendConfirmationDialog from './HWSendConfirmationDialog';
import {
  formattedAmountToBigNumber,
  formattedAmountToNaturalUnits
} from '../../../utils/formatters';
import dangerIcon from '../../../assets/images/danger.inline.svg';
import config from '../../../config';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';

const messages = defineMessages({
  titleLabel: {
    id: 'wallet.send.form.title.label',
    defaultMessage: '!!!Title',
  },
  titleHint: {
    id: 'wallet.send.form.title.hint',
    defaultMessage: '!!!E.g: Money for Frank',
  },
  receiverLabel: {
    id: 'wallet.send.form.receiver.label',
    defaultMessage: '!!!Receiver',
  },
  receiverHint: {
    id: 'wallet.send.form.receiver.hint',
    defaultMessage: '!!!Wallet Address',
  },
  amountLabel: {
    id: 'wallet.send.form.amount.label',
    defaultMessage: '!!!Amount',
  },
  equalsAdaHint: {
    id: 'wallet.send.form.amount.equalsAda',
    defaultMessage: '!!!equals {amount} ADA',
  },
  descriptionLabel: {
    id: 'wallet.send.form.description.label',
    defaultMessage: '!!!Description',
  },
  descriptionHint: {
    id: 'wallet.send.form.description.hint',
    defaultMessage: '!!!You can add a message if you want',
  },
  checkboxLabel: {
    id: 'wallet.send.form.description.checkboxLabel',
    defaultMessage: '!!!Use all my ADA',
  },
  invalidAddress: {
    id: 'wallet.send.form.errors.invalidAddress',
    defaultMessage: '!!!Please enter a valid address.',
  },
  invalidAmount: {
    id: 'wallet.send.form.errors.invalidAmount',
    defaultMessage: '!!!Please enter a valid amount.',
  },
  invalidTitle: {
    id: 'wallet.send.form.errors.invalidTitle',
    defaultMessage: '!!!Please enter a title with at least 3 characters.',
  },
  transactionFeeError: {
    id: 'wallet.send.form.transactionFeeError',
    defaultMessage: '!!!Not enough Ada for fees. Try sending a smaller amount.',
  },
  calculatingFee: {
    id: 'wallet.send.form.calculatingFee',
    defaultMessage: '!!!Calculating fee...',
  },
  sendingIsDisabled: {
    id: 'wallet.send.form.sendingIsDisabled',
    defaultMessage: '!!!Cannot send a transaction while there is a pending one',
  },
});

type Props = {
  currencyUnit: string,
  currencyMaxIntegerDigits: number,
  currencyMaxFractionalDigits: number,
  hasAnyPending: boolean,
  isHardwareWallet: boolean,
  validateAmount: (amountInNaturalUnits: string) => Promise<boolean>,
  calculateTransactionFee: (
    receiver: string,
    amount: string,
    shouldSendAll: boolean
  ) => Promise<BigNumber>,
  addressValidator: Function,
  openDialogAction: Function,
  isDialogOpen: Function,
  webWalletConfirmationDialogRenderCallback: Function,
  hardwareWalletConfirmationDialogRenderCallback: Function,
  totalBalance: BigNumber,
  classicTheme: boolean,
};

type State = {
  isTransactionFeeCalculated: boolean,
  transactionFee: BigNumber,
  transactionFeeError: ?string,
  shouldSendAll: boolean
};

@observer
export default class WalletSendForm extends Component<Props, State> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    isTransactionFeeCalculated: false,
    transactionFee: new BigNumber(0),
    transactionFeeError: null,
    shouldSendAll: false
  };

  /** We need to track form submitting state in order to avoid calling
    * calculate/reset transaction fee functions which causes them to flicker */
  _isSubmitting = false;

  /** We need to track the mounted state in order to avoid calling
    * setState promise handling code after the component was already unmounted:
    * TODO: https://facebook.github.io/react/blog/2015/12/16/ismounted-antipattern.html */
  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  setShouldSendAll(newState: boolean) {
    this.setState({ shouldSendAll: newState });
  }

  // FORM VALIDATION
  form = new ReactToolboxMobxForm({
    fields: {
      receiver: {
        label: this.context.intl.formatMessage(messages.receiverLabel),
        placeholder: this.context.intl.formatMessage(messages.receiverHint),
        value: '',
        validators: [({ field }) => {
          const receiverValue = field.value;
          if (receiverValue === '') {
            this._resetTransactionFee();
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          return this.props.addressValidator(receiverValue)
            .then(isValidReceiver => {
              this._updateTxValues(this.state.shouldSendAll);
              return [isValidReceiver, this.context.intl.formatMessage(messages.invalidAddress)];
            });
        }],
      },
      amount: {
        label: this.context.intl.formatMessage(messages.amountLabel),
        placeholder: `0.${'0'.repeat(this.props.currencyMaxFractionalDigits)}`,
        value: '',
        validators: [async ({ field }) => {
          const amountValue = field.value;
          if (amountValue === '') {
            this._resetTransactionFee();
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          const isValidAmount = await this.props.validateAmount(
            formattedAmountToNaturalUnits(amountValue)
          );
          const { shouldSendAll } = this.state;
          if (!shouldSendAll) {
            this._updateTxValues(this.state.shouldSendAll);
          }
          return [isValidAmount, this.context.intl.formatMessage(messages.invalidAmount)];
        }],
      },
    },
  }, {
    options: {
      validateOnBlur: false,
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
  });

  render() {
    const { form } = this;
    const { intl } = this.context;

    const {
      currencyUnit,
      currencyMaxIntegerDigits,
      currencyMaxFractionalDigits,
      hasAnyPending,
      classicTheme,
    } = this.props;
    const {
      transactionFee,
      transactionFeeError,
      shouldSendAll
    } = this.state;

    const amountField = form.$('amount');
    const receiverField = form.$('receiver');
    const amountFieldProps = amountField.bind();
    const totalAmount = formattedAmountToBigNumber(amountFieldProps.value).add(transactionFee);

    const pendingTxWarningComponent = (
      <div className={styles.contentWarning}>
        <SvgInline svg={dangerIcon} className={styles.icon} />
        <p className={styles.warning}>{intl.formatMessage(messages.sendingIsDisabled)}</p>
      </div>
    );

    return (
      <div className={styles.component}>

        {hasAnyPending && pendingTxWarningComponent}

        <BorderedBox>

          <div className={styles.receiverInput}>
            <Input
              className="receiver"
              {...receiverField.bind()}
              error={receiverField.error}
              skin={classicTheme ? InputSkin : InputOwnSkin}
            />
          </div>

          <div className={styles.amountInput}>
            <NumericInput
              {...amountFieldProps}
              className="amount"
              label={intl.formatMessage(messages.amountLabel)}
              maxBeforeDot={currencyMaxIntegerDigits}
              maxAfterDot={currencyMaxFractionalDigits}
              disabled={shouldSendAll}
              error={(transactionFeeError || amountField.error)}
              // AmountInputSkin props
              currency={currencyUnit}
              fees={transactionFee.toFormat(currencyMaxFractionalDigits)}
              total={totalAmount.toFormat(currencyMaxFractionalDigits)}
              skin={AmountInputSkin}
              classicTheme={classicTheme}
            />
          </div>
          <div className={styles.checkbox}>
            <Checkbox
              label={intl.formatMessage(messages.checkboxLabel)}
              onChange={(newState) => {
                this.setShouldSendAll(newState);
                this._updateTxValues(newState);
              }}
              checked={shouldSendAll}
              skin={CheckboxSkin}
            />
          </div>

          {this._makeInvokeConfirmationButton()}

        </BorderedBox>

        {this._makeConfirmationDialogComponent()}

      </div>
    );
  }

  /** Makes custom button component depends on type of active wallet
    * basically controlles which confirmation dialog to open
    * CASE 1: Web Wallet
    * CASE 2: Hardware Wallet (Trezor or Ledger) */
  _makeInvokeConfirmationButton(): Node {
    const { intl } = this.context;

    const buttonClasses = classnames([
      'primary',
      styles.nextButton,
    ]);

    const {
      openDialogAction,
      hasAnyPending,
    } = this.props;
    const { isTransactionFeeCalculated } = this.state;

    /** TODO: [REFACTOR]
      * too bad, opening dialog directly without its container dialog
      * WalletSendForm.js is a component and we already have Send Confirmation dialog's containers
      * WalletSendForm.js tries to open a container but invoking it component
      * this whole logic should be in WalletSendForm's container */
    const targetDialog =  this.props.isHardwareWallet ?
      HWSendConfirmationDialog :
      WalletSendConfirmationDialog;
    const onMouseUp = () => openDialogAction({
      dialog: targetDialog
    });

    return (
      <Button
        className={buttonClasses}
        label={intl.formatMessage(globalMessages.nextButtonLabel)}
        onMouseUp={onMouseUp}
        /** Next Action can't be performed in case transaction fees are not calculated
          * or there's a transaction waiting to be confirmed (pending) */
        disabled={!isTransactionFeeCalculated || hasAnyPending}
        skin={ButtonSkin}
      />);
  }

  /** Makes component for respective send confirmation dialog
    * returns null when dialog is not needed
    * CASE 1: Web Wallet
    * CASE 2: Hardware Wallet (Trezor or Ledger) */
  _makeConfirmationDialogComponent(): Node {
    let component = null;

    const {
      isDialogOpen,
      webWalletConfirmationDialogRenderCallback,
      hardwareWalletConfirmationDialogRenderCallback
    } = this.props;

    // this function is called from render hence it should return ASAP, hence using renderCB
    let renderCB = null;
    if (isDialogOpen(WalletSendConfirmationDialog)) {
      renderCB = webWalletConfirmationDialogRenderCallback;
    } else if (isDialogOpen(HWSendConfirmationDialog)) {
      renderCB = hardwareWalletConfirmationDialogRenderCallback;
    }

    if (renderCB) {
      const { form } = this;

      const {
        currencyUnit,
        currencyMaxFractionalDigits,
      } = this.props;
      const { transactionFee, shouldSendAll } = this.state;

      const amountField = form.$('amount');
      const receiverField = form.$('receiver');
      const receiverFieldProps = receiverField.bind();
      const amountFieldProps = amountField.bind();
      const totalAmount = formattedAmountToBigNumber(amountFieldProps.value).add(transactionFee);

      const dialogProps = {
        amount: amountFieldProps.value,
        receiver: receiverFieldProps.value,
        totalAmount: totalAmount.toFormat(currencyMaxFractionalDigits),
        transactionFee: transactionFee.toFormat(currencyMaxFractionalDigits),
        amountToNaturalUnits: formattedAmountToNaturalUnits,
        currencyUnit,
        shouldSendAll
      };

      component = (
        <div>
          {renderCB(dialogProps)}
        </div>);
    }

    return component;
  }

  _resetTransactionFee() {
    if (this._isMounted && !this._isSubmitting) {
      this.setState({
        isTransactionFeeCalculated: false,
        transactionFee: new BigNumber(0),
        transactionFeeError: null,
      });
    }
  }

  async _calculateTransactionFee(receiver: string, amountValue: string, shouldSendAll: boolean) {
    if (this._isSubmitting) return;
    this._resetTransactionFee();
    const amount = formattedAmountToNaturalUnits(amountValue);
    try {
      this.setState({
        transactionFeeError: this.context.intl.formatMessage(messages.calculatingFee)
      });

      const fee = await this.props.calculateTransactionFee(receiver, amount, shouldSendAll);
      if (this._isMounted) {
        this.setState({
          isTransactionFeeCalculated: true,
          transactionFee: fee,
          transactionFeeError: null,
        });
      }
    } catch (error) {
      if (this._isMounted) {
        this.setState({
          transactionFeeError: this.context.intl.formatMessage(error)
        });
      }
    }
  }

  async _updateTxValues(shouldSendAll: boolean) {
    const isValidReceiver = this.form.$('receiver').isValid;
    const isValidAmount = this.form.$('amount').isValid;
    const receiverValue = this.form.$('receiver').value;
    const amountValue = this.form.$('amount').value;
    if (isValidReceiver && shouldSendAll) {
      await this._calculateTransactionFee(receiverValue, amountValue, shouldSendAll);
      const { totalBalance } = this.props;
      const { transactionFee } = this.state;
      const sendAllAmount = totalBalance.minus(transactionFee);
      this.form.$('amount').value = sendAllAmount.toString();
    } else if (isValidReceiver && isValidAmount) {
      this._calculateTransactionFee(receiverValue, amountValue, shouldSendAll);
    } else {
      this._resetTransactionFee();
    }
  }
}
