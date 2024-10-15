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
import { isValidWalletName } from '../../../utils/validations';
import ChangeWalletPasswordDialogContainer from '../../wallet/dialogs/ChangeWalletPasswordDialogContainer';
import { Typography } from '@mui/material';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import type { StoresProps } from '../../../stores';

@observer
export default class WalletSettingsPage extends Component <StoresProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { stores } = this.props;
    const { walletSettings } = stores;
    const { renameModelRequest, lastUpdatedWalletField, walletFieldBeingEdited } = walletSettings;

    const { selected: selectedWallet, selectedWalletName } = this.props.stores.wallets;
    if (selectedWallet == null) {
      return (
        <>
          {this.getDialog(undefined)}
          <NoWalletMessage />
        </>
      );
    }
    if (selectedWalletName == null) {
      throw new Error('unexpected nullish wallet name');
    }

    return (
      <div id="walletSettingsPage">
        {this.getDialog(selectedWallet.publicDeriverId)}
        <Typography component="div" variant="h5" fontWeight={500} mb="24px">
          {intl.formatMessage(globalMessages.walletLabel)}
        </Typography>
        <WalletNameSetting
          error={renameModelRequest.error}
          walletName={selectedWallet.name}
          isSubmitting={renameModelRequest.isExecuting}
          isInvalid={renameModelRequest.wasExecuted && renameModelRequest.result === false}
          lastUpdatedField={lastUpdatedWalletField}
          onFieldValueChange={async (field, value) => {
            if (field === 'name') {
              await stores.walletSettings.renameConceptualWallet({
                conceptualWalletId: selectedWallet.conceptualWalletId,
                newName: value,
              });
            }
          }}
          onStartEditing={field => stores.walletSettings.startEditingWalletField({ field })}
          onStopEditing={() => stores.walletSettings.stopEditingWalletField()}
          onCancelEditing={() => stores.walletSettings.cancelEditingWalletField()}
          activeField={walletFieldBeingEdited}
          nameValidator={name => isValidWalletName(name)}
        />
        {selectedWallet.type === 'mnemonic' && (
          <SpendingPasswordSetting
            openDialog={() =>
              stores.uiDialogs.open({
                dialog: ChangeWalletPasswordDialogContainer,
              })
            }
          />
        )}
        <ResyncBlock
          openDialog={() =>
            stores.uiDialogs.open({
              dialog: ResyncWalletDialogContainer,
            })
          }
        />
        <ExportWallet
          openDialog={() => stores.uiDialogs.open({
            dialog: ExportWalletDialogContainer,
          })}
        />
        <RemoveWallet
          walletName={selectedWalletName}
          openDialog={() =>
            stores.uiDialogs.open({
              dialog: RemoveWalletDialogContainer,
            })
          }
        />
      </div>
    );
  }

  getDialog: (void | number) => Node = publicDeriverId => {
    const { stores } = this.props;
    const { isOpen } = this.props.stores.uiDialogs;
    if (publicDeriverId != null && isOpen(ChangeWalletPasswordDialogContainer)) {
      return (
        <ChangeWalletPasswordDialogContainer
          stores={stores}
          publicDeriverId={publicDeriverId}
        />
      );
    }
    if (publicDeriverId != null && isOpen(ExportWalletDialogContainer)) {
      return (
        <ExportWalletDialogContainer
          stores={stores}
        />
      );
    }
    // selected wallet becomes null as we delete it
    if (isOpen(RemoveWalletDialogContainer)) {
      if (publicDeriverId == null) {
        return null;
      }
      return (
        <RemoveWalletDialogContainer
          stores={stores}
          publicDeriverId={publicDeriverId}
        />
      );
    }
    if (publicDeriverId != null && isOpen(ResyncWalletDialogContainer)) {
      return (
        <ResyncWalletDialogContainer
          stores={stores}
          publicDeriverId={publicDeriverId}
        />
      );
    }
    return null;
  };
}
