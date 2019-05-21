// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletCreateDialog from '../../../components/wallet/WalletCreateDialog';
import WalletCreateDialogModern from '../../../components/wallet/WalletCreateDialogModern';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';

type Props = InjectedDialogContainerProps;

@observer
export default class WalletCreateDialogContainer extends Component<Props> {

  onSubmit = (values: { name: string, password: string }) => {
    this.props.actions[environment.API].wallets.createWallet.trigger(values);
  };

  render() {
    if (this.props.classicTheme) {
      return (
        <WalletCreateDialog
          classicTheme={this.props.classicTheme}
          onSubmit={this.onSubmit}
          onCancel={this.props.onClose}
        />
      );
    }
    return (
      <WalletCreateDialogModern
        classicTheme={this.props.classicTheme}
        onSubmit={this.onSubmit}
        onCancel={this.props.onClose}
      />
    );
  }
}
