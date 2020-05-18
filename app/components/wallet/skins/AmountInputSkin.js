// @flow
import React, { Component } from 'react';
import type { Node, Ref } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import BigNumber from 'bignumber.js';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import styles from './AmountInputSkin.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  feesLabel: {
    id: 'wallet.amountInput.feesLabel',
    defaultMessage: '!!!+ {amount} of fees',
  },
});

// This type should be kept open (not "exact") because it is a react-polymorph skin
// and should be able to pass any extra properties from react-polymorph down.
type Props = {
  +currency: string,
  +fees: BigNumber,
  +total: BigNumber,
  +error?: string,
  +classicTheme: boolean,
  // inherited from InputOwnSkin
  +inputRef: Ref<'input'>,
  +theme: Object,
  +themeId: string,
  +value: string,
  +type: string,
  ...
};

export default class AmountInputSkin extends Component<Props> {
  static defaultProps: {|error: void|} = {
    error: undefined,
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { error, fees, total, currency } = this.props;
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <InputOwnSkin {...this.props} />
        {/* Do not show fee in case of some error is showing */}
        {(error == null || error === '')
          ? (
            <span className={styles.fees}>
              {intl.formatMessage(messages.feesLabel, { amount: fees })}
            </span>
          )
          : null
        }

        <span className={classnames([styles.total, (error != null && error !== '') ? styles.error : ''])}>
          {(error === null || error === '') ? `= ${total.toString()} ` : null}{currency}
        </span>
      </div>
    );
  }

}
