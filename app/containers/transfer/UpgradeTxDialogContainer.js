// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed, } from 'mobx';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import LocalizableError from '../../i18n/LocalizableError';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import TransferSendPage from './TransferSendPage';
import type { GeneratedData as TransferSendData } from './TransferSendPage';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';

export type GeneratedData = typeof UpgradeTxDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
|};

@observer
export default class UpgradeTxDialogContainer extends Component<Props> {

  render(): Node {
    const { transferRequest } = this.generated.stores.substores.ada.ledgerConnect;
    return (
      <TransferSendPage
        {...this.generated.TransferSendProps}
        onClose={this.props.onClose}
        transactionRequest={transferRequest}
        toTransferTx={tentativeTx => {
          if (!(tentativeTx instanceof HaskellShelleyTxSignRequest)) {
            throw new Error(`${nameof(UpgradeTxDialogContainer)} incorrect tx type`);
          }

          return {
            recoveredBalance: tentativeTx.totalInput(true),
            fee: tentativeTx.fee(true),
            senders: tentativeTx
              .uniqueSenderAddresses(),
            receivers: tentativeTx
              .receivers(true),
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
          ledgerConnect: {|
            transferRequest: {|
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
      throw new Error(`${nameof(UpgradeTxDialogContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      TransferSendProps: ({ actions, stores, }: InjectedOrGenerated<TransferSendData>),
      actions: Object.freeze({
      }),
      stores: {
        substores: {
          ada: {
            ledgerConnect: {
              transferRequest: {
                error: stores.substores.ada.ledgerConnect.transferRequest.error,
                result: stores.substores.ada.ledgerConnect.transferRequest.result,
                reset: stores.substores.ada.ledgerConnect.transferRequest.reset,
              },
            },
          },
        },
      },
    });
  }
}
