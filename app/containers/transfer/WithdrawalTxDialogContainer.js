// @flow
import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed, } from 'mobx';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import LocalizableError from '../../i18n/LocalizableError';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import TransferSendPage from './TransferSendPage';
import type { GeneratedData as TransferSendData } from './TransferSendPage';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';

export type GeneratedData = typeof WithdrawalTxDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
|};

@observer
export default class WithdrawalTxDialogContainer extends Component<Props> {

  render(): Node {
    const { createWithdrawalTx } = this.generated.stores.substores.ada.delegationTransaction;
    return (
      <TransferSendPage
        {...this.generated.TransferSendProps}
        onClose={this.props.onClose}
        transactionRequest={createWithdrawalTx}
        toTransferTx={tentativeTx => {
          if (!(tentativeTx instanceof HaskellShelleyTxSignRequest)) {
            throw new Error(`${nameof(WithdrawalTxDialogContainer)} incorrect tx type`);
          }

          const deregistrationsMap = new Map(tentativeTx.keyDeregistrations(true).map(key => [
            key.rewardAddress, key.refund
          ]));
          const withdrawals = tentativeTx.withdrawals(true);
          return {
            recoveredBalance: withdrawals.reduce(
              (sum, curr) => sum.plus(curr.amount),
              new BigNumber(0)
            ),
            fee: tentativeTx.fee(true),
            senders: tentativeTx
              .uniqueSenderAddresses(),
            receivers: tentativeTx
              .receivers(true),
            withdrawals: withdrawals.map(withdrawal => ({
              ...withdrawal,
              refund: deregistrationsMap.get(withdrawal.address) ?? new BigNumber(0),
            })),
          };
        }}
      />
    );
  }

  @computed get generated(): {|
    TransferSendProps: InjectedOrGenerated<TransferSendData>,
    actions: {||},
    stores: {|
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
