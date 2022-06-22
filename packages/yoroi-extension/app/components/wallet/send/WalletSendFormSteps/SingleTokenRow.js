// @flow
import { Component } from 'react';
import type { Node } from 'react'
import styles from './SingleTokenRow.scss'
import { ReactComponent as NoAssetLogo } from '../../../../assets/images/assets-page/asset-no.inline.svg';
import {
  truncateAddressShort,
  formattedAmountToNaturalUnits,
  formattedAmountToBigNumber,
} from '../../../../utils/formatters';
import BigNumber from 'bignumber.js';
import { defineMessages, intlShape } from 'react-intl';
import { AmountInputRevamp } from '../../../common/NumericInputRP';
import { ReactComponent as CloseIcon} from '../../../../assets/images/forms/close-small.inline.svg';
import type { FormattedTokenDisplay } from '../../../../utils/wallet'
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classnames from 'classnames';

type Props = {|
    +token: FormattedTokenDisplay,
    +updateAmount: (?BigNumber) => void,
    +onRemoveToken: (void | $ReadOnly<TokenRow>) => void,
    +isTokenIncluded: ($ReadOnly<TokenRow>) => boolean,
    +onAddToken: $ReadOnly<TokenRow> => void,
    +getTokenAmount: ($ReadOnly<TokenRow>) => ?string,
    +isValidAmount: ($ReadOnly<TokenRow>) => boolean,
|};


const messages = defineMessages({
  notEnoughMoneyToSendError: {
    id: 'api.errors.NotEnoughMoneyToSendError',
    defaultMessage: '!!!Not enough funds to make this transaction.',
  },
})
export default class SingleTokenRow extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  componentDidMount() {
  }

  getNumDecimals(): number {
    return this.props.token.info.Metadata.numberOfDecimals;
  }

  onAmountUpdate(value: string): void {
    let formattedAmount = value
    if (value) {
      formattedAmount = new BigNumber(formattedAmountToNaturalUnits(
        value,
        this.getNumDecimals(),
      ));
    }
    this.props.updateAmount(this.props.token.info, formattedAmount);
  }

  render(): Node {
    const { intl } = this.context;
    const { token, isValidAmount } = this.props;
    const isValid = isValidAmount(token.info);

    let amount = this.props.getTokenAmount(this.props.token.info);
    if (amount) {
      amount = new BigNumber(amount)
      .shiftedBy(-this.getNumDecimals()).toString();
    }

    return (
      <div className={styles.component}>
        {!this.props.isTokenIncluded(token.info) ? (
          <button type='button' className={styles.token} onClick={() => this.props.onAddToken(token.info)}>
            <div className={styles.name}>
              <div className={styles.logo}><NoAssetLogo /></div>
              <p className={styles.label}>{token.label}</p>
            </div>
            <p className={styles.id}>{truncateAddressShort(token.id, 14)}</p>
            <p className={styles.amount}>{token.amount}</p>
          </button>
        ): (
          <div className={classnames([styles.amountWrapper, !isValid && styles.amountError])}>
            <div className={styles.amountTokenName}>
              <div className={styles.logo}><NoAssetLogo /></div>
              <p className={styles.label}>{token.label}</p>
            </div>
            <div className={styles.amountInput}>
              <AmountInputRevamp
                value={!amount ? null
                : formattedAmountToBigNumber(amount)}
                onChange={this.onAmountUpdate.bind(this)}
                decimalPlaces={this.getNumDecimals()}
                amountFieldRevamp
                placeholder={token.amount}
              />
            </div>
            <button type='button' onClick={() => this.props.onRemoveToken(token.info)} className={styles.close}> <CloseIcon /> </button>
            <p className={styles.error}>
              {!isValid && intl.formatMessage(messages.notEnoughMoneyToSendError)}
            </p>
          </div>
        )}
      </div>
    )
  }
}