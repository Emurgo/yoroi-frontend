// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import WalletSettings from '../../../components/wallet/settings/WalletSettings';
import ResyncBlock from '../../../components/wallet/settings/ResyncBlock';
import RemoveWallet from '../../../components/wallet/settings/RemoveWallet';
import RemoveWalletDialog from '../../../components/wallet/settings/RemoveWalletDialog';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import { isValidWalletName } from '../../../utils/validations';
import type { WalletWithCachedMeta } from '../../../stores/toplevel/WalletStore';
import LocalizableError from '../../../i18n/LocalizableError';
import ChangeWalletPasswordDialogContainer from '../../wallet/dialogs/ChangeWalletPasswordDialogContainer';
import { WalletTypeOption } from '../../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import WalletSettingsActions from '../../../actions/ada/wallet-settings-actions';
import DialogsActions from '../../../actions/dialogs-actions';
import type { RenameModelResponse } from '../../../api/ada/index';
import type { GeneratedData as ChangeWalletPasswordDialogContainerData } from '../../wallet/dialogs/ChangeWalletPasswordDialogContainer';

type GeneratedData = {|
  +stores: {|
    +profile: {|
      +isClassicTheme: boolean,
    |},
    +walletSettings: {|
      +removeWalletRequest: {|
        +reset: void => void,
        +isExecuting: boolean,
        +error?: ?LocalizableError,
      |},
      +clearHistory: {|
        +reset: void => void,
        +isExecuting: boolean,
      |},
      +renameModelRequest: {|
        +error?: ?LocalizableError,
        +isExecuting: boolean,
        +wasExecuted: boolean,
        +result: ?RenameModelResponse,
      |},
      +lastUpdatedWalletField: string | null,
      +walletFieldBeingEdited: string | null,
    |},
    +uiDialogs: {|
      +isOpen: any => boolean,
    |},
    +wallets: {|
      +selected: null | WalletWithCachedMeta,
    |},
  |},
  +actions: {|
    +walletSettings: {|
      +startEditingWalletField: {|
        +trigger: typeof WalletSettingsActions.prototype.startEditingWalletField.trigger
      |},
      +stopEditingWalletField: {|
        +trigger: typeof WalletSettingsActions.prototype.stopEditingWalletField.trigger
      |},
      +cancelEditingWalletField: {|
        +trigger: typeof WalletSettingsActions.prototype.cancelEditingWalletField.trigger
      |},
      +renameConceptualWallet: {|
        +trigger: typeof WalletSettingsActions.prototype.renameConceptualWallet.trigger
      |},
      +resyncHistory: {|
        +trigger: typeof WalletSettingsActions.prototype.resyncHistory.trigger
      |},
      +removeWallet: {|
        +trigger: typeof WalletSettingsActions.prototype.removeWallet.trigger
      |},
    |},
    +dialogs: {|
      +open: {|
        +trigger: typeof DialogsActions.prototype.open.trigger
      |},
      +closeActiveDialog: {|
        +trigger: typeof DialogsActions.prototype.closeActiveDialog.trigger
      |},
    |},
  |},
  +ChangeWalletPasswordDialogContainerProps:
    InjectedOrGenerated<ChangeWalletPasswordDialogContainerData>,
|};

@observer
export default class WalletSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  componentWillUnmount() {
    this.generated.stores.walletSettings.removeWalletRequest.reset();
    this.generated.stores.walletSettings.clearHistory.reset();
  }

  @computed get generated(): GeneratedData {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletSettingsPage)} no way to generated props`);
    }
    const { actions, stores, } = this.props;
    const settingActions = actions.ada.walletSettings;
    const settingStores = this.props.stores.substores.ada.walletSettings;
    return Object.freeze({
      stores: {
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
        },
        walletSettings: {
          removeWalletRequest: {
            reset: settingStores.removeWalletRequest.reset,
            isExecuting: settingStores.removeWalletRequest.isExecuting,
            error: settingStores.removeWalletRequest.error,
          },
          clearHistory: {
            reset: settingStores.clearHistory.reset,
            isExecuting: settingStores.clearHistory.isExecuting,
          },
          renameModelRequest: {
            error: settingStores.renameModelRequest.error,
            isExecuting: settingStores.renameModelRequest.isExecuting,
            wasExecuted: settingStores.renameModelRequest.wasExecuted,
            result: settingStores.renameModelRequest.result,
          },
          lastUpdatedWalletField: settingStores.lastUpdatedWalletField,
          walletFieldBeingEdited: settingStores.walletFieldBeingEdited,
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
      },
      actions: {
        walletSettings: {
          startEditingWalletField: { trigger: settingActions.startEditingWalletField.trigger },
          stopEditingWalletField: { trigger: settingActions.stopEditingWalletField.trigger },
          cancelEditingWalletField: { trigger: settingActions.cancelEditingWalletField.trigger },
          renameConceptualWallet: { trigger: settingActions.renameConceptualWallet.trigger },
          resyncHistory: { trigger: settingActions.resyncHistory.trigger },
          removeWallet: { trigger: settingActions.removeWallet.trigger },
        },
        dialogs: {
          open: { trigger: actions.dialogs.open.trigger },
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
      },
      ChangeWalletPasswordDialogContainerProps: {
        actions,
        stores,
      },
    });
  }

  render() {
    const { uiDialogs, profile, walletSettings } = this.generated.stores;
    const { actions, } = this.generated;
    const {
      renameModelRequest,
      lastUpdatedWalletField,
      walletFieldBeingEdited,
    } = walletSettings;
    const {
      startEditingWalletField,
      stopEditingWalletField,
      cancelEditingWalletField,
      renameConceptualWallet,
    } = actions.walletSettings;

    const walletsStore = this.generated.stores.wallets;
    if (walletsStore.selected == null) {
      return this.getDialog(undefined);
    }
    const selectedWallet = walletsStore.selected;

    const walletType = selectedWallet.self.getParent().getWalletType();
    const isWebWallet = walletType === WalletTypeOption.WEB_WALLET;
    return (
      <>
        {this.getDialog(selectedWallet)}
        <WalletSettings
          error={renameModelRequest.error}
          openDialog={() => actions.dialogs.open.trigger({
            dialog: ChangeWalletPasswordDialogContainer,
          })}
          walletPasswordUpdateDate={selectedWallet.signingKeyUpdateDate}
          isDialogOpen={uiDialogs.isOpen}
          walletName={selectedWallet.conceptualWalletName}
          isSubmitting={renameModelRequest.isExecuting}
          isInvalid={
            renameModelRequest.wasExecuted
            &&
            renameModelRequest.result === false
          }
          lastUpdatedField={lastUpdatedWalletField}
          onFieldValueChange={async (field, value) => {
            if (field === 'name') {
              await renameConceptualWallet.trigger({
                publicDeriver: selectedWallet,
                newName: value,
              });
            }
          }}
          onStartEditing={field => startEditingWalletField.trigger({ field })}
          onStopEditing={() => stopEditingWalletField.trigger()}
          onCancelEditing={() => cancelEditingWalletField.trigger()}
          activeField={walletFieldBeingEdited}
          nameValidator={name => isValidWalletName(name)}
          showPasswordBlock={isWebWallet}
          classicTheme={profile.isClassicTheme}
        />
        <ResyncBlock
          isSubmitting={this.generated.stores.walletSettings.clearHistory.isExecuting}
          onResync={async () => {
            await this.generated.actions.walletSettings.resyncHistory.trigger({
              publicDeriver: selectedWallet
            });
          }}
        />
        <RemoveWallet
          walletName={selectedWallet.conceptualWalletName}
          openDialog={() => actions.dialogs.open.trigger({
            dialog: RemoveWalletDialog,
          })}
        />
      </>
    );
  }

  getDialog: (void | WalletWithCachedMeta) => Node = (
    publicDeriver
  ) => {
    const settingsStore = this.generated.stores.walletSettings;
    const settingsActions = this.generated.actions.walletSettings;

    if (this.generated.stores.uiDialogs.isOpen(ChangeWalletPasswordDialogContainer)) {
      return (
        <ChangeWalletPasswordDialogContainer
          {...this.generated.ChangeWalletPasswordDialogContainerProps}
        />
      );
    }
    if (this.generated.stores.uiDialogs.isOpen(RemoveWalletDialog)) {
      return (
        <RemoveWalletDialog
          onSubmit={() => publicDeriver && settingsActions.removeWallet.trigger({
            publicDeriver,
          })}
          isSubmitting={settingsStore.removeWalletRequest.isExecuting}
          onCancel={this.generated.actions.dialogs.closeActiveDialog.trigger}
          error={settingsStore.removeWalletRequest.error}
          classicTheme={this.generated.stores.profile.isClassicTheme}
        />
      );
    }
    return null;
  }
}
