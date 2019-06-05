// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletConnectOptionsDialog from '../../../components/wallet/add/WalletConnectHwOptionsDialog';

type Props = {
  onClose: Function,
  classicTheme: boolean,
  onTrezor: Function,
  onLedger: Function,
};

@observer
export default class WalletConnectHwDialogContainer extends Component<Props> {

  render() {
    return (
      <WalletConnectOptionsDialog
        classicTheme={this.props.classicTheme}
        onCancel={this.props.onClose}
        onTrezor={this.props.onTrezor}
        onLedger={this.props.onLedger}
      />
    );
  }
}
