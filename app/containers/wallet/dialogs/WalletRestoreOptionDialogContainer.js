// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletRestoreOptionDialog from '../../../components/wallet/add/option-dialog/WalletRestoreOptionDialog';

type Props = {|
  +onClose: void => void,
  +onRestore: void => void,
  +onPaperRestore: void => void,
|};

@observer
export default class WalletRestoreOptionDialogContainer extends Component<Props> {

  render(): Node {
    return (
      <WalletRestoreOptionDialog
        onCancel={this.props.onClose}
        onRestore={this.props.onRestore}
        onPaperRestore={this.props.onPaperRestore}
      />
    );
  }
}
