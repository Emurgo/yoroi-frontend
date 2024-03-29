// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import WalletConnectHWOptionDialog from '../../../components/wallet/add/option-dialog/WalletConnectHWOptionDialog';

type Props = {|
  +onClose: void => void,
  +onTrezor: void => void,
  +onLedger: void => void,
|};

@observer
export default class WalletConnectHWOptionDialogContainer extends Component<Props> {

  render(): Node {
    return (
      <WalletConnectHWOptionDialog
        onCancel={this.props.onClose}
        onTrezor={this.props.onTrezor}
        onLedger={this.props.onLedger}
      />
    );
  }
}
