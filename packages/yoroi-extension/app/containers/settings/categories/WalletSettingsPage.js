// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import WalletNameSetting from '../../../components/wallet/settings/WalletNameSetting';
import NoWalletMessage from '../../wallet/NoWalletMessage';
import SpendingPasswordSetting from '../../../components/wallet/settings/SpendingPasswordSetting';
import ResyncBlock from '../../../components/wallet/settings/ResyncBlock';
import RemoveWallet from '../../../components/wallet/settings/RemoveWallet';
import ExportWallet from '../../../components/wallet/settings/ExportWallet';
import RemoveWalletDialogContainer from './RemoveWalletDialogContainer';
import ExportWalletDialogContainer from './ExportWalletDialogContainer';
import ResyncWalletDialogContainer from './ResyncWalletDialogContainer';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import { isValidWalletName } from '../../../utils/validations';
import ChangeWalletPasswordDialogContainer from '../../wallet/dialogs/ChangeWalletPasswordDialogContainer';
import { asGetSigningKey } from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import { Typography } from '@mui/material';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';

@observer
export default class WalletSettingsPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { profile, walletSettings } = this.props.stores;
    const { intl } = this.context;
    const { actions } = this.props;
    const { renameModelRequest, lastUpdatedWalletField, walletFieldBeingEdited } = walletSettings;
    const {
      startEditingWalletField,
      stopEditingWalletField,
      cancelEditingWalletField,
      renameConceptualWallet,
    } = actions.walletSettings;

    const walletsStore = this.props.stores.wallets;
    if (walletsStore.selected == null) {
      return (
        <>
          {this.getDialog(undefined)}
          <NoWalletMessage />
        </>
      );
    }
    const selectedWallet = walletsStore.selected;
    const withSigning = asGetSigningKey(selectedWallet);
    const parent = selectedWallet.getParent();
    const settingsCache = this.props.stores.walletSettings.getConceptualWalletSettingsCache(
      parent
    );

    return (
      <div id="walletSettingsPage">
        {this.getDialog(selectedWallet)}
        {profile.isRevampTheme && (
          <Typography component="div" variant="h5" fontWeight={500} mb="24px">
            {intl.formatMessage(globalMessages.walletLabel)}
          </Typography>
        )}
        <WalletNameSetting
          error={renameModelRequest.error}
          walletName={settingsCache.conceptualWalletName}
          isSubmitting={renameModelRequest.isExecuting}
          isInvalid={renameModelRequest.wasExecuted && renameModelRequest.result === false}
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
            openDialog={() =>
              actions.dialogs.open.trigger({
                dialog: ChangeWalletPasswordDialogContainer,
              })
            }
            walletPasswordUpdateDate={
              this.props.stores.wallets.getSigningKeyCache(withSigning).signingKeyUpdateDate
            }
            classicTheme={profile.isClassicTheme}
          />
        )}
        <ResyncBlock
          openDialog={() =>
            actions.dialogs.open.trigger({
              dialog: ResyncWalletDialogContainer,
            })
          }
        />
        <ExportWallet
          openDialog={() => actions.dialogs.open.trigger({
            dialog: ExportWalletDialogContainer,
          })}
        />
        <RemoveWallet
          walletName={settingsCache.conceptualWalletName}
          openDialog={() =>
            actions.dialogs.open.trigger({
              dialog: RemoveWalletDialogContainer,
            })
          }
        />
      </div>
    );
  }

  getDialog: (void | PublicDeriver<>) => Node = publicDeriver => {
    const { actions, stores } = this.props;
    const { isOpen } = this.props.stores.uiDialogs;
    if (publicDeriver != null && isOpen(ChangeWalletPasswordDialogContainer)) {
      return (
        <ChangeWalletPasswordDialogContainer
          actions={actions}
          stores={stores}
          publicDeriver={publicDeriver}
        />
      );
    }
    if (publicDeriver != null && isOpen(ExportWalletDialogContainer)) {
      return (
        <ExportWalletDialogContainer
          actions={actions}
          stores={stores}
          publicDeriver={publicDeriver}
        />
      );
    }
    // selected wallet becomes null as we delete it
    if (isOpen(RemoveWalletDialogContainer)) {
      return (
        <RemoveWalletDialogContainer
          actions={actions}
          stores={stores}
          publicDeriver={publicDeriver}
        />
      );
    }
    if (publicDeriver != null && isOpen(ResyncWalletDialogContainer)) {
      return (
        <ResyncWalletDialogContainer
          actions={actions}
          stores={stores}
          publicDeriver={publicDeriver}
        />
      );
    }
    return null;
  };
}
