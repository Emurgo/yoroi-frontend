// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import BorderedBox from '../widgets/BorderedBox';
import LoadingSpinner from '../widgets/LoadingSpinner';
import styles from './DaedalusTransferWaitingPage.scss';

const messages = defineMessages({
  title: {
    id: 'daedalusTransfer.waiting.title.label',
    defaultMessage: '!!!Restoring...',
    description: 'Label "Restoring..." on the Daedalus transfer waiting page.'
  },
  progresInfo: {
    restoringAddresses: {
      id: 'daedalusTransfer.waiting.progressInfo.restoringAddresses',
      defaultMessage: '!!!restoring all addresses',
      description: 'Progress info "restoring all addresses" on the Daedalus transfer waiting page.'
    },
    checkingAddresses: {
      id: 'daedalusTransfer.waiting.progressInfo.checkingAddresses',
      defaultMessage: '!!!checking addresses funds',
      description: 'Progress info "checking addresses funds" on the Daedalus transfer waiting page.'
    },
    generatingTx: {
      id: 'daedalusTransfer.waiting.checkingAddresses.generatingTx',
      defaultMessage: '!!!generating transfer transaction',
      description: 'Progress info "generating transfer transaction" on the Daedalus transfer waiting page.'
    }
  }
});

type Props = {
  status: string
};

@observer
export default class DaedalusTransferWaitingPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { status } = this.props;

    return (
      <div className={styles.component}>
        <BorderedBox>

          <div className={styles.body}>

            <div className={styles.title}>
              {intl.formatMessage(messages.title)}
            </div>

            <LoadingSpinner />

            <div className={styles.progressInfo}>
              {intl.formatMessage(messages.progresInfo[status])}
            </div>

          </div>

        </BorderedBox>

      </div>
    );
  }
}
