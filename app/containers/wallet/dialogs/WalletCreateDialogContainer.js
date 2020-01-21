// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletCreateDialog from '../../../components/wallet/WalletCreateDialog';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';

type Props = InjectedDialogContainerProps;

@observer
export default class WalletCreateDialogContainer extends Component<Props> {

  render() {
    return (
      <WalletCreateDialog
        classicTheme={this.props.classicTheme}
        onSubmit={this.props.actions[environment.API].wallets.createWallet.trigger}
        onCancel={this.props.onClose}
      />
    );
  }
}
