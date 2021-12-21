// @flow
import { Component } from 'react';
import styles from './SingleTokenRow.scss'
import NoAssetLogo from '../../../../assets/images/assets-page/asset-no.inline.svg';
import { formattedAmountToNaturalUnits, truncateAddressShort } from '../../../../utils/formatters';
import globalMessages from '../../../../i18n/global-messages';
import vjf from 'mobx-react-form/lib/validators/VJF';
import { genFormatTokenAmount } from '../../../../stores/stateless/tokenHelpers';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import config from '../../../../config';
import BigNumber from 'bignumber.js';
import { intlShape } from 'react-intl';

type Props = {|
    token: string, // @todo update the type
|}

export default class SingleTokenRow extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };
  // FORM VALIDATION
  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      amount: {
        label: this.context.intl.formatMessage(globalMessages.amountLabel),
        placeholder: this.props.classicTheme ?
          `0.${'0'.repeat(this.getNumDecimals())}` : '',
        value: (() => {
          const formatValue = genFormatTokenAmount(this.props.getTokenInfo);
          return this.props.uriParams
            ? formatValue(
              this.props.uriParams.amount.getDefaultEntry(),
            )
            : null
        })(),
        validators: [async ({ field }) => {
          const amountValue: string = field.value;
          if (amountValue === '') {
            this.props.updateAmount();
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          const formattedAmount = new BigNumber(formattedAmountToNaturalUnits(
            amountValue,
            this.getNumDecimals(),
          ));
          const isValidAmount = await this.props.validateAmount(
            formattedAmount,
            this.props.selectedToken ?? this.props.defaultToken
          );
          if (isValidAmount[0]) {
            this.props.updateAmount(formattedAmount);
          } else {
            this.props.updateAmount();
          }
          return isValidAmount;
        }],
      },
    },
  }, {
    options: {
      // if fields are pre-populated by URI, validate them right away
      showErrorsOnInit: this.props.uriParams,
      validateOnBlur: false,
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf()
    },
  });

  render() {
      const { token } = this.props
      return (
        <div className={styles.component}>
          <div className={styles.token}>
            <div className={styles.name}>
              <div className={styles.logo}><NoAssetLogo /></div>
              <p className={styles.label}>{token.label}</p>
            </div>
            <p className={styles.id}>{truncateAddressShort(token.id, 14)}</p>
            <p className={styles.amount}>{token.amount}</p>
            <input type="text" />
          </div>
        </div>
      )
  }
}