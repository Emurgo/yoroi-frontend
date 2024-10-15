// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import TransferSendPage from './TransferSendPage';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import globalMessages from '../../i18n/global-messages';
import { intlShape, } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';
import { getDefaultEntryToken } from '../../stores/toplevel/TokenInfoStore';
import type { StoresProps } from '../../stores';

type Props = {|
  ...StoresProps,
  +onClose: void => void,
|};

@observer
export default class WithdrawalTxDialogContainer extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { stores } = this.props;
    const { intl } = this.context;

    if (this.props.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(WithdrawalTxDialogContainer)} no selected network`);
    }
    const defaultToken = this.props.stores.tokenInfoStore.getDefaultTokenInfo(
      this.props.stores.profile.selectedNetwork.NetworkId
    );

    const { createWithdrawalTx } = this.props.stores.substores.ada.delegationTransaction;
    return (
      <TransferSendPage
        stores={stores}
        onClose={{
          trigger: this.props.onClose,
          label: intl.formatMessage(globalMessages.cancel),
        }}
        onSubmit={{
          trigger: () => {}, // nothing extra to do
          label: intl.formatMessage(globalMessages.confirm),
        }}
        transactionRequest={{
          error: createWithdrawalTx.error,
          result: createWithdrawalTx.result,
          reset: createWithdrawalTx.reset,
        }}
        toTransferTx={tentativeTx => {
          if (!(tentativeTx instanceof HaskellShelleyTxSignRequest)) {
            throw new Error(`${nameof(WithdrawalTxDialogContainer)} incorrect tx type`);
          }

          const deregistrations = tentativeTx.keyDeregistrations();
          const withdrawals = tentativeTx.withdrawals();

          return {
            recoveredBalance: withdrawals.reduce(
              (sum, curr) => sum.joinAddCopy(curr.amount),
              new MultiToken([], getDefaultEntryToken(defaultToken))
            ),
            fee: tentativeTx.fee(),
            senders: tentativeTx
              .uniqueSenderAddresses(),
            receivers: tentativeTx
              .receivers(true),
            withdrawals,
            deregistrations,
          };
        }}
      />
    );
  }
}
