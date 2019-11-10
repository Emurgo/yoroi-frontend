// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletCreateDialog from '../../../components/wallet/WalletCreateDialog';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';

type Props = InjectedDialogContainerProps;

@observer
export default class WalletCreateDialogContainer extends Component<Props> {

  onSubmit = (values: { name: string, password: string }) => {
    this.props.actions[environment.API].wallets.createWallet.trigger(values);
  };

  render() {
    return (
      <WalletCreateDialog
        classicTheme={this.props.classicTheme}
        onSubmit={this.onSubmit}
        onCancel={this.props.onClose}
      />
    );
  }
}
