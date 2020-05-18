// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, FormattedHTMLMessage } from 'react-intl';

import environmnent from '../../environment';
import NoNoticeTestnetSvg from '../../assets/images/transaction/no-transactions-yet.testnet.inline.svg';
import NoNoticeClassicSvg from '../../assets/images/transaction/no-transactions-yet.classic.inline.svg';
import NoNoticeModernSvg from '../../assets/images/transaction/no-transactions-yet.modern.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import styles from './NoNotice.scss';

const messages = defineMessages({
  notDelegatedYet: {
    id: 'noticeBoard.noNoticeText.notDelegatedYet',
    defaultMessage: '!!!You have not delegated a stake yet.',
  },
  chooseAPool: {
    id: 'noticeBoard.noNoticeText.chooseAPool',
    defaultMessage: '!!!To view notifications here, first choose a stake pool and delegate your ADA.',
  },
});

type Props = {|
  +classicTheme: boolean,
|};

@observer
export default class NoNotice extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = { intl: intlShape.isRequired };

  render(): Node {
    const { intl } = this.context;
    const { classicTheme } = this.props;

    let NoNoticeImage;
    if (environmnent.isShelley()) {
      NoNoticeImage = NoNoticeTestnetSvg;
    } else {
      NoNoticeImage = classicTheme ? NoNoticeClassicSvg : NoNoticeModernSvg;
    }

    return (
      <div className={styles.component}>
        <span><NoNoticeImage /></span>
        <div className={styles.textBlock}>
          <div className={styles.notDelegatedYet}>
            {intl.formatMessage(messages.notDelegatedYet)}
          </div>
          <div><FormattedHTMLMessage {...messages.chooseAPool} /></div>
        </div>
      </div>
    );
  }
}
