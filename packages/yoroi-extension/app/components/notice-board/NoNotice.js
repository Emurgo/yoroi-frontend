// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, FormattedHTMLMessage } from 'react-intl';

import { ReactComponent as NoNoticeClassicSvg }  from '../../assets/images/transaction/no-transactions-yet.classic.inline.svg';
import { ReactComponent as NoNoticeModernSvg }  from '../../assets/images/transaction/no-transactions-yet.modern.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import styles from './NoNotice.scss';

const messages = defineMessages({
  notDelegatedYet: {
    id: 'noticeBoard.noNoticeText.notDelegatedYet',
    defaultMessage: '!!!You have not delegated a stake yet.',
  },
  chooseAPool: {
    id: 'noticeBoard.noNoticeText.chooseAPool',
    defaultMessage: '!!!To view notifications here, first choose a stake pool and delegate your {ticker}.',
  },
});

type Props = {|
  +classicTheme: boolean,
  +ticker: string,
|};

@observer
export default class NoNotice extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = { intl: intlShape.isRequired };

  render(): Node {
    const { intl } = this.context;
    const { classicTheme } = this.props;

    const NoNoticeImage = classicTheme ? NoNoticeClassicSvg : NoNoticeModernSvg;

    return (
      <div className={styles.component}>
        <span><NoNoticeImage /></span>
        <div className={styles.textBlock}>
          <div className={styles.notDelegatedYet}>
            {intl.formatMessage(messages.notDelegatedYet)}
          </div>
          <div>
            <FormattedHTMLMessage
              {...messages.chooseAPool}
              values={{ ticker: this.props.ticker }}
            />
          </div>
        </div>
      </div>
    );
  }
}
