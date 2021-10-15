// @flow
import type { Node } from 'react';
import { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
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
import { formattedAmountToNaturalUnits, formattedAmountToBigNumber, truncateToken } from '../../utils/formatters';
import config from '../../config';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import BigNumber from 'bignumber.js';

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
  +onGenerate: (address: string, amount: BigNumber) => void,
  +classicTheme: boolean,
  +walletAddress: string,
  +amount: ?BigNumber,
  +validateAmount: (
    amountInNaturalUnits: BigNumber,
    tokenRow: $ReadOnly<TokenRow>
  ) => Promise<[boolean, void | string]>,
  +tokenInfo: $ReadOnly<TokenRow>,
|};

@observer
export default class URIGenerateDialog extends Component<Props> {

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
        value: null,
        validators: [async ({ field }) => {
          const amountValue: string = field.value;
          if (amountValue === '') {
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          const formattedAmount = new BigNumber(formattedAmountToNaturalUnits(
            amountValue,
            this.props.tokenInfo.Metadata.numberOfDecimals
          ));
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
    const amountFieldProps = amountField.bind();

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
              {...amountFieldProps}
              value={amountFieldProps.value === ''
                ? null
                : formattedAmountToBigNumber(amountFieldProps.value)
              }
              decimalPlaces={this.props.tokenInfo.Metadata.numberOfDecimals}
              label={this.getAmountLabel()}
              error={amountField.error}
              skin={InputOwnSkin}
              done={amountField.isValid}
              allowSigns={false}
              classicTheme={classicTheme}
              autoFocus
            />
          </div>

          <Button
            variant="primary"
            onClick={onGenerate.bind(this, receiverField.value, amountField.value)}
            disabled={!amountField.isValid}
            sx={{ margin: '30px auto 0', display: 'block', width: '400px' }}
          >
            {this.context.intl.formatMessage(messages.uriGenerateDialogConfirmLabel)}
          </Button>
        </div>
      </Dialog>
    );
  }

}
