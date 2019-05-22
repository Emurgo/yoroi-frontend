// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletConnectHardwareDialog from '../../../components/wallet/WalletConnectHardwareDialog';

type Props = {
  onClose: Function,
  classicTheme: boolean,
  onTrezor: Function,
  onLedger: Function,
};

@observer
export default class WalletCreateListDialogContainer extends Component<Props> {

  render() {
    return (
      <WalletConnectHardwareDialog
        classicTheme={this.props.classicTheme}
        onCancel={this.props.onClose}
        onTrezor={this.props.onTrezor}
        onLedger={this.props.onLedger}
      />
    );
  }
}
