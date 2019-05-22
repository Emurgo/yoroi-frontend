// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletCreateListDialog from '../../../components/wallet/WalletCreateListDialog';
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
      <WalletCreateListDialog
        classicTheme={this.props.classicTheme}
        onSubmit={this.onSubmit}
        onCancel={this.props.onClose}
        onCreate={this.props.onCreate}
      />
    );
  }
}
