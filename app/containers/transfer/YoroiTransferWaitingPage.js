// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import AnnotatedLoader from '../../components/transfer/AnnotatedLoader';

const messages = defineMessages({
  title: {
    id: 'yoroiTransfer.waiting.title.label',
    defaultMessage: '!!!Wallet is being restored',
  },
  restoringAddresses: {
    id: 'yoroiTransfer.waiting.progressInfo.restoringAddresses',
    defaultMessage: '!!!Fetching addresses',
  },
  checkingAddresses: {
    id: 'yoroiTransfer.waiting.progressInfo.checkingAddresses',
    defaultMessage: '!!!Checking addresses funds',
  },
  generatingTx: {
    id: 'yoroiTransfer.waiting.checkingAddresses.generatingTx',
    defaultMessage: '!!!Generating transfer transaction',
  },
  internetConnectionWarning: {
    id: 'yoroiTransfer.waiting.warning',
    defaultMessage: '!!!⚠️ This may take a long time or fail on poor internet connections',
  }
});

type Props = {|
  status: string
|};

@observer
export default class YoroiTransferWaitingPage extends Component<Props> {

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
