// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, } from 'react-intl';
import styles from './NotProductionBanner.scss';
import ShelleyTestnetWarningSvg from '../../../assets/images/shelley-testnet-warning.inline.svg';

const messages = defineMessages({
  notProdLabel: {
    id: 'notprod.label.message',
    defaultMessage: '!!!WARNING: non-production build. If unexpected, double-check Yoroi installation.',
  },
});

type Props = {|
|};

@observer
export default class NotProductionBanner extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
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
