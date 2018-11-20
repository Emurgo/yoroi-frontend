// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import type { Features } from 'trezor-connect';

import environment from '../../../environment';
import WalletTrezorDialog from '../../../components/wallet/WalletTrezorDialog';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';

type Props = InjectedDialogContainerProps;

@inject('stores', 'actions') @observer
export default class WalletTrezorDialogContainer extends Component<Props> {

  static defaultProps = { actions: null, stores: null, children: null, onClose: () => {} };

  onSubmit = (values: {
    publicMasterKey : string,
    walletName: string,
    deviceFeatures: Features,
  }) => {
    this.props.actions[environment.API].wallets.connectTrezor.trigger(values);
  };

  onCancel = () => {
    this.props.onClose();
    const { connectTrezorRequest } = this.props.stores[environment.API].wallets;
    // Connect Trezor request should be reset only in case connect is finished/errored
    if (!connectTrezorRequest.isExecuting) {
      connectTrezorRequest.reset();
    }
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
