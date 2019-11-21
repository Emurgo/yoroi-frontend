// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletSettings from '../../../components/wallet/WalletSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';
import { isValidWalletName } from '../../../utils/validations';
import ChangeWalletPasswordDialogContainer from '../../wallet/dialogs/ChangeWalletPasswordDialogContainer';
import { WalletTypeOption } from '../../../api/ada/lib/storage/models/ConceptualWallet/interfaces';

type Props = InjectedProps

@observer
export default class WalletSettingsPage extends Component<Props> {

  render() {
    const { uiDialogs, profile } = this.props.stores;
    const { wallets, walletSettings } = this.props.stores.substores.ada;
    const { actions, stores } = this.props;
    const publicDeriver = wallets.selected;
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

    // Guard against potential null values
    if (!publicDeriver) throw new Error('Active wallet required for WalletSettingsPage.');

    const walletType = publicDeriver.self.getParent().getWalletType();
    const isWebWallet = walletType === WalletTypeOption.WEB_WALLET;

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
        walletPasswordUpdateDate={publicDeriver.signingKeyUpdateDate}
        isDialogOpen={uiDialogs.isOpen}
        dialog={changeDialog}
        walletName={publicDeriver.conceptualWalletName}
        isSubmitting={renameModelRequest.isExecuting}
        isInvalid={
          renameModelRequest.wasExecuted
          &&
          renameModelRequest.result === false
        }
        lastUpdatedField={lastUpdatedWalletField}
        onFieldValueChange={(field, value) => {
          if (field === 'name') {
            renameConceptualWallet.trigger({ newName: value });
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
    );
  }

}
