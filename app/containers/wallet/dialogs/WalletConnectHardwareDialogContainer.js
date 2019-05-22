// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletConnectHardwareDialog from '../../../components/wallet/WalletConnectHardwareDialog';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';

type Props = InjectedDialogContainerProps;

@observer
export default class WalletCreateListDialogContainer extends Component<Props> {

  onSubmit = (values: { name: string, password: string }) => {
    this.props.actions[environment.API].wallets.createWallet.trigger(values);
  };

  render() {
    return (
      <WalletConnectHardwareDialog
        classicTheme={this.props.classicTheme}
        onSubmit={this.onSubmit}
        onCancel={this.props.onClose}
        onTrezor={this.props.onTrezor}
        onLedger={this.props.onLedger}
      />
    );
  }
}
