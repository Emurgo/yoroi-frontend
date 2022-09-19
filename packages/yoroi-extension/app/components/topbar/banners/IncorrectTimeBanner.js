// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, } from 'react-intl';
import styles from './IncorrectTimeBanner.scss';
import { ReactComponent as ShelleyTestnetWarningSvg }  from '../../../assets/images/shelley-testnet-warning.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import moment from 'moment';

const messages = defineMessages({
  incorrectTimeLine1: {
    id: 'incorrectTime.line1',
    defaultMessage: '!!!WARNING: time on your computer does not match the server. This can cause unexpected results',
  },
  incorrectTimeLine2: {
    id: 'incorrectTime.line2',
    defaultMessage: '!!!Time difference:',
  },
  incorrectTimeLine3: {
    id: 'incorrectTime.line3',
    defaultMessage: '!!!Synchronize time on your device to resolve this issue',
  },
});

type Props = {|
  serverTime: Date,
|};

@observer
export default class IncorrectTimeBanner extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const currentTime = moment(new Date());

    // in milliseconds
    const timeDifference = Math.abs(currentTime - this.props.serverTime.getTime());

    // don't render an error if less than 2 minutes difference with the server
    if (timeDifference < 1000 * 60 * 2) {
      return null;
    }

    const differenceText = moment(new Date(currentTime + timeDifference)).fromNow(true);

    return (
      <div className={styles.component}>
        <span className={styles.warningIcon}><ShelleyTestnetWarningSvg /></span>
        <div className={styles.text}>
          {intl.formatMessage(messages.incorrectTimeLine1)}<br />
          <span className={styles.preTime}>
            {intl.formatMessage(messages.incorrectTimeLine2)}
          </span>
          {differenceText}
          <br />
          {intl.formatMessage(messages.incorrectTimeLine3)}
        </div>
      </div>
    );
  }
}
