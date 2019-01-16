import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import BigNumber from 'bignumber.js';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';
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
  oldTheme: boolean
};

export default class AmountInputSkin extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { error, fees, total, currency, oldTheme } = this.props;
    const { intl } = this.context;

    const feesClasses = oldTheme ? styles.feesOld : styles.fees;
    const totalClasses = oldTheme ? styles.totalOld : styles.total;

    return (
      <div className={styles.root}>
        <InputSkin {...this.props} />
        {!error && (
          <span className={feesClasses}>
            {intl.formatMessage(messages.feesLabel, { amount: fees })}
          </span>
        )}
        <span className={totalClasses}>
          {!error && `= ${total} `}{currency}
        </span>
      </div>
    );
  }

}
