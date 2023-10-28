// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, FormattedMessage } from 'react-intl';
import styles from './TestnetWarningBanner.scss';
import environment from '../../../environment';
import { ReactComponent as ShelleyTestnetWarningSvg }  from '../../../assets/images/shelley-testnet-warning.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  testnetLabel: {
    id: 'testnet.shelley.label.message',
    defaultMessage: '!!!YOU ARE ON TESTNET NETWORK.',
  },
  nightlyLabel: {
    id: 'nightly.banner.label.message',
    defaultMessage: '!!!YOU ARE ON YOROI NIGHTLY.',
  },
});

type Props = {|
  isTestnet: boolean,
|};

@observer
export default class TestnetWarningBanner extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): null | Node {
    if (environment.isNightly()) {
      return (
        <div className={styles.shelleyTestnetWarning}>
          <span key="0" className={styles.shelleyTestnetWarningIcon}><ShelleyTestnetWarningSvg /></span>
          <div className={styles.text}>
            <FormattedMessage
              {...messages.nightlyLabel}
              key="1"
            />
          </div>
        </div>
      );
    }
    if (this.props.isTestnet) {
      return (
        <div className={styles.shelleyTestnetWarning}>
          <span key="0" className={styles.shelleyTestnetWarningIcon}><ShelleyTestnetWarningSvg /></span>
          <div className={styles.text}>
            <FormattedMessage
              {...messages.testnetLabel}
              key="1"
            />
          </div>
        </div>
      );
    }
    return null;
  }
}
