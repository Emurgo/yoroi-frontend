// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import AnnotatedLoader from './AnnotatedLoader';
import WarningBox from '../widgets/WarningBox';
import type { TransferStatusT } from '../../types/TransferTypes';
import { TransferStatus } from '../../types/TransferTypes';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import styles from './TransferWaitingPage.scss';

const messages = defineMessages({
  title: {
    id: 'daedalusTransfer.waiting.title.label',
    defaultMessage: '!!!Daedalus wallet is being restored',
  },
  restoringAddresses: {
    id: 'daedalusTransfer.waiting.progressInfo.restoringAddresses',
    defaultMessage: '!!!Fetching addresses',
  },
  checkingAddresses: {
    id: 'daedalusTransfer.waiting.progressInfo.checkingAddresses',
    defaultMessage: '!!!Checking addresses funds',
  },
  generatingTx: {
    id: 'daedalusTransfer.waiting.checkingAddresses.generatingTx',
    defaultMessage: '!!!Generating transfer transaction',
  },
  internetConnectionWarning: {
    id: 'daedalusTransfer.waiting.warning',
    defaultMessage: '!!!This may take a long time or fail on poor internet connections',
  }
});

type Props = {|
  +status: TransferStatusT
|};

@observer
export default class TransferWaitingPage extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    const { intl } = this.context;
    const { status } = this.props;

    const internetConnectionWarningComponent = (
      <WarningBox>
        {intl.formatMessage(messages.internetConnectionWarning)}
      </WarningBox>
    );

    return (
      <div className={styles.component}>
        {internetConnectionWarningComponent}

        <div className={styles.annotatedLoaderWrapper}>
          <AnnotatedLoader
            title={intl.formatMessage(messages.title)}
            details={this.getMessage(intl, status)}
          />
        </div>
      </div>
    );
  }

  getMessage(
    intl: $npm$ReactIntl$IntlFormat,
    status: TransferStatusT,
  ): string {
    switch (status) {
      case TransferStatus.RESTORING_ADDRESSES:
        return intl.formatMessage(messages.restoringAddresses);
      case TransferStatus.CHECKING_ADDRESSES:
        return intl.formatMessage(messages.checkingAddresses);
      case TransferStatus.GENERATING_TX:
        return intl.formatMessage(messages.generatingTx);
      default: throw new Error('TransferWaitingPage::getMessage unexpected status');
    }
  }
}
