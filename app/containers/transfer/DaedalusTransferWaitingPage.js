// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import AnnotatedLoader from '../../components/transfer/AnnotatedLoader';

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
      <AnnotatedLoader
        title={intl.formatMessage(messages.title)}
        details={intl.formatMessage(messages[status])}
      />
    );
  }
}
