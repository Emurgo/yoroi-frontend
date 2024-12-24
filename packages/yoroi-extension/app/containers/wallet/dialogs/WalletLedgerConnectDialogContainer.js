// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';

import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import { Logger } from '../../../utils/logging';
import { handleExternalLinkClick } from '../../../utils/routing';

import CheckDialog from '../../../components/wallet/hwConnect/ledger/CheckDialog';
import ConnectDialog from '../../../components/wallet/hwConnect/ledger/ConnectDialog';
import SaveDialog from '../../../components/wallet/hwConnect/ledger/SaveDialog';
import UpgradeTxDialogContainer from '../../transfer/UpgradeTxDialogContainer';

import { ProgressStep } from '../../../types/HWConnectStoreTypes';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';

type Props = {|
  ...StoresAndActionsProps,
  +onClose: void => void,
  +onBack: void => void,
|};

@observer
export default class WalletLedgerConnectDialogContainer extends Component<Props> {

  getSelectedNetwork: void => $ReadOnly<NetworkRow> = () => {
    const { selectedNetwork } = this.props.stores.profile;
    if (selectedNetwork === undefined) {
      throw new Error(`${nameof(WalletLedgerConnectDialogContainer)} no API selected`);
    }
    return selectedNetwork;
  }

  cancel: (() => void) = () => {
    this.props.onClose();
    this.props.actions.ada.ledgerConnect.cancel.trigger();
  };

  render(): null | Node {
    const { actions, stores } = this.props;
    const ledgerConnectStore = this.props.stores.substores.ada.ledgerConnect;
    const hwConnectActions = this.props.actions.ada.ledgerConnect;

    let component = null;

    switch (ledgerConnectStore.progressInfo.currentStep) {
      case ProgressStep.CHECK:
        component = (
          <CheckDialog
            progressInfo={ledgerConnectStore.progressInfo}
            isActionProcessing={ledgerConnectStore.isActionProcessing}
            error={ledgerConnectStore.error}
            onExternalLinkClick={handleExternalLinkClick}
            submit={hwConnectActions.submitCheck.trigger}
            cancel={this.cancel}
            onBack={this.props.onBack}
          />);
        break;
      case ProgressStep.CONNECT:
        component = (
          <ConnectDialog
            progressInfo={ledgerConnectStore.progressInfo}
            isActionProcessing={ledgerConnectStore.isActionProcessing}
            error={ledgerConnectStore.error}
            onExternalLinkClick={handleExternalLinkClick}
            goBack={hwConnectActions.goBackToCheck.trigger}
            submit={hwConnectActions.submitConnect.trigger}
            cancel={this.cancel}
          />);
        break;
      case ProgressStep.TRANSFER:
        component = (
          <UpgradeTxDialogContainer
            actions={actions}
            stores={stores}
            onClose={hwConnectActions.finishTransfer.trigger}
            onSubmit={hwConnectActions.finishTransfer.trigger}
          />);
        break;
      case ProgressStep.SAVE:
        component = (
          <SaveDialog
            progressInfo={ledgerConnectStore.progressInfo}
            isActionProcessing={ledgerConnectStore.isActionProcessing}
            error={ledgerConnectStore.error}
            defaultWalletName={ledgerConnectStore.defaultWalletName}
            onExternalLinkClick={handleExternalLinkClick}
            submit={hwConnectActions.submitSave.trigger}
            cancel={this.cancel}
          />);
        break;
      default:
        Logger.error(
          `${nameof(WalletLedgerConnectDialogContainer)}::${nameof(this.render)}: something unexpected happened`
        );
        break;
    }

    return component;
  }
}
