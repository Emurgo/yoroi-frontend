// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import ChangeWalletPasswordDialog from '../../../components/wallet/settings/ChangeWalletPasswordDialog';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import LocalizableError from '../../../i18n/LocalizableError';

export type GeneratedData = typeof ChangeWalletPasswordDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  publicDeriver: PublicDeriver<>,
|};

@observer
export default class ChangeWalletPasswordDialogContainer extends Component<Props> {

  render(): Node {
    const { actions } = this.generated;
    const { uiDialogs, profile } = this.generated.stores;
    const { walletSettings } = this.generated.stores;
    const dialogData = uiDialogs.dataForActiveDialog;
    const { updateDataForActiveDialog } = actions.dialogs;
    const { changeSigningKeyRequest } = walletSettings;

    return (
      <ChangeWalletPasswordDialog
        dialogData={dialogData}
        onSave={async (values) => {
          const { oldPassword, newPassword } = values;
          await actions.walletSettings.updateSigningPassword.trigger({
            publicDeriver: this.props.publicDeriver,
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

  @computed get generated(): {|
    actions: {|
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |},
        updateDataForActiveDialog: {|
          trigger: (params: {
            [key: string]: any,
            ...
          }) => void
        |}
      |},
      walletSettings: {|
        updateSigningPassword: {|
          trigger: (params: {|
            newPassword: string,
            oldPassword: string,
            publicDeriver: PublicDeriver<>
          |}) => Promise<void>
        |}
      |}
    |},
    stores: {|
      profile: {| isClassicTheme: boolean |},
      uiDialogs: {|
        dataForActiveDialog: {|
          +currentPasswordValue: void | string,
          +newPasswordValue: void | string,
          +repeatedPasswordValue: void | string
        |}
      |},
      walletSettings: {|
        changeSigningKeyRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          reset: () => void
        |}
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ChangeWalletPasswordDialogContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const settingActions = actions.walletSettings;
    const settingStores = this.props.stores.walletSettings;
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
}
