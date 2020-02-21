// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import WalletSettings from '../../../components/wallet/settings/WalletSettings';
import ResyncBlock from '../../../components/wallet/settings/ResyncBlock';
import RemoveWallet from '../../../components/wallet/settings/RemoveWallet';
import RemoveWalletDialog from '../../../components/wallet/settings/RemoveWalletDialog';
import type { InjectedProps } from '../../../types/injectedPropsType';
import { isValidWalletName } from '../../../utils/validations';
import type { WalletWithCachedMeta } from '../../../stores/toplevel/WalletStore';
import ChangeWalletPasswordDialogContainer from '../../wallet/dialogs/ChangeWalletPasswordDialogContainer';
import { WalletTypeOption } from '../../../api/ada/lib/storage/models/ConceptualWallet/interfaces';

type Props = InjectedProps

@observer
export default class WalletSettingsPage extends Component<Props> {

  componentWillUnmount() {
    this.props.stores.substores.ada.walletSettings.removeWalletRequest.reset();
    this.props.stores.substores.ada.walletSettings.clearHistory.reset();
  }

  render() {
    const { uiDialogs, profile } = this.props.stores;
    const { walletSettings } = this.props.stores.substores.ada;
    const { actions, } = this.props;
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
    } = actions.ada.walletSettings;

    const walletsStore = this.props.stores.wallets;
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
          isSubmitting={this.props.stores.substores.ada.walletSettings.clearHistory.isExecuting}
          onResync={async () => {
            await this.props.actions.ada.walletSettings.resyncHistory.trigger({
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
    const settingsStore = this.props.stores.substores.ada.walletSettings;
    const settingsActions = this.props.actions.ada.walletSettings;

    if (this.props.stores.uiDialogs.isOpen(ChangeWalletPasswordDialogContainer)) {
      return (
        <ChangeWalletPasswordDialogContainer
          actions={this.props.actions}
          stores={this.props.stores}
        />
      );
    }
    if (this.props.stores.uiDialogs.isOpen(RemoveWalletDialog)) {
      return (
        <RemoveWalletDialog
          onSubmit={() => publicDeriver && settingsActions.removeWallet.trigger({
            publicDeriver,
          })}
          isSubmitting={settingsStore.removeWalletRequest.isExecuting}
          onCancel={this.props.actions.dialogs.closeActiveDialog.trigger}
          error={settingsStore.removeWalletRequest.error}
          classicTheme={this.props.stores.profile.isClassicTheme}
        />
      );
    }
    return null;
  }
}
