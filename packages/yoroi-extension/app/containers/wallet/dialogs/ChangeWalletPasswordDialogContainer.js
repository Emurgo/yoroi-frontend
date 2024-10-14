// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import ChangeWalletPasswordDialog from '../../../components/wallet/settings/ChangeWalletPasswordDialog';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';

type Props = {|
  publicDeriverId: number,
|};

@observer
export default class ChangeWalletPasswordDialogContainer extends Component<{| ...Props, ...StoresAndActionsProps |}> {

  render(): Node {
    const { actions, stores } = this.props;
    const { uiDialogs, walletSettings } = stores;
    const { updateDataForActiveDialog } = actions.dialogs;
    const { changeSigningKeyRequest } = walletSettings;

    return (
      <ChangeWalletPasswordDialog
        dialogData={{
          currentPasswordValue: uiDialogs.getActiveData<string>('currentPasswordValue'),
          newPasswordValue: uiDialogs.getActiveData<string>('newPasswordValue'),
          repeatedPasswordValue: uiDialogs.getActiveData<string>('repeatedPasswordValue'),
        }}
        onSave={async (values) => {
          const { oldPassword, newPassword } = values;
          await stores.walletSettings.updateSigningPassword({
            publicDeriverId: this.props.publicDeriverId,
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
          updateDataForActiveDialog.trigger(data);
        }}
        isSubmitting={changeSigningKeyRequest.isExecuting}
        error={changeSigningKeyRequest.error}
      />
    );
  }
}
