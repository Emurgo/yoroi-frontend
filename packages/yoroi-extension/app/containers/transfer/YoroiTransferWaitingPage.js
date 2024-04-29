// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { TransferStatusT } from '../../types/TransferTypes';
import { TransferStatus } from '../../types/TransferTypes';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import Dialog from '../../components/widgets/Dialog/Dialog';

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
  }
});

type Props = {|
  +status: TransferStatusT
|};

@observer
export default class YoroiTransferWaitingPage extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    const { intl } = this.context;
    const { status } = this.props;

    return (
      <Dialog
        closeOnOverlayClick={false}
      >
        <AnnotatedLoader
          title={intl.formatMessage(messages.title)}
          details={this.getMessage(intl, status)}
        />
      </Dialog>
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
