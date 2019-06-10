import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import BigNumber from 'bignumber.js';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import styles from './AmountInputSkin.scss';

const messages = defineMessages({
  feesLabel: {
    id: 'wallet.amountInput.feesLabel',
    defaultMessage: '!!!+ {amount} of fees',
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
    const { error, fees, total, currency } = this.props;
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <InputOwnSkin {...this.props} />
        {!error && (
          <span className={styles.fees}>
            {intl.formatMessage(messages.feesLabel, { amount: fees })}
          </span>
        )}

        <span className={classnames([styles.total, error ? styles.error : ''])}>
          {!error && `= ${total} `}{currency}
        </span>
      </div>
    );
  }

}
