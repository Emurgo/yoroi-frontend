// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletConnectHwDialog from '../../../components/wallet/add/WalletConnectHwDialog';

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
      <WalletConnectHwDialog
        classicTheme={this.props.classicTheme}
        onCancel={this.props.onClose}
        onTrezor={this.props.onTrezor}
        onLedger={this.props.onLedger}
      />
    );
  }
}
