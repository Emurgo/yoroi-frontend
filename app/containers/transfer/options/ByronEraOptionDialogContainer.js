// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import ByronOptionDialog from '../../../components/transfer/cards/ByronOptionDialog';
import { TransferKind, TransferSource, } from '../../../types/TransferTypes';

export type GeneratedData = typeof ByronEraOptionDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onCancel: void => void,
|};

@observer
export default class ByronEraOptionDialogContainer extends Component<Props> {

  _getYoroiTransferActions() {
    return this.generated.actions.ada.yoroiTransfer;
  }

  startTransferDaedalusFunds: void => void = () => {
    this.generated.actions.ada.daedalusTransfer.startTransferFunds.trigger();
  }

  startTransferDaedalusPaperFunds: void => void = () => {
    this.generated.actions.ada.daedalusTransfer.startTransferPaperFunds.trigger();
  }

  startTransferDaedalusMasterKe: void => void = () => {
    this.generated.actions.ada.daedalusTransfer.startTransferMasterKey.trigger();
  }

  startTransferIcarusFunds: void => void = () => {
    this._getYoroiTransferActions().startTransferFunds.trigger({
      source: TransferSource.BYRON
    });
  }

  startTransferYoroiPaperFunds: void => void = () => {
    this._getYoroiTransferActions().startTransferPaperFunds.trigger({
      source: TransferSource.BYRON
    });
  }

  startTransferTrezorFunds: void => void = () => {
    this._getYoroiTransferActions().startTransferLegacyHardwareFunds.trigger(TransferKind.TREZOR);
  }

  startTransferLedgerFunds: void => void = () => {
    this._getYoroiTransferActions().startTransferLegacyHardwareFunds.trigger(TransferKind.LEDGER);
  }

  render(): Node {
    return (
      <ByronOptionDialog
        daedalus={{
          onStandard: this.startTransferDaedalusFunds,
          onPaper: this.startTransferDaedalusPaperFunds,
          onMaster: this.startTransferDaedalusMasterKe,
        }}
        icarus={{
          onStandard: this.startTransferIcarusFunds,
          onPaper: this.startTransferYoroiPaperFunds,
          onTrezor: this.startTransferTrezorFunds,
          onLedger: this.startTransferLedgerFunds,
        }}
        onCancel={this.props.onCancel}
      />
    );
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ByronEraOptionDialogContainer)} no way to generated props`);
    }
    const { actions } = this.props;
    const { daedalusTransfer } = actions.ada;
    const { yoroiTransfer } = actions.ada;
    return Object.freeze({
      actions: {
        ada: {
          daedalusTransfer: {
            startTransferFunds: { trigger: daedalusTransfer.startTransferFunds.trigger },
            startTransferPaperFunds: { trigger: daedalusTransfer.startTransferPaperFunds.trigger },
            startTransferMasterKey: { trigger: daedalusTransfer.startTransferMasterKey.trigger },
          },
          yoroiTransfer: {
            startTransferLegacyHardwareFunds: {
              trigger: yoroiTransfer.startTransferLegacyHardwareFunds.trigger
            },
            startTransferPaperFunds: { trigger: yoroiTransfer.startTransferPaperFunds.trigger },
            startTransferFunds: { trigger: yoroiTransfer.startTransferFunds.trigger },
          },
        },
      },
    });
  }
}
