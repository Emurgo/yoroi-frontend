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
    const { walletSettings } = this.props.stores.substores[environment.API];
    const dialogData = uiDialogs.dataForActiveDialog;
    const { updateDataForActiveDialog } = actions.dialogs;
    const publicDeriver = this.props.stores.wallets.selected;
    const { changeSigningKeyRequest } = walletSettings;

    if (!publicDeriver) throw new Error('Active wallet required for ChangeWalletPasswordDialogContainer.');

    return (
      <ChangeWalletPasswordDialog
        currentPasswordValue={dialogData.currentPasswordValue}
        newPasswordValue={dialogData.newPasswordValue}
        repeatedPasswordValue={dialogData.repeatedPasswordValue}
        onSave={async (values) => {
          const { oldPassword, newPassword } = values;
          await actions[environment.API].walletSettings.updateSigningPassword.trigger({
            publicDeriver,
            oldPassword,
            newPassword
          });
        }}
        onCancel={() => {
          actions.dialogs.closeActiveDialog.trigger();
          changeSigningKeyRequest.reset();
        }}
        onPasswordSwitchToggle={() => {
          changeSigningKeyRequest.reset();
        }}
        onDataChange={data => {
          updateDataForActiveDialog.trigger({ data });
        }}
        isSubmitting={changeSigningKeyRequest.isExecuting}
        error={changeSigningKeyRequest.error}
        classicTheme={profile.isClassicTheme}
      />
    );
  }

}
