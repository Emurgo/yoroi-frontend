// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import environment from '../../../environment';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';
import { Logger } from '../../../utils/logging';
import { handleExternalLinkClick } from '../../../utils/routing';

import CheckDialog from '../../../components/wallet/hwConnect/ledger/CheckDialog';
import ConnectDialog from '../../../components/wallet/hwConnect/ledger/ConnectDialog';
import SaveDialog from '../../../components/wallet/hwConnect/ledger/SaveDialog';

import LedgerConnectStore from '../../../stores/ada/LedgerConnectStore';
import HWConnectActions from '../../../actions/ada/hw-connect-actions';

import { ProgressStep } from '../../../types/HWConnectStoreTypes';

type Props = InjectedDialogContainerProps & {
  onBack: void => void,
};

@observer
export default class WalletLedgerConnectDialogContainer extends Component<Props> {

  cancel = () => {
    this.props.onClose();
    this._getHWConnectActions().cancel.trigger();
  };

  render() {
    const { profile } = this.props.stores;
    const ledgerConnectStore = this._getLedgerConnectStore();
    const hwConnectActions = this._getHWConnectActions();

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
            classicTheme={profile.isClassicTheme}
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
            classicTheme={profile.isClassicTheme}
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
            classicTheme={profile.isClassicTheme}
          />);
        break;
      default:
        Logger.error('WalletLedgerConnectDialogContainer::render: something unexpected happened');
        break;
    }

    return component;
  }

  /** Returns the store which is responsible for this Container */
  _getLedgerConnectStore(): LedgerConnectStore {
    return this.props.stores.substores[environment.API].ledgerConnect;
  }

  /** Returns the action which is responsible for this Container */
  _getHWConnectActions(): HWConnectActions {
    return this.props.actions[environment.API].ledgerConnect;
  }
}
