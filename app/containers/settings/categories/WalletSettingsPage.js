// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import WalletSettings from '../../../components/wallet/WalletSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';
import { isValidWalletName } from '../../../utils/validations';

type Props = InjectedProps

@inject('stores', 'actions') @observer
export default class WalletSettingsPage extends Component<Props> {

  static defaultProps = { actions: null, stores: null };

  render() {
    const { uiDialogs } = this.props.stores;
    const { wallets, walletSettings } = this.props.stores.substores.ada;
    const { actions } = this.props;
    const activeWallet = wallets.active;
    const {
      updateWalletMetaRequest,
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

    return (
      <WalletSettings
        error={updateWalletMetaRequest.error}
        openDialogAction={actions.dialogs.open.trigger}
        walletPasswordUpdateDate={activeWallet.passwordUpdateDate}
        isDialogOpen={uiDialogs.isOpen}
        walletName={activeWallet.name}
        isSubmitting={updateWalletMetaRequest.isExecuting}
        isInvalid={updateWalletMetaRequest.wasExecuted && updateWalletMetaRequest.result === false}
        lastUpdatedField={lastUpdatedWalletField}
        onFieldValueChange={(field, value) => updateWalletField.trigger({ field, value })}
        onStartEditing={field => startEditingWalletField.trigger({ field })}
        onStopEditing={stopEditingWalletField.trigger}
        onCancelEditing={cancelEditingWalletField.trigger}
        activeField={walletFieldBeingEdited}
        nameValidator={name => isValidWalletName(name)}
      />
    );
  }

}
