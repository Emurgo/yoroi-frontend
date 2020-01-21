// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletConnectHWOptionDialog from '../../../components/wallet/add/option-dialog/WalletConnectHWOptionDialog';

type Props = {|
  +onClose: void => void,
  +classicTheme: boolean,
  +onTrezor: void => void,
  +onLedger: void => void,
|};

@observer
export default class WalletConnectHWOptionDialogContainer extends Component<Props> {

  render() {
    return (
      <WalletConnectHWOptionDialog
        classicTheme={this.props.classicTheme}
        onCancel={this.props.onClose}
        onTrezor={this.props.onTrezor}
        onLedger={this.props.onLedger}
      />
    );
  }
}
