import React, { Component } from 'react';
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

type Props = {|
  currency: string,
  fees: BigNumber,
  total: BigNumber,
  error: boolean,
  classicTheme: boolean
|};

export default class AmountInputSkin extends Component<Props> {

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
            {!error && `= ${total} `}{currency}
          </span>
        ) : (
          <span className={classnames([styles.total, error ? styles.error : ''])}>
            {!error && `= ${total} `}{currency}
          </span>
        )}
      </div>
    );
  }

}
