// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import environment from '../../../environment';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';

import AboutDialog from '../../../components/wallet/trezorConnect/AboutDialog';
import ConnectDialog from '../../../components/wallet/trezorConnect/ConnectDialog';
import SaveDialog from '../../../components/wallet/trezorConnect/SaveDialog';

import { Logger } from '../../../utils/logging';

import TrezorConnectStore, { ProgressStep } from '../../../stores/ada/TrezorConnectStore';
import TrezorConnectActions from '../../../actions/ada/trezor-connect-actions';

type Props = InjectedDialogContainerProps;
@observer
export default class WalletTrezorConnectDialogContainer extends Component<Props> {

  cancel = () => {
    this.props.onClose();
    this._getTrezorConnectActions().cancel.trigger();
  };

  render() {
    const { stores } = this.props;
    const trezorConnectStore = this._getTrezorConnectStore();
    const trezorConnectActions = this._getTrezorConnectActions();

    let component = null;

    switch (trezorConnectStore.progressInfo.currentStep) {
      case ProgressStep.ABOUT:
        component = (
          <AboutDialog
            progressInfo={trezorConnectStore.progressInfo}
            isActionProcessing={trezorConnectStore.isActionProcessing}
            error={trezorConnectStore.error}
            submit={trezorConnectActions.submitAbout.trigger}
            cancel={this.cancel}
            classicTheme={stores.theme.classic}
          />);
        break;
      case ProgressStep.CONNECT:
        component = (
          <ConnectDialog
            progressInfo={trezorConnectStore.progressInfo}
            isActionProcessing={trezorConnectStore.isActionProcessing}
            error={trezorConnectStore.error}
            goBack={trezorConnectActions.goBacktToAbout.trigger}
            submit={trezorConnectActions.submitConnect.trigger}
            cancel={this.cancel}
            classicTheme={stores.theme.classic}
          />);
        break;
      case ProgressStep.SAVE:
        component = (
          <SaveDialog
            progressInfo={trezorConnectStore.progressInfo}
            isActionProcessing={trezorConnectStore.isActionProcessing}
            error={trezorConnectStore.error}
            defaultWalletName={trezorConnectStore.defaultWalletName}
            submit={trezorConnectActions.submitSave.trigger}
            cancel={this.cancel}
            classicTheme={stores.theme.classic}
          />);
        break;
      default:
        Logger.error('WalletTrezorConnectDialogContainer::render: something unexpected happened');
        break;
    }

    return component;
  }

  /** Returns the store which is responsible for this Container */
  _getTrezorConnectStore(): TrezorConnectStore {
    return this.props.stores.substores[environment.API].trezorConnect;
  }

  /** Returns the action which is responsible for this Container */
  _getTrezorConnectActions(): TrezorConnectActions {
    return this.props.actions[environment.API].trezorConnect;
  }
}
