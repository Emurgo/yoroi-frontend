// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed, } from 'mobx';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import LocalizableError from '../../i18n/LocalizableError';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import TransferSendPage from './TransferSendPage';
import type { GeneratedData as TransferSendData } from './TransferSendPage';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import globalMessages from '../../i18n/global-messages';
import { intlShape, } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';
import type { NetworkRow, TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { getDefaultEntryToken } from '../../stores/toplevel/TokenInfoStore';

export type GeneratedData = typeof WithdrawalTxDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
|};

@observer
export default class WithdrawalTxDialogContainer extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { createWithdrawalTx } = this.generated.stores.substores.ada.delegationTransaction;

    if (this.generated.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(WithdrawalTxDialogContainer)} no selected network`);
    }
    const defaultToken = this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
      this.generated.stores.profile.selectedNetwork.NetworkId
    );

    return (
      <TransferSendPage
        {...this.generated.TransferSendProps}
        onClose={{
          trigger: this.props.onClose,
          label: intl.formatMessage(globalMessages.cancel),
        }}
        onSubmit={{
          trigger: () => {}, // nothing extra to do
          label: intl.formatMessage(globalMessages.confirm),
        }}
        transactionRequest={createWithdrawalTx}
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

  @computed get generated(): {|
    TransferSendProps: InjectedOrGenerated<TransferSendData>,
    actions: {||},
    stores: {|
      tokenInfoStore: {|
        getDefaultTokenInfo: number => $ReadOnly<TokenRow>,
      |},
      profile: {| selectedNetwork: void | $ReadOnly<NetworkRow> |},
      substores: {|
        ada: {|
          delegationTransaction: {|
            createWithdrawalTx: {|
              reset: void => void,
              error: ?LocalizableError,
              result: ?ISignRequest<any>
            |},
          |},
        |},
      |},
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WithdrawalTxDialogContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      TransferSendProps: ({ actions, stores, }: InjectedOrGenerated<TransferSendData>),
      actions: Object.freeze({
      }),
      stores: {
        profile: {
          selectedNetwork: stores.profile.selectedNetwork,
        },
        tokenInfoStore: {
          getDefaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfo,
        },
        substores: {
          ada: {
            delegationTransaction: {
              createWithdrawalTx: {
                error: stores.substores.ada.delegationTransaction.createWithdrawalTx.error,
                result: stores.substores.ada.delegationTransaction.createWithdrawalTx.result,
                reset: stores.substores.ada.delegationTransaction.createWithdrawalTx.reset,
              },
            },
          },
        },
      },
    });
  }
}
