// @flow
import React, { Component } from 'react';
import type { Ref } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import BigNumber from 'bignumber.js';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import styles from './AmountInputSkin.scss';

const messages = defineMessages({
  feesLabel: {
    id: 'wallet.amountInput.feesLabel',
    defaultMessage: '!!!+ {amount} of fees',
  },
});

// This type should be kept open (not "exact") because it is a react-polymorph skin
// and should be able to pass any extra properties from react-polymorph down.
type Props = {
  currency: string,
  fees: BigNumber,
  total: BigNumber,
  error?: string,
  classicTheme: boolean,
  // inherited from InputOwnSkin
  inputRef: Ref<'input'>,
  theme: Object,
  themeId: string,
  value: string,
  type: string,
};

export default class AmountInputSkin extends Component<Props> {
  static defaultProps = {
    error: undefined,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { error, fees, total, currency, classicTheme } = this.props;
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        {classicTheme ? <InputSkin {...this.props} /> : <InputOwnSkin {...this.props} />}
        {!error && (
          <span className={styles.fees}>
            {intl.formatMessage(messages.feesLabel, { amount: fees })}
          </span>
        )}

        {classicTheme ? (
          <span className={styles.total}>
            {!error && `= ${total.toString()} `}{currency}
          </span>
        ) : (
          <span className={classnames([styles.total, error ? styles.error : ''])}>
            {!error && `= ${total.toString()} `}{currency}
          </span>
        )}
      </div>
    );
  }

}
