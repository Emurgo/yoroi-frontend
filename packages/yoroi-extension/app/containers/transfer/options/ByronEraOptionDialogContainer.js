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

  startTransferYoroiPaperFunds: void => void = () => {
    this.generated.actions.yoroiTransfer.startTransferFunds.trigger({
      source: {
        type: 'bip44',
        extra: 'paper',
        length: config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT,
      },
    });
  }

  render(): Node {
    return (
      <ByronOptionDialog
        icarus={{
          onPaper: this.startTransferYoroiPaperFunds,
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
    const { yoroiTransfer } = actions;
    return Object.freeze({
      stores: {
        profile: {
          selectedComplexityLevel: stores.profile.selectedComplexityLevel,
        },
      },
      actions: {
        yoroiTransfer: {
          startTransferFunds: { trigger: yoroiTransfer.startTransferFunds.trigger },
        },
      },
    });
  }
}
