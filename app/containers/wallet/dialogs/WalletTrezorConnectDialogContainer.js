// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import environment from '../../../environment';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';

import AboutDialog from '../../../components/wallet/hwConnect/trezor/AboutDialog';
import ConnectDialog from '../../../components/wallet/hwConnect/trezor/ConnectDialog';
import SaveDialog from '../../../components/wallet/hwConnect/trezor/SaveDialog';

import { Logger } from '../../../utils/logging';

import TrezorConnectStore from '../../../stores/ada/TrezorConnectStore';
import { ProgressStep } from '../../../types/HWConnectStoreTypes';
import HWConnectActions from '../../../actions/ada/hw-connect-actions';

type Props = InjectedDialogContainerProps;
@observer
export default class WalletTrezorConnectDialogContainer extends Component<Props> {

  cancel = () => {
    this.props.onClose();
    this._getHWConnectActions().cancel.trigger();
  };

  render() {
    const trezorConnectStore = this._getTrezorConnectStore();
    const hwConnectActions = this._getHWConnectActions();

    let component = null;

    switch (trezorConnectStore.progressInfo.currentStep) {
      case ProgressStep.ABOUT:
        component = (
          <AboutDialog
            progressInfo={trezorConnectStore.progressInfo}
            isActionProcessing={trezorConnectStore.isActionProcessing}
            error={trezorConnectStore.error}
            submit={hwConnectActions.submitAbout.trigger}
            cancel={this.cancel}
          />);
        break;
      case ProgressStep.CONNECT:
        component = (
          <ConnectDialog
            progressInfo={trezorConnectStore.progressInfo}
            isActionProcessing={trezorConnectStore.isActionProcessing}
            error={trezorConnectStore.error}
            goBack={hwConnectActions.goBackToAbout.trigger}
            submit={hwConnectActions.submitConnect.trigger}
            cancel={this.cancel}
          />);
        break;
      case ProgressStep.SAVE:
        component = (
          <SaveDialog
            progressInfo={trezorConnectStore.progressInfo}
            isActionProcessing={trezorConnectStore.isActionProcessing}
            error={trezorConnectStore.error}
            defaultWalletName={trezorConnectStore.defaultWalletName}
            submit={hwConnectActions.submitSave.trigger}
            cancel={this.cancel}
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
  _getHWConnectActions(): HWConnectActions {
    return this.props.actions[environment.API].trezorConnect;
  }
}
