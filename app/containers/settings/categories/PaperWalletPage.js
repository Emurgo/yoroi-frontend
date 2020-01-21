// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import PaperWalletSettings from '../../../components/settings/categories/PaperWalletSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';
import UserPasswordDialog from '../../../components/wallet/settings/paper-wallets/UserPasswordDialog';
import CreatePaperWalletDialogContainer from '../../wallet/dialogs/CreatePaperWalletDialogContainer';

@observer
export default class PaperWalletPage extends Component<InjectedProps> {

  createPaperWallet = (data: {| numAddresses: number, printAccountPlate: boolean |}) => {
    this.props.actions.dialogs.open.trigger({ dialog: UserPasswordDialog });
    this.props.actions.dialogs.updateDataForActiveDialog.trigger({ data });
  };

  render() {
    const { actions, stores } = this.props;
    const { uiDialogs } = stores;

    const { paperWalletsIntro } = stores.profile;

    return (
      <PaperWalletSettings
        onCreatePaper={this.createPaperWallet}
        paperWalletsIntroText={paperWalletsIntro}
        isDialogOpen={uiDialogs.isOpen(UserPasswordDialog)}
        dialog={(
          <CreatePaperWalletDialogContainer stores={stores} actions={actions} />
        )}
        error={null}
      />
    );
  }

}
