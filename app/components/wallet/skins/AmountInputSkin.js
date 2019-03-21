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
    description: 'Label for the "+ 12.042481 of fees" message above amount input field.'
  },
});

type Props = {
  currency: string,
  fees: BigNumber,
  total: BigNumber,
  error: boolean,
  classicTheme: boolean
};

export default class AmountInputSkin extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { error, fees, total, currency, classicTheme } = this.props;
    const { intl } = this.context;

    const feesClasses = classicTheme ? styles.feesClassic : styles.fees;

    return (
      <div className={styles.root}>
        {classicTheme ? <InputSkin {...this.props} /> : <InputOwnSkin {...this.props} />}
        {!error && (
          <span className={feesClasses}>
            {intl.formatMessage(messages.feesLabel, { amount: fees })}
          </span>
        )}

        {classicTheme ? (
          <span className={styles.totalClassic}>
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
