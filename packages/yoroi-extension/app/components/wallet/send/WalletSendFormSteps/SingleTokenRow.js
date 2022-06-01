// @flow
import { Component } from 'react';
import type { Node } from 'react'
import styles from './SingleTokenRow.scss'
import { ReactComponent as NoAssetLogo} from '../../../../assets/images/assets-page/asset-no.inline.svg';
import { truncateAddressShort } from '../../../../utils/formatters';
import BigNumber from 'bignumber.js';
import { defineMessages, intlShape } from 'react-intl';
import { AmountInputRevamp } from '../../../common/NumericInputRP';
import {
  MultiToken,
} from '../../../../api/common/lib/MultiToken';
import { ReactComponent as CloseIcon} from '../../../../assets/images/forms/close.inline.svg';
import type { FormattedTokenDisplay } from '../../../../utils/wallet'
import type {
  TokenLookupKey
} from '../../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import type { UriParams } from '../../../../utils/URIHandling';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import LocalizableError from '../../../../i18n/LocalizableError';

type Props = {|
    +token: FormattedTokenDisplay,
    +classicTheme: boolean,
    +updateAmount: (?BigNumber) => void,
    +uriParams: ?UriParams,
    +selectedToken: void | $ReadOnly<TokenRow>,
    +validateAmount: (
      amountInNaturalUnits: BigNumber,
      tokenRow: $ReadOnly<TokenRow>,
    ) => Promise<[boolean, void | string]>,
    +defaultToken: $ReadOnly<TokenRow>,
    +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
    +fee: ?MultiToken,
    +isCalculatingFee: boolean,
    +error: ?LocalizableError,
    +totalInput: ?MultiToken,
    +onRemoveToken: (void | $ReadOnly<TokenRow>) => void,
    +isTokenIncluded: ($ReadOnly<TokenRow>) => boolean,
    +onAddToken: $ReadOnly<TokenRow> => void,
    +getTokenAmount: ($ReadOnly<TokenRow>) => ?string,
    +isValidAmount: ($ReadOnly<TokenRow>) => boolean,
|};

type State = {|
  amount: ?string,
|}

const messages = defineMessages({
  notEnoughMoneyToSendError: {
    id: 'api.errors.NotEnoughMoneyToSendError',
    defaultMessage: '!!!Not enough funds to make this transaction.',
  },
})
export default class SingleTokenRow extends Component<Props, State> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    amount: null,
  }

  componentDidMount() {
    this.setState({ amount: this.props.getTokenAmount(this.props.token.info) })
  }

  getNumDecimals(): number {
    return this.props.token.info.Metadata.numberOfDecimals;
  }

  onAmountUpdate(value: string): void {
    this.setState({ amount: value })
    this.props.updateAmount(value ? (new BigNumber(value)) : null);
  }

  render(): Node {
    const { intl } = this.context;
    const { token, isValidAmount } = this.props;

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
          <div className={styles.amountWrapper}>
            <div className={styles.amountTokenName}>
              <div className={styles.logo}><NoAssetLogo /></div>
              <p className={styles.label}>{token.label}</p>
            </div>
            <div className={styles.amountInput}>
              <AmountInputRevamp
                value={this.state.amount}
                onChange={this.onAmountUpdate.bind(this)}
                onFocus={() => this.props.onAddToken(token.info)}
                amountFieldRevamp
                placeholder='0.0'
              />

            </div>
            <button type='button' onClick={() => this.props.onRemoveToken(token.info)} className={styles.close}> <CloseIcon /> </button>
            <p className={styles.error}>
              {!isValidAmount(token.info) && intl.formatMessage(messages.notEnoughMoneyToSendError)}
            </p>
          </div>
           )}
      </div>
    )
  }
}