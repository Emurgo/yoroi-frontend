// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import CreatePaperWalletDialog from '../../../components/wallet/settings/CreatePaperWalletDialog';
import type { InjectedProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';

@observer
export default class CreatePaperWalletDialogContainer extends Component<InjectedProps> {

  render() {
    const { actions } = this.props;
    const { uiDialogs } = this.props.stores;
    const { wallets } = this.props.stores.substores[environment.API];
    const { createPaperWalletRequest } = wallets;
    const { updateDataForActiveDialog } = actions.dialogs;
    const dialogData = uiDialogs.dataForActiveDialog;

    return (
      <CreatePaperWalletDialog
        numAddresses={dialogData.numAddresses}
        isCustomPassword={dialogData.isCustomPassword}
        passwordValue={dialogData.passwordValue}
        onSave={(values: { paperPassword?: string }) => {
          const { paperPassword } = values;
          actions[environment.API].wallets.createPaperWallet.trigger({
            password: paperPassword,
            numAddresses: 1
          });
        }}
        onCancel={() => {
          actions.dialogs.closeActiveDialog.trigger();
          createPaperWalletRequest.reset();
        }}
        onPasswordSwitchToggle={() => {
          createPaperWalletRequest.reset();
        }}
        onDataChange={data => {
          updateDataForActiveDialog.trigger({ data });
        }}
        isSubmitting={createPaperWalletRequest.isExecuting}
        error={createPaperWalletRequest.error}
      />
    );
  }

}
