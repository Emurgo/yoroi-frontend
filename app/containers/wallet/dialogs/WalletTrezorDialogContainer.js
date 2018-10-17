// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import WalletTrezorDialog from '../../../components/wallet/WalletTrezorDialog';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';

type Props = InjectedDialogContainerProps;

@inject('stores', 'actions') @observer
export default class WalletTrezorDialogContainer extends Component<Props> {

  static defaultProps = { actions: null, stores: null, children: null, onClose: () => {} };

  onSubmit = (values: { name: string, password: string }) => {
    this.props.actions[environment.API].wallets.createWallet.trigger(values);
  };

  render() {
    return (
      <WalletTrezorDialog
        isConnecting={false} // FIX: This
        onSubmit={this.onSubmit}
        onCancel={this.props.onClose}
      />
    );
  }
}

