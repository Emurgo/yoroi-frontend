// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import BorderedBox from '../widgets/BorderedBox';
import styles from './DaedalusTransferSummaryPage.scss';

const messages = defineMessages({
  title: {
    id: 'daedalusTransfer.summary.title.label',
    defaultMessage: '!!!Transfer funds from Daedalus wallet',
    description: 'Label "Transfer funds from Daedalus wallet" on the Daedalus transfer summary page.'
  },
});

@observer
export default class DaedalusTransferSummaryPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <BorderedBox>

          <div className={styles.body}>

            <div className={styles.title}>
              {intl.formatMessage(messages.title)}
            </div>

          </div>

        </BorderedBox>

      </div>
    );
  }
}
