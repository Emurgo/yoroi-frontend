// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import UserPasswordDialog from '../../../components/wallet/settings/paper-wallets/UserPasswordDialog';
import type { InjectedProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';
import PaperWalletsActions from "../../../actions/ada/paper-wallets-actions";
import PaperWalletCreateStore, { ProgressStep } from "../../../stores/ada/PaperWalletCreateStore";
import { Logger } from "../../../utils/logging";

@observer
export default class CreatePaperWalletDialogContainer extends Component<InjectedProps> {



  render() {
    const { actions } = this.props;
    const { uiDialogs } = this.props.stores;
    const { updateDataForActiveDialog } = actions.dialogs;
    const dialogData = uiDialogs.dataForActiveDialog;

    const paperStore = this._getStore();
    const paperActions = this._getActions();

    if (paperStore.progressInfo === ProgressStep.INIT) {
      paperActions.submitInit.trigger({
        isCustomPassword: dialogData.isCustomPassword,
        numAddresses: dialogData.numAddresses,
      });
    }

    switch (paperStore.progressInfo) {
      case ProgressStep.USER_PASSWORD:
        return (
          <UserPasswordDialog
            passwordValue={dialogData.passwordValue}
            repeatedPasswordValue={dialogData.repeatedPasswordValue}
            onNext={paperActions.submitUserPassword.trigger}
            onCancel={() => {
              actions.dialogs.closeActiveDialog.trigger();
              paperActions.cancel.trigger();
            }}
            onDataChange={data => {
              updateDataForActiveDialog.trigger({ data });
            }}
          />
        );
      case ProgressStep.CREATE:
        console.log(42);
        return null;
      default:
        Logger.error('CreatePaperWalletDialogContainer::render: something unexpected happened');
        return null;
    }
  }

  _getActions = (): PaperWalletsActions => this.props.actions[environment.API].paperWallets;
  _getStore = (): PaperWalletCreateStore => this.props.stores.substores[environment.API].paperWallets;
}
