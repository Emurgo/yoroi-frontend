// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, } from 'react-intl';
import styles from './NotProductionBanner.scss';
import { ReactComponent as ShelleyTestnetWarningSvg }  from '../../../assets/images/shelley-testnet-warning.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  notProdLabel: {
    id: 'notprod.label.message',
    defaultMessage: '!!!WARNING: this is a non-production build. If something unusual occurs, double-check Yoroi\'s installation.',
  },
});

type Props = {|
|};

@observer
export default class NotProductionBanner extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <div className={styles.notProdWarning}>
        <span className={styles.warningIcon}><ShelleyTestnetWarningSvg /></span>
        <div className={styles.text}>
          {intl.formatMessage(messages.notProdLabel)}
        </div>
      </div>
    );
  }
}
