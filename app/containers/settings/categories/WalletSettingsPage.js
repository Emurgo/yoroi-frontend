// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletSettings from '../../../components/wallet/settings/WalletSettings';
import ResyncBlock from '../../../components/wallet/settings/ResyncBlock';
import type { InjectedProps } from '../../../types/injectedPropsType';
import { isValidWalletName } from '../../../utils/validations';
import ChangeWalletPasswordDialogContainer from '../../wallet/dialogs/ChangeWalletPasswordDialogContainer';
import { WalletTypeOption } from '../../../api/ada/lib/storage/models/ConceptualWallet/interfaces';

type Props = InjectedProps

@observer
export default class WalletSettingsPage extends Component<Props> {

  render() {
    const { uiDialogs, profile } = this.props.stores;
    const { walletSettings } = this.props.stores.substores.ada;
    const { actions, stores } = this.props;
    const publicDeriver = this.props.stores.wallets.selected;
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

    const walletsStore = this.props.stores.wallets;
    if (walletsStore.selected == null) {
      throw new Error('Should never happen');
    }
    const selectedWallet = walletsStore.selected;
    return (
      <>
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
          onFieldValueChange={async (field, value) => {
            if (field === 'name') {
              await renameConceptualWallet.trigger({ publicDeriver, newName: value });
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
      </>
    );
  }

}
