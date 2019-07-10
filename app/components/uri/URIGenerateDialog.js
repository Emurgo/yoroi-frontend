// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { NumericInput } from 'react-polymorph/lib/components/NumericInput';
import { Input } from 'react-polymorph/lib/components/Input';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';

import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import { InputOwnSkin } from '../../themes/skins/InputOwnSkin';
import environment from '../../environment';
import globalMessages, { environmentSpecificMessages } from '../../i18n/global-messages';

import { formattedAmountToNaturalUnits } from '../../utils/formatters';
import config from '../../config';

import styles from './URIGenerateDialog.scss';

const messages = defineMessages({
  uriGenerateDialogTitle: {
    id: 'uri.generate.dialog.title',
    defaultMessage: '!!!Generate URL',
  },
  uriGenerateDialogConfirmLabel: {
    id: 'uri.generate.dialog.confirm.label',
    defaultMessage: '!!!Generate',
  },
  uriGenerateDialogAddressLabel: {
    id: 'uri.generate.dialog.address.label',
    defaultMessage: '!!!Receiver address',
  },
  uriGenerateDialogAmountLabel: {
    id: 'uri.generate.dialog.amount.label',
    defaultMessage: '!!!Amount ({currency})',
  },
  uriGenerateDialogInvalidAmount: {
    id: 'uri.generate.dialog.invalid.amount',
    defaultMessage: '!!!Please enter a valid amount',
  }
});

type Props = {
  onClose: void => void,
  onGenerate: (address: string, amount: number) => void,
  classicTheme: boolean,
  walletAddress: string,
  amount?: number,
  currencyMaxIntegerDigits: number,
  currencyMaxFractionalDigits: number,
  validateAmount: (amountInNaturalUnits: string) => Promise<boolean>,
};

@observer
export default class URIGenerateDialog extends Component<Props> {
  static defaultProps = {
    amount: undefined,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  getAmountLabel = (): string => {
    const currency = this.context.intl.formatMessage(
      environmentSpecificMessages[environment.API].currency
    );
    const label = this.context.intl.formatMessage(messages.uriGenerateDialogAmountLabel, {
      currency
    });

    return label;
  }

  // FORM VALIDATION
  form = new ReactToolboxMobxForm({
    fields: {
      receiver: {
        label: this.context.intl.formatMessage(messages.uriGenerateDialogAddressLabel),
        value: this.props.walletAddress,
      },
      amount: {
        label: this.getAmountLabel(),
        placeholder: `0.${'0'.repeat(this.props.currencyMaxFractionalDigits)}`,
        value: '',
        validators: [async ({ field }) => {
          const amountValue = field.value;
          if (amountValue === '') {
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          const formattedAmount = formattedAmountToNaturalUnits(amountValue);
          const isValidAmount = await this.props.validateAmount(formattedAmount);
          return [
            isValidAmount,
            this.context.intl.formatMessage(messages.uriGenerateDialogInvalidAmount)
          ];
        }],
      },
    },
  }, {
    options: {
      showErrorsOnInit: false,
      validateOnBlur: false,
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf()
    },
  });

  componentDidMount() {
    const amountField = this.form.$('amount');
    amountField.set(
      'value',
      this.props.amount ? this.props.amount.toString() : ''
    );
  }

  render() {
    const {
      onClose,
      onGenerate,
      classicTheme,
      currencyMaxIntegerDigits,
      currencyMaxFractionalDigits,
    } = this.props;

    const dialogClasses = classnames([
      styles.component,
      'URIGenerateDialog',
    ]);

    const { form } = this;
    const { intl } = this.context;

    const receiverField = form.$('receiver');
    const amountField = form.$('amount');

    return (
      <Dialog
        title={intl.formatMessage(messages.uriGenerateDialogTitle)}
        className={dialogClasses}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        classicTheme={classicTheme}
        onClose={onClose}
      >
        <div>
          <div className={styles.receiverInput}>
            <Input
              className="receiver"
              {...receiverField.bind()}
              skin={InputOwnSkin}
              disabled
            />
          </div>
          <div className={styles.amountField}>
            <NumericInput
              className="amount"
              {...amountField.bind()}
              label={this.getAmountLabel()}
              error={amountField.error}
              maxBeforeDot={currencyMaxIntegerDigits}
              maxAfterDot={currencyMaxFractionalDigits}
              skin={InputOwnSkin}
              done={amountField.isValid}
              classicTheme={classicTheme}
              autoFocus
            />
          </div>

          <Button
            label={this.context.intl.formatMessage(messages.uriGenerateDialogConfirmLabel)}
            onClick={onGenerate.bind(this, receiverField.value, amountField.value)}
            skin={ButtonSkin}
            className={classnames(['primary', styles.generateButton])}
            disabled={!amountField.isValid}
          />
        </div>
      </Dialog>
    );
  }

}
