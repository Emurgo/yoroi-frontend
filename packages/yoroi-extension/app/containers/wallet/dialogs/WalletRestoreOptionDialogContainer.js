// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import WalletRestoreOptionDialog from '../../../components/wallet/add/option-dialog/WalletRestoreOptionDialog';

type Props = {|
  +onClose: void => void,
  +onRestore15: void => void,
  +onRestore24: void | (void => void),
|};

@observer
export default class WalletRestoreOptionDialogContainer extends Component<Props> {

  render(): Node {
    return (
      <WalletRestoreOptionDialog
        onCancel={this.props.onClose}
        onRestore15={this.props.onRestore15}
        onRestore24={this.props.onRestore24}
      />
    );
  }
}
