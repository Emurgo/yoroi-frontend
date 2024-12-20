// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import ChangeWalletPasswordDialog from '../../../components/wallet/settings/ChangeWalletPasswordDialog';
import type { StoresProps } from '../../../stores';

type Props = {|
  publicDeriverId: number,
|};

@observer
export default class ChangeWalletPasswordDialogContainer extends Component<{| ...Props, ...StoresProps |}> {

  render(): Node {
    const { stores } = this.props;
    const { uiDialogs, walletSettings } = stores;
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
          stores.uiDialogs.closeActiveDialog();
          changeSigningKeyRequest.reset();
        }}
        onPasswordSwitchToggle={() => {
          changeSigningKeyRequest.reset();
        }}
        onDataChange={data => {
          stores.uiDialogs.updateDataForActiveDialog(data);
        }}
        isSubmitting={changeSigningKeyRequest.isExecuting}
        error={changeSigningKeyRequest.error}
      />
    );
  }
}
