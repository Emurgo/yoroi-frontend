// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import WalletNameSetting from '../../../components/wallet/settings/WalletNameSetting';
import SpendingPasswordSetting from '../../../components/wallet/settings/SpendingPasswordSetting';
import ResyncBlock from '../../../components/wallet/settings/ResyncBlock';
import RemoveWallet from '../../../components/wallet/settings/RemoveWallet';
import RemoveWalletDialog from '../../../components/wallet/settings/RemoveWalletDialog';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import { isValidWalletName } from '../../../utils/validations';
import ChangeWalletPasswordDialogContainer from '../../wallet/dialogs/ChangeWalletPasswordDialogContainer';
import { asGetSigningKey } from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import type { GeneratedData as ChangeWalletPasswordDialogContainerData } from '../../wallet/dialogs/ChangeWalletPasswordDialogContainer';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';

type GeneratedData = typeof WalletSettingsPage.prototype.generated;

@observer
export default class WalletSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  componentWillUnmount() {
    this.generated.stores.walletSettings.removeWalletRequest.reset();
    this.generated.stores.walletSettings.clearHistory.reset();
  }

  render() {
    const { profile, walletSettings } = this.generated.stores;
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
    const withSigning = asGetSigningKey(selectedWallet);
    const parent = selectedWallet.getParent();
    const settingsCache = this.generated.stores.walletSettings
      .getConceptualWalletSettingsCache(parent);

    return (
      <>
        {this.getDialog(selectedWallet)}
        <WalletNameSetting
          error={renameModelRequest.error}
          walletName={settingsCache.conceptualWalletName}
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
          classicTheme={profile.isClassicTheme}
        />
        {withSigning != null && (
          <SpendingPasswordSetting
            openDialog={() => actions.dialogs.open.trigger({
              dialog: ChangeWalletPasswordDialogContainer,
            })}
            walletPasswordUpdateDate={
              this.generated.stores.wallets.getSigningKeyCache(withSigning).signingKeyUpdateDate
            }
            classicTheme={profile.isClassicTheme}
          />
        )}
        <ResyncBlock
          isSubmitting={this.generated.stores.walletSettings.clearHistory.isExecuting}
          onResync={async () => {
            await this.generated.actions.walletSettings.resyncHistory.trigger({
              publicDeriver: selectedWallet
            });
          }}
        />
        <RemoveWallet
          walletName={settingsCache.conceptualWalletName}
          openDialog={() => actions.dialogs.open.trigger({
            dialog: RemoveWalletDialog,
          })}
        />
      </>
    );
  }

  getDialog: (void | PublicDeriver<>) => Node = (
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
        />
      );
    }
    return null;
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletSettingsPage)} no way to generated props`);
    }
    const { actions, stores, } = this.props;
    const settingActions = actions.ada.walletSettings;
    const settingStore = this.props.stores.substores.ada.walletSettings;
    return Object.freeze({
      stores: {
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
        },
        walletSettings: {
          getConceptualWalletSettingsCache: settingStore.getConceptualWalletSettingsCache,
          removeWalletRequest: {
            reset: settingStore.removeWalletRequest.reset,
            isExecuting: settingStore.removeWalletRequest.isExecuting,
            error: settingStore.removeWalletRequest.error,
          },
          clearHistory: {
            reset: settingStore.clearHistory.reset,
            isExecuting: settingStore.clearHistory.isExecuting,
          },
          renameModelRequest: {
            error: settingStore.renameModelRequest.error,
            isExecuting: settingStore.renameModelRequest.isExecuting,
            wasExecuted: settingStore.renameModelRequest.wasExecuted,
            result: settingStore.renameModelRequest.result,
          },
          lastUpdatedWalletField: settingStore.lastUpdatedWalletField,
          walletFieldBeingEdited: settingStore.walletFieldBeingEdited,
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
        },
        wallets: {
          selected: stores.wallets.selected,
          getSigningKeyCache: stores.wallets.getSigningKeyCache,
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
      ChangeWalletPasswordDialogContainerProps: (
        { actions, stores, }: InjectedOrGenerated<ChangeWalletPasswordDialogContainerData>
      )
    });
  }
}
