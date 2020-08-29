// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed, } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import LocalizableError from '../../i18n/LocalizableError';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import TransferSendPage from './TransferSendPage';
import type { GeneratedData as TransferSendData } from './TransferSendPage';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

export type GeneratedData = typeof UpgradeTxDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
  +onSubmit: void => void,
|};

const messages = defineMessages({
  explanation: {
    id: 'upgradetx.explanation',
    defaultMessage: '!!!We found some ADA in your Byron-era wallet. Would you like to transfer it to your new Shelley wallet?',
  },
});

@observer
export default class UpgradeTxDialogContainer extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { transferRequest } = this.generated.stores.substores.ada.yoroiTransfer;

    const header = (
      <div>
        {intl.formatMessage(messages.explanation)}
        <br /><br />
      </div>
    );
    return (
      <TransferSendPage
        {...this.generated.TransferSendProps}
        header={header}
        onSubmit={{
          trigger: this.props.onSubmit,
          label: intl.formatMessage(globalMessages.upgradeLabel),
        }}
        onClose={{
          trigger: this.props.onClose,
          label: intl.formatMessage(globalMessages.skipLabel),
        }}
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
          yoroiTransfer: {|
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
            yoroiTransfer: {
              transferRequest: {
                error: stores.substores.ada.yoroiTransfer.transferRequest.error,
                result: stores.substores.ada.yoroiTransfer.transferRequest.result,
                reset: stores.substores.ada.yoroiTransfer.transferRequest.reset,
              },
            },
          },
        },
      },
    });
  }
}
