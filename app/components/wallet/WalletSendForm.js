// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import Button from 'react-polymorph/lib/components/Button';
import SimpleButtonSkin from 'react-polymorph/lib/skins/simple/raw/ButtonSkin';
import Input from 'react-polymorph/lib/components/Input';
import NumericInput from 'react-polymorph/lib/components/NumericInput';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';
import { defineMessages, intlShape } from 'react-intl';
import BigNumber from 'bignumber.js';
import SvgInline from 'react-svg-inline';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import AmountInputSkin from './skins/AmountInputSkin';
import BorderedBox from '../widgets/BorderedBox';
import styles from './WalletSendForm.scss';
import globalMessages from '../../i18n/global-messages';
import WalletSendConfirmationDialog from './WalletSendConfirmationDialog';
import { formattedAmountToBigNumber, formattedAmountToNaturalUnits } from '../../utils/formatters';
import dangerIcon from '../../assets/images/danger.inline.svg';

export const messages = defineMessages({
  titleLabel: {
    id: 'wallet.send.form.title.label',
    defaultMessage: '!!!Title',
    description: 'Label for the "Title" text input in the wallet send form.'
  },
  titleHint: {
    id: 'wallet.send.form.title.hint',
    defaultMessage: '!!!E.g: Money for Frank',
    description: 'Hint inside the "Receiver" text input in the wallet send form.'
  },
  receiverLabel: {
    id: 'wallet.send.form.receiver.label',
    defaultMessage: '!!!Receiver',
    description: 'Label for the "Receiver" text input in the wallet send form.'
  },
  receiverHint: {
    id: 'wallet.send.form.receiver.hint',
    defaultMessage: '!!!Wallet Address',
    description: 'Hint inside the "Receiver" text input in the wallet send form.'
  },
  amountLabel: {
    id: 'wallet.send.form.amount.label',
    defaultMessage: '!!!Amount',
    description: 'Label for the "Amount" number input in the wallet send form.'
  },
  equalsAdaHint: {
    id: 'wallet.send.form.amount.equalsAda',
    defaultMessage: '!!!equals {amount} ADA',
    description: 'Convertion hint for the "Amount" number input in the wallet send form.'
  },
  descriptionLabel: {
    id: 'wallet.send.form.description.label',
    defaultMessage: '!!!Description',
    description: 'Label for the "description" text area in the wallet send form.'
  },
  descriptionHint: {
    id: 'wallet.send.form.description.hint',
    defaultMessage: '!!!You can add a message if you want',
    description: 'Hint in the "description" text area in the wallet send form.'
  },
  nextButtonLabel: {
    id: 'wallet.send.form.next',
    defaultMessage: '!!!Next',
    description: 'Label for the next button on the wallet send form.'
  },
  invalidAddress: {
    id: 'wallet.send.form.errors.invalidAddress',
    defaultMessage: '!!!Please enter a valid address.',
    description: 'Error message shown when invalid address was entered.'
  },
  invalidAmount: {
    id: 'wallet.send.form.errors.invalidAmount',
    defaultMessage: '!!!Please enter a valid amount.',
    description: 'Error message shown when invalid amount was entered.',
  },
  invalidTitle: {
    id: 'wallet.send.form.errors.invalidTitle',
    defaultMessage: '!!!Please enter a title with at least 3 characters.',
    description: 'Error message shown when invalid transaction title was entered.',
  },
  transactionFeeError: {
    id: 'wallet.send.form.transactionFeeError',
    defaultMessage: '!!!Not enough Ada for fees. Try sending a smaller amount.',
    description: '"Not enough Ada for fees. Try sending a smaller amount." error message',
  },
  calculatingFee: {
    id: 'wallet.send.form.calculatingFee',
    defaultMessage: '!!!Calculating fee...',
    description: 'Calculating fee...',
  },
  sendingIsDisabled: {
    id: 'wallet.send.form.sendingIsDisabled',
    defaultMessage: '!!!Cannot send a transaction while there is a pending one',
    description: '"Cannot send a transaction while there is a pending one" error message',
  }
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  currencyUnit: string,
  currencyMaxIntegerDigits: number,
  currencyMaxFractionalDigits: number,
  validateAmount: (amountInNaturalUnits: string) => Promise<boolean>,
  calculateTransactionFee: (receiver: string, amount: string) => Promise<BigNumber>,
  addressValidator: Function,
  openDialogAction: Function,
  isDialogOpen: Function,
  dialogRenderCallback: Function,
  hasAnyPending: boolean,
  isTrezorTWallet: boolean,
  onSignWithHardware: (receiver: string, amount: string) => void
};

type State = {
  isTransactionFeeCalculated: boolean,
  transactionFee: BigNumber,
  transactionFeeError: ?string,
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

  // FORM VALIDATION
  form = new ReactToolboxMobxForm({
    fields: {
      receiver: {
        label: this.context.intl.formatMessage(messages.receiverLabel),
        placeholder: this.context.intl.formatMessage(messages.receiverHint),
        value: '',
        validators: [({ field, form }) => {
          const value = field.value;
          if (value === '') {
            this._resetTransactionFee();
            return [false, this.context.intl.formatMessage(messages.fieldIsRequired)];
          }
          return this.props.addressValidator(value)
            .then(isValid => {
              const amountField = form.$('amount');
              const amountValue = amountField.value;
              const isAmountValid = amountField.isValid;
              if (isValid && isAmountValid) {
                this._calculateTransactionFee(value, amountValue);
              } else {
                this._resetTransactionFee();
              }
              return [isValid, this.context.intl.formatMessage(messages.invalidAddress)];
            });
        }],
      },
      amount: {
        label: this.context.intl.formatMessage(messages.amountLabel),
        placeholder: `0.${'0'.repeat(this.props.currencyMaxFractionalDigits)}`,
        value: '',
        validators: [async ({ field, form }) => {
          const amountValue = field.value;
          if (amountValue === '') {
            this._resetTransactionFee();
            return [false, this.context.intl.formatMessage(messages.fieldIsRequired)];
          }
          const isValid = await this.props.validateAmount(
            formattedAmountToNaturalUnits(amountValue)
          );
          const receiverField = form.$('receiver');
          const receiverValue = receiverField.value;
          const isReceiverValid = receiverField.isValid;
          if (isValid && isReceiverValid) {
            this._calculateTransactionFee(receiverValue, amountValue);
          } else {
            this._resetTransactionFee();
          }
          return [isValid, this.context.intl.formatMessage(messages.invalidAmount)];
        }],
      },
    },
  }, {
    options: {
      validateOnBlur: false,
      validateOnChange: true,
      validationDebounceWait: 250,
    },
  });

  render() {
    const { form } = this;
    const { intl } = this.context;

    const {
      currencyUnit,
      currencyMaxIntegerDigits,
      currencyMaxFractionalDigits,
      isDialogOpen,
      hasAnyPending,
      dialogRenderCallback
    } = this.props;
    const {
      transactionFee,
      transactionFeeError
    } = this.state;

    const amountField = form.$('amount');
    const receiverField = form.$('receiver');
    const receiverFieldProps = receiverField.bind();
    const amountFieldProps = amountField.bind();
    const totalAmount = formattedAmountToBigNumber(amountFieldProps.value).add(transactionFee);

    const hasPendingTxWarning = (
      <div className={styles.contentWarning}>
        <SvgInline svg={dangerIcon} className={styles.icon} cleanup={['title']} />
        <p className={styles.warning}>{intl.formatMessage(messages.sendingIsDisabled)}</p>
      </div>
    );

    const dialogProps = {
      amount: amountFieldProps.value,
      receiver: receiverFieldProps.value,
      totalAmount: totalAmount.toFormat(currencyMaxFractionalDigits),
      transactionFee: transactionFee.toFormat(currencyMaxFractionalDigits),
      amountToNaturalUnits: formattedAmountToNaturalUnits,
      currencyUnit
    };
    return (
      <div className={styles.component}>

        {hasAnyPending && hasPendingTxWarning}

        <BorderedBox>

          <div className={styles.receiverInput}>
            <Input
              className="receiver"
              {...receiverField.bind()}
              error={receiverField.error}
              skin={<SimpleInputSkin />}
            />
          </div>

          <div className={styles.amountInput}>
            <NumericInput
              {...amountFieldProps}
              className="amount"
              label={intl.formatMessage(messages.amountLabel)}
              maxBeforeDot={currencyMaxIntegerDigits}
              maxAfterDot={currencyMaxFractionalDigits}
              error={transactionFeeError || amountField.error}
              // AmountInputSkin props
              currency={currencyUnit}
              fees={transactionFee.toFormat(currencyMaxFractionalDigits)}
              total={totalAmount.toFormat(currencyMaxFractionalDigits)}
              skin={<AmountInputSkin />}
            />
          </div>

          {this._makeInvokeConfirmationButton()}

        </BorderedBox>

        {isDialogOpen(WalletSendConfirmationDialog) ? (
          <div>
            {dialogRenderCallback(dialogProps)}
          </div>
        ) : null}

      </div>
    );
  }

  /** Makes custom button component depends on type of active wallet
    * basically controlles next operation to execute
    * CASE 1: Web Wallet
    * CASE 2: Trezor Model T Wallet */
  _makeInvokeConfirmationButton() {
    const { form } = this;
    const { intl } = this.context;

    const buttonClasses = classnames([
      'primary',
      styles.nextButton,
    ]);

    /** Next Action can't be performed in case transaction fees are not calculated
      * or there's a transaction waiting to be confirmed (pending) */
    const {
      openDialogAction,
      hasAnyPending,
    } = this.props;
    const { isTransactionFeeCalculated } = this.state;

    let onMouseUp;
    if (this.props.isTrezorTWallet) {
      // Trezor Model T Wallet
      onMouseUp = () => {
        const { receiver, amount } = form.values();
        const amountInNaturalUnits = formattedAmountToNaturalUnits(amount);
        const amountInBigNumber = formattedAmountToBigNumber(amountInNaturalUnits);
        this.props.onSignWithHardware(receiver, amountInBigNumber);
      };
    } else {
      // Default: Web Wallet
      onMouseUp = () => openDialogAction({
        dialog: WalletSendConfirmationDialog,
      });
    }

    // TODO: fix the return type
    return (
      <Button
        className={buttonClasses}
        label={intl.formatMessage(messages.nextButtonLabel)}
        onMouseUp={onMouseUp}
        disabled={!isTransactionFeeCalculated || hasAnyPending}
        skin={<SimpleButtonSkin />}
      />);
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

  async _calculateTransactionFee(receiver: string, amountValue: string) {
    if (this._isSubmitting) return;
    this._resetTransactionFee();
    const amount = formattedAmountToNaturalUnits(amountValue);
    try {
      this.setState({
        transactionFeeError: this.context.intl.formatMessage(messages.calculatingFee)
      });
      const fee = await this.props.calculateTransactionFee(receiver, amount);
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
}
