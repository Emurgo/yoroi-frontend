// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletSettings from '../../../components/wallet/WalletSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';
import { isValidWalletName } from '../../../utils/validations';
import ChangeWalletPasswordDialogContainer from '../../wallet/dialogs/ChangeWalletPasswordDialogContainer';

type Props = InjectedProps

@observer
export default class WalletSettingsPage extends Component<Props> {

  render() {
    const { uiDialogs, profile } = this.props.stores;
    const { wallets, walletSettings } = this.props.stores.substores.ada;
    const { actions, stores } = this.props;
    const activeWallet = wallets.active;
    const {
      renameModelRequest,
      lastUpdatedWalletField,
      walletFieldBeingEdited,
    } = walletSettings;
    const {
      startEditingWalletField,
      stopEditingWalletField,
      cancelEditingWalletField,
      updateWalletField,
    } = actions.ada.walletSettings;

    // Guard against potential null values
    if (!activeWallet) throw new Error('Active wallet required for WalletSettingsPage.');

    const changeDialog = (
      <ChangeWalletPasswordDialogContainer
        actions={actions}
        stores={stores}
      />
    );
    return (
      <WalletSettings
        error={renameModelRequest.error}
        openDialogAction={actions.dialogs.open.trigger}
        walletPasswordUpdateDate={activeWallet.passwordUpdateDate}
        isDialogOpen={uiDialogs.isOpen}
        dialog={changeDialog}
        walletName={activeWallet.name}
        isSubmitting={renameModelRequest.isExecuting}
        isInvalid={
          renameModelRequest.wasExecuted
          &&
          renameModelRequest.result === false
        }
        lastUpdatedField={lastUpdatedWalletField}
        onFieldValueChange={(field, value) => updateWalletField.trigger({ field, value })}
        onStartEditing={field => startEditingWalletField.trigger({ field })}
        onStopEditing={() => stopEditingWalletField.trigger()}
        onCancelEditing={() => cancelEditingWalletField.trigger()}
        activeField={walletFieldBeingEdited}
        nameValidator={name => isValidWalletName(name)}
        showPasswordBlock={activeWallet.isWebWallet}
        classicTheme={profile.isClassicTheme}
      />
    );
  }

}
