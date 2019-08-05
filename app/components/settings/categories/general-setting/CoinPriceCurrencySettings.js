import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Select } from 'react-polymorph/lib/components/Select';
import { SelectSkin } from 'react-polymorph/lib/skins/simple/SelectSkin';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './CoinPriceCurrencySettings.scss';
import globalMessages from '../../../../i18n/global-messages';

type Props = {|
  onSelect: string=>void,
  isSubmitting: boolean,
  currencies: string,
  currentValue: string,
  error?: ?LocalizableError,
|};

@observer
export default class CoinPriceCurrencySettings extends Component<Props> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  form = new ReactToolboxMobxForm({
    fields: {
      coinPriceCurrencyId: {
        label: 'coin prince currency', //this.context.intl.formatMessage(),
    }
    }
  });

  render () {
    console.log('>>>render');
    const { currencies, isSubmitting, error, currentValue } = this.props;
    const { intl } = this.context;
    const { form } = this;
    const coinPriceCurrencyId = form.$('coinPriceCurrencyId');
    const componentClassNames = classNames([styles.component, 'coinPriceCurrency']);
    const coinPriceCurrencySelectClassNames = classNames([
      styles.coinPriceCurrency,
      isSubmitting ? styles.submitCoinPriceCurrencySpinner : null,
    ]);

    return (
      <div className={componentClassNames}>
        <Select
          className={coinPriceCurrencySelectClassNames}
          options={currencies}
          {...coinPriceCurrencyId.bind()}
          onChange={this.props.onSelect}
          skin={SelectSkin}
          value={currentValue}
        />
        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}
      </div>
    );
  }
}
