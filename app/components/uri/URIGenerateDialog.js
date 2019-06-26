// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';
import { NumericInput } from 'react-polymorph/lib/components/NumericInput';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';

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
      walletAddress,
      currencyMaxIntegerDigits,
      currencyMaxFractionalDigits,
    } = this.props;

    const dialogClasses = classnames([
      styles.component,
      'URIGenerateDialog',
    ]);

    const { form } = this;
    const { intl } = this.context;

    const amountField = form.$('amount');
    const receiverField = form.$('receiver');

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
          <h2 className={styles.receiverLabel}>
            {intl.formatMessage(messages.uriGenerateDialogAddressLabel)}
          </h2>
          <div className={styles.receiverField}>
            {walletAddress}
          </div>
          <div className={styles.amountField}>
            <NumericInput
              {...amountField.bind()}
              className="amount"
              label={this.getAmountLabel()}
              maxBeforeDot={currencyMaxIntegerDigits}
              maxAfterDot={currencyMaxFractionalDigits}
              skin={classicTheme ? InputSkin : InputOwnSkin}
              classicTheme={classicTheme}
              error={amountField.error}
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
