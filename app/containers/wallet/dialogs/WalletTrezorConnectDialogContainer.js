// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import environment from '../../../environment';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';

import AboutDialog from '../../../components/wallet/trezorConnect/AboutDialog';
import ConnectDialog from '../../../components/wallet/trezorConnect/ConnectDialog';
import SaveDialog from '../../../components/wallet/trezorConnect/SaveDialog';

import { ProgressStepOption } from '../../../stores/ada/TrezorConnectStore';

type Props = InjectedDialogContainerProps;
@inject('stores', 'actions') @observer
export default class WalletTrezorConnectDialogContainer extends Component<Props> {

  static defaultProps = { actions: null, stores: null, children: null, onClose: () => {} };

  cancel = () => {
    this.props.onClose();

    const action = this._getAction();
    action.cancel.trigger();

    const { connectTrezorRequest } = this.props.stores.substores[environment.API].wallets;
    // Connect Trezor request should be reset only in case connect is finished/errored
    if (!connectTrezorRequest.isExecuting) {
      connectTrezorRequest.reset();
    }
  };  

  render() {
    const store = this._getStore();
    const action = this._getAction();

    let component = null;

    switch(store.progressInfo.currentStep) {
      case ProgressStepOption.ABOUT:
        component = (
          <AboutDialog
            progressInfo={store.progressInfo}
            isActionProcessing={store.isActionProcessing}
            error={store.error}
            submit={action.submitAbout.trigger}
            cancel={this.cancel}
          />);
        break;
      case ProgressStepOption.CONNECT:
        component = (
          <ConnectDialog
              progressInfo={store.progressInfo}
              isActionProcessing={store.isActionProcessing}
              error={store.error}
              goBack={action.goBacktToAbout.trigger}
              submit={action.submitConnect.trigger}
              cancel={this.cancel}
          />);
        break;
      case ProgressStepOption.SAVE:
        component = (
          <SaveDialog
              progressInfo={store.progressInfo}
              isActionProcessing={store.isActionProcessing}
              error={store.error}
              defaultWalletName={store.defaultWalletName}
              submit={action.submitSave.trigger}
              cancel={this.cancel}
          />);
        break;
      default:
        console.error('Error : something unexpected happened');
        break;
    }

    return component;
  }

  /** Returns the store which is responsible for this Container */
  _getStore() {
    return this.props.stores.substores[environment.API].trezorConnect;
  }

  /** Returns the action which is responsible for this Container */
  _getAction() {
    return this.props.actions[environment.API].trezorConnect;
  }
}
