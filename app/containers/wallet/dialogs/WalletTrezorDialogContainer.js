// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import environment from '../../../environment';
import WalletTrezorDialog from '../../../components/wallet/WalletTrezorDialog';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';

type Props = InjectedDialogContainerProps;

@inject('stores', 'actions') @observer
export default class WalletTrezorDialogContainer extends Component<Props> {

  static defaultProps = { actions: null, stores: null, children: null, onClose: () => {} };

  onSubmit = (values: { publicMasterKey : string, walletName: string, deviceFeatures: any, }) => {
    this.props.actions[environment.API].wallets.connectTrezor.trigger(values);
  };

  onCancel = () => {
    this.props.onClose();
    // Restore request should be reset only in case restore is finished/errored
    const { connectTrezorRequest } = this.props.stores[environment.API].wallets;
    if (!connectTrezorRequest.isExecuting) connectTrezorRequest.reset();
  };

  render() {
    const { connectTrezorRequest } = this.props.stores[environment.API].wallets;

    return (
      <WalletTrezorDialog
        isSubmitting={connectTrezorRequest.isExecuting}
        onSubmit={this.onSubmit}
        onCancel={this.onCancel}
        error={connectTrezorRequest.error}
      />
    );
  }
}
