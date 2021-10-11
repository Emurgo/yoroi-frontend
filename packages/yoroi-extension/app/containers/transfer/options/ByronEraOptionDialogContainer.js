// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import ByronOptionDialog from '../../../components/transfer/cards/ByronOptionDialog';
import type { RestoreModeType } from '../../../actions/common/wallet-restore-actions';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';
import { ComplexityLevels } from '../../../types/complexityLevelType';
import config from '../../../config';

export type GeneratedData = typeof ByronEraOptionDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onCancel: void => void,
|};

@observer
export default class ByronEraOptionDialogContainer extends Component<Props> {

  startTransferDaedalusFunds: void => void = () => {
    this.generated.actions.daedalusTransfer.startTransferFunds.trigger();
  }

  startTransferDaedalusPaperFunds: void => void = () => {
    this.generated.actions.daedalusTransfer.startTransferPaperFunds.trigger();
  }

  startTransferDaedalusMasterKe: void => void = () => {
    this.generated.actions.daedalusTransfer.startTransferMasterKey.trigger();
  }

  startTransferIcarusFunds: void => void = () => {
    this.generated.actions.yoroiTransfer.startTransferFunds.trigger({
      source: {
        type: 'bip44',
        extra: undefined,
        length: config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT,
      },
    });
  }

  startTransferYoroiPaperFunds: void => void = () => {
    this.generated.actions.yoroiTransfer.startTransferFunds.trigger({
      source: {
        type: 'bip44',
        extra: 'paper',
        length: config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT,
      },
    });
  }

  startTransferTrezorFunds: void => void = () => {
    this.generated.actions.yoroiTransfer.startTransferFunds.trigger({
      source: { type: 'bip44', extra: 'trezor' },
    });
  }

  startTransferLedgerFunds: void => void = () => {
    this.generated.actions.yoroiTransfer.startTransferFunds.trigger({
      source: { type: 'bip44', extra: 'ledger' },
    });
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
        complexityLevel={
          this.generated.stores.profile.selectedComplexityLevel || ComplexityLevels.Simple
        }
      />
    );
  }

  @computed get generated(): {|
    stores: {|
      profile: {|
        selectedComplexityLevel: ?ComplexityLevelType,
      |},
    |},
    actions: {|
      daedalusTransfer: {|
        startTransferFunds: {|
          trigger: (params: void) => void
        |},
        startTransferMasterKey: {|
          trigger: (params: void) => void
        |},
        startTransferPaperFunds: {|
          trigger: (params: void) => void
        |}
      |},
      yoroiTransfer: {|
        startTransferFunds: {|
          trigger: (params: {|
            source: RestoreModeType
          |}) => void
        |},
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ByronEraOptionDialogContainer)} no way to generated props`);
    }
    const { actions, stores, } = this.props;
    const { daedalusTransfer } = actions;
    const { yoroiTransfer } = actions;
    return Object.freeze({
      stores: {
        profile: {
          selectedComplexityLevel: stores.profile.selectedComplexityLevel,
        },
      },
      actions: {
        daedalusTransfer: {
          startTransferFunds: { trigger: daedalusTransfer.startTransferFunds.trigger },
          startTransferPaperFunds: { trigger: daedalusTransfer.startTransferPaperFunds.trigger },
          startTransferMasterKey: { trigger: daedalusTransfer.startTransferMasterKey.trigger },
        },
        yoroiTransfer: {
          startTransferFunds: { trigger: yoroiTransfer.startTransferFunds.trigger },
        },
      },
    });
  }
}
