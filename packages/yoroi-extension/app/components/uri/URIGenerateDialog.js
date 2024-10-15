// @flow
import type { Node } from 'react';
import { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import DialogCloseButton from '../widgets/DialogCloseButton';
import NumericInputRP from '../common/NumericInputRP';
import globalMessages from '../../i18n/global-messages';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import TextField from '../common/TextField';
import { formattedAmountToNaturalUnits, formattedAmountToBigNumber, truncateToken } from '../../utils/formatters';
import config from '../../config';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import BigNumber from 'bignumber.js';

import styles from './URIGenerateDialog.scss';
// import ThemedDialog from '../widgets/ThemedDialog';
import Dialog from '../widgets/Dialog';

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
  +onGenerate: (address: string, amount: BigNumber) => void,
  +walletAddress: string,
  +amount: ?BigNumber,
  +validateAmount: (amountInNaturalUnits: BigNumber, tokenRow: $ReadOnly<TokenRow>) => Promise<[boolean, void | string]>,
  +tokenInfo: $ReadOnly<TokenRow>,
|};

@observer
export default class URIGenerateDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  getAmountLabel: () => string = (): string => {
    const label = this.context.intl.formatMessage(messages.uriGenerateDialogAmountLabel, {
      currency: truncateToken(getTokenName(this.props.tokenInfo)),
    });

    return label;
  };

  // FORM VALIDATION
  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        receiver: {
          label: this.context.intl.formatMessage(messages.uriGenerateDialogAddressLabel),
          value: this.props.walletAddress,
        },
        amount: {
          label: truncateToken(this.getAmountLabel()),
          placeholder: `0.${'0'.repeat(this.props.tokenInfo.Metadata.numberOfDecimals)}`,
          value: null,
          validators: [
            async ({ field }) => {
              const amountValue: string = field.value;
              if (amountValue === '') {
                return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
              }
              const formattedAmount = new BigNumber(
                formattedAmountToNaturalUnits(amountValue, this.props.tokenInfo.Metadata.numberOfDecimals)
              );
              return await this.props.validateAmount(formattedAmount, this.props.tokenInfo);
            },
          ],
        },
      },
    },
    {
      options: {
        showErrorsOnInit: false,
        validateOnBlur: false,
        validateOnChange: true,
        validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
      },
      plugins: {
        vjf: vjf(),
      },
    }
  );

  componentDidMount(): void {
    const amountField = this.form.$('amount');
    amountField.set('value', this.props.amount != null ? this.props.amount.toString() : '');
  }

  render(): Node {
    const { onClose, onGenerate } = this.props;

    const dialogClasses = classnames([styles.component, 'URIGenerateDialog']);

    const { form } = this;
    const { intl } = this.context;

    const receiverField = form.$('receiver');
    const amountField = form.$('amount');
    const amountFieldProps = amountField.bind();

    const actions = [
      {
        label: this.context.intl.formatMessage(messages.uriGenerateDialogConfirmLabel),
        onClick: onGenerate.bind(this, receiverField.value, amountField.value),
        primary: true,
        disabled: !amountField.isValid,
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(messages.uriGenerateDialogTitle)}
        dialogActions={actions}
        className={dialogClasses}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={onClose}
        id="uriGenerateDialog"
      >
        <div>
          <div className={styles.receiverInput}>
            <TextField className="receiver" {...receiverField.bind()} disabled />
          </div>
          <div className={styles.amountField}>
            <NumericInputRP
              className="amount"
              {...amountFieldProps}
              value={amountFieldProps.value === '' ? null : formattedAmountToBigNumber(amountFieldProps.value)}
              decimalPlaces={this.props.tokenInfo.Metadata.numberOfDecimals}
              label={this.getAmountLabel()}
              error={amountField.error}
              done={amountField.isValid}
              placeholder="0"
              allowSigns={false}
              autoFocus
            />
          </div>
        </div>
      </Dialog>
    );
  }
}
