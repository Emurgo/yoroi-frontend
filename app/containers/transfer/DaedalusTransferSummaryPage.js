// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { TransferTx } from '../../types/TransferTypes';
import LocalizableError from '../../i18n/LocalizableError';
import TransferSummaryPage from '../../components/transfer/TransferSummaryPage';

const messages = defineMessages({
  addressFromSubLabel: {
    id: 'daedalusTransfer.summary.addressFrom.subLabel',
    defaultMessage: '!!!Daedalus wallet Addresses',
    description: 'SubLabel showing addresses where the tx will be from',
  }
});

type Props = {
  formattedWalletAmount: Function,
  transferTx: TransferTx,
  onSubmit: Function,
  isSubmitting: boolean,
  onCancel: Function,
  error: ?LocalizableError
};

/** Show user what the transfer would do to get final confirmation */
@observer
export default class DaedalusTransferSummaryPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { transferTx, isSubmitting, error, formattedWalletAmount,
      onSubmit, onCancel } = this.props;

    return (
      <TransferSummaryPage
        formattedWalletAmount={formattedWalletAmount}
        transferTx={transferTx}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        error={error}
        addressFromSubLabel={intl.formatMessage(messages.addressFromSubLabel)}
      />
    );
  }
}
