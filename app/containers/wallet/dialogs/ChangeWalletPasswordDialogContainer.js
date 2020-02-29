// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import ChangeWalletPasswordDialog from '../../../components/wallet/settings/ChangeWalletPasswordDialog';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import LocalizableError from '../../../i18n/LocalizableError';
import WalletSettingsActions from '../../../actions/ada/wallet-settings-actions';
import DialogsActions from '../../../actions/dialogs-actions';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';

export type GeneratedData = {|
  +stores: {|
    +walletSettings: {|
      +changeSigningKeyRequest: {|
        +reset: void => void,
        +isExecuting: boolean,
        +error: ?LocalizableError,
      |},
    |},
    +profile: {|
      +isClassicTheme: boolean,
    |},
    +wallets: {|
      +selected: null | PublicDeriver<>,
    |},
    +uiDialogs: {|
      +dataForActiveDialog: {|
        +currentPasswordValue: string,
        +newPasswordValue: string,
        +repeatedPasswordValue: string,
      |},
    |},
  |},
  +actions: {|
    +walletSettings: {|
      +updateSigningPassword: {|
        +trigger: typeof WalletSettingsActions.prototype.updateSigningPassword.trigger
      |},
    |},
    +dialogs: {|
      +updateDataForActiveDialog: {|
        +trigger: typeof DialogsActions.prototype.updateDataForActiveDialog.trigger
      |},
      +closeActiveDialog: {|
        +trigger: typeof DialogsActions.prototype.closeActiveDialog.trigger
      |},
    |},
  |},
|};

@observer
export default class ChangeWalletPasswordDialogContainer
  extends Component<InjectedOrGenerated<GeneratedData>> {

  @computed get generated(): GeneratedData {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ChangeWalletPasswordDialogContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const settingActions = actions.ada.walletSettings;
    const settingStores = this.props.stores.substores.ada.walletSettings;
    return Object.freeze({
      stores: {
        walletSettings: {
          changeSigningKeyRequest: {
            reset: settingStores.changeSigningKeyRequest.reset,
            isExecuting: settingStores.changeSigningKeyRequest.isExecuting,
            error: settingStores.changeSigningKeyRequest.error,
          },
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        uiDialogs: {
          dataForActiveDialog: {
            currentPasswordValue: stores.uiDialogs.dataForActiveDialog.currentPasswordValue,
            newPasswordValue: stores.uiDialogs.dataForActiveDialog.newPasswordValue,
            repeatedPasswordValue: stores.uiDialogs.dataForActiveDialog.repeatedPasswordValue,
          },
        },
      },
      actions: {
        walletSettings: {
          updateSigningPassword: { trigger: settingActions.updateSigningPassword.trigger },
        },
        dialogs: {
          updateDataForActiveDialog: { trigger: actions.dialogs.updateDataForActiveDialog.trigger },
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
      },
    });
  }

  render() {
    const { actions } = this.generated;
    const { uiDialogs, profile } = this.generated.stores;
    const { walletSettings } = this.generated.stores;
    const dialogData = uiDialogs.dataForActiveDialog;
    const { updateDataForActiveDialog } = actions.dialogs;
    const publicDeriver = this.generated.stores.wallets.selected;
    const { changeSigningKeyRequest } = walletSettings;

    if (!publicDeriver) throw new Error('Active wallet required for ChangeWalletPasswordDialogContainer.');

    return (
      <ChangeWalletPasswordDialog
        dialogData={dialogData}
        onSave={async (values) => {
          const { oldPassword, newPassword } = values;
          await actions.walletSettings.updateSigningPassword.trigger({
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
