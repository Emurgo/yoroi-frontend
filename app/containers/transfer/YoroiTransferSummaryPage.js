// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { TransferTx } from '../../types/TransferTypes';
import LocalizableError from '../../i18n/LocalizableError';
import TransferSummaryPage from '../../components/transfer/TransferSummaryPage';
import type { ExplorerType } from '../../domain/Explorer';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';

const messages = defineMessages({
  addressFromSubLabel: {
    id: 'yoroiTransfer.summary.addressFrom.subLabel',
    defaultMessage: '!!!Wallet Addresses',
  }
});

type Props = {|
  formattedWalletAmount: Function,
  selectedExplorer: ExplorerType,
  transferTx: TransferTx,
  onSubmit: Function,
  isSubmitting: boolean,
  onCancel: Function,
  error: ?LocalizableError,
  classicTheme: boolean,
  coinPrice: ?number,
  unitOfAccountSetting: UnitOfAccountSettingType,
|};

/** Show user what the transfer would do to get final confirmation */
@observer
export default class YoroiTransferSummaryPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { transferTx, isSubmitting, error, formattedWalletAmount,
      onSubmit, onCancel, classicTheme, coinPrice, unitOfAccountSetting } = this.props;

    return (
      <TransferSummaryPage
        formattedWalletAmount={formattedWalletAmount}
        selectedExplorer={this.props.selectedExplorer}
        transferTx={transferTx}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        error={error}
        addressFromSubLabel={intl.formatMessage(messages.addressFromSubLabel)}
        classicTheme={classicTheme}
        coinPrice={coinPrice}
        unitOfAccountSetting={unitOfAccountSetting}
      />
    );
  }
}
