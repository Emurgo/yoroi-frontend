// @flow
import type { Node } from 'react';
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
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import { InputOwnSkin } from '../../themes/skins/InputOwnSkin';
import globalMessages from '../../i18n/global-messages';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { formattedAmountToNaturalUnits, truncateToken } from '../../utils/formatters';
import config from '../../config';
import { calcMaxBeforeDot } from '../../utils/validations';
import { getTokenName } from '../../stores/stateless/tokenHelpers';

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
});

type Props = {|
  +onClose: void => void,
  +onGenerate: (address: string, amount: number) => void,
  +classicTheme: boolean,
  +walletAddress: string,
  +amount?: number, // TODO: not safe to pass this as a number instead of BigNumber / string
  +validateAmount: (
    amountInNaturalUnits: string,
    tokenRow: $ReadOnly<TokenRow>
  ) => Promise<[boolean, void | string]>,
  +tokenInfo: $ReadOnly<TokenRow>,
|};

@observer
export default class URIGenerateDialog extends Component<Props> {
  static defaultProps: {|amount: void|} = {
    amount: undefined,
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  getAmountLabel: (() => string) = (): string => {
    const label = this.context.intl.formatMessage(messages.uriGenerateDialogAmountLabel, {
      currency: truncateToken(getTokenName(this.props.tokenInfo)),
    });

    return label;
  }

  // FORM VALIDATION
  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      receiver: {
        label: this.context.intl.formatMessage(messages.uriGenerateDialogAddressLabel),
        value: this.props.walletAddress,
      },
      amount: {
        label: truncateToken(this.getAmountLabel()),
        placeholder: `0.${'0'.repeat(this.props.tokenInfo.Metadata.numberOfDecimals)}`,
        value: '',
        validators: [async ({ field }) => {
          const amountValue = field.value;
          if (amountValue === '') {
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          const formattedAmount = formattedAmountToNaturalUnits(
            amountValue,
            this.props.tokenInfo.Metadata.numberOfDecimals
          );
          return await this.props.validateAmount(formattedAmount, this.props.tokenInfo);
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

  componentDidMount(): void {
    const amountField = this.form.$('amount');
    amountField.set(
      'value',
      this.props.amount != null ? this.props.amount.toString() : ''
    );
  }

  render(): Node {
    const {
      onClose,
      onGenerate,
      classicTheme,
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
              maxBeforeDot={calcMaxBeforeDot(this.props.tokenInfo.Metadata.numberOfDecimals)}
              maxAfterDot={this.props.tokenInfo.Metadata.numberOfDecimals}
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
