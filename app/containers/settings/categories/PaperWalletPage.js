// @flow
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PaperWalletSettings from '../../../components/settings/categories/PaperWalletSettings';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import UserPasswordDialog from '../../../components/wallet/settings/paper-wallets/UserPasswordDialog';
import CreatePaperWalletDialogContainer from '../../wallet/dialogs/CreatePaperWalletDialogContainer';
import type {
  GeneratedData as CreatePaperWalletDialogContainerData
} from '../../wallet/dialogs/CreatePaperWalletDialogContainer';
import DialogsActions from '../../../actions/dialogs-actions';

type GeneratedData = {|
  +stores: {|
    +profile: {|
      +paperWalletsIntro: string,
    |},
    +uiDialogs: {|
      +isOpen: any => boolean,
    |},
  |},
  +actions: {|
    +dialogs: {|
      +open: {|
        +trigger: typeof DialogsActions.prototype.open.trigger
      |},
      +updateDataForActiveDialog: {|
        +trigger: typeof DialogsActions.prototype.updateDataForActiveDialog.trigger
      |},
    |},
  |},
  +CreatePaperWalletDialogContainerProps: InjectedOrGenerated<CreatePaperWalletDialogContainerData>,
|};

@observer
export default class PaperWalletPage extends Component<InjectedOrGenerated<GeneratedData>> {

  @computed get generated(): GeneratedData {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(PaperWalletPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          paperWalletsIntro: stores.profile.paperWalletsIntro,
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
        },
      },
      actions: {
        dialogs: {
          open: { trigger: actions.dialogs.open.trigger },
          updateDataForActiveDialog: { trigger: actions.dialogs.updateDataForActiveDialog.trigger },
        },
      },
      CreatePaperWalletDialogContainerProps: { stores, actions },
    });
  }

  createPaperWallet = (data: {| numAddresses: number, printAccountPlate: boolean |}) => {
    this.generated.actions.dialogs.open.trigger({ dialog: UserPasswordDialog });
    this.generated.actions.dialogs.updateDataForActiveDialog.trigger({ data });
  };

  render() {
    return (
      <PaperWalletSettings
        onCreatePaper={this.createPaperWallet}
        paperWalletsIntroText={this.generated.stores.profile.paperWalletsIntro}
        isDialogOpen={this.generated.stores.uiDialogs.isOpen(UserPasswordDialog)}
        dialog={(
          <CreatePaperWalletDialogContainer
            {...this.generated.CreatePaperWalletDialogContainerProps}
          />
        )}
        error={null}
      />
    );
  }

}
