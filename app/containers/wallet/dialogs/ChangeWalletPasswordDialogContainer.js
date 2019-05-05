// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ChangeWalletPasswordDialog from '../../../components/wallet/settings/ChangeWalletPasswordDialog';
import type { InjectedProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';

@observer
export default class ChangeWalletPasswordDialogContainer extends Component<InjectedProps> {

  render() {
    const { actions } = this.props;
    const { uiDialogs, profile } = this.props.stores;
    const { wallets, walletSettings } = this.props.stores.substores[environment.API];
    const dialogData = uiDialogs.dataForActiveDialog;
    const { updateDataForActiveDialog } = actions.dialogs;
    const activeWallet = wallets.active;
    const { updateWalletPasswordRequest } = walletSettings;

    if (!activeWallet) throw new Error('Active wallet required for ChangeWalletPasswordDialogContainer.');

    return (
      <ChangeWalletPasswordDialog
        currentPasswordValue={dialogData.currentPasswordValue}
        newPasswordValue={dialogData.newPasswordValue}
        repeatedPasswordValue={dialogData.repeatedPasswordValue}
        onSave={(values: { oldPassword: string, newPassword: string }) => {
          const walletId = activeWallet.id;
          const { oldPassword, newPassword } = values;
          actions[environment.API].walletSettings.updateWalletPassword.trigger({
            walletId, oldPassword, newPassword
          });
        }}
        onCancel={() => {
          actions.dialogs.closeActiveDialog.trigger();
          updateWalletPasswordRequest.reset();
        }}
        onPasswordSwitchToggle={() => {
          updateWalletPasswordRequest.reset();
        }}
        onDataChange={data => {
          updateDataForActiveDialog.trigger({ data });
        }}
        isSubmitting={updateWalletPasswordRequest.isExecuting}
        error={updateWalletPasswordRequest.error}
        classicTheme={profile.isClassicTheme}
      />
    );
  }

}
