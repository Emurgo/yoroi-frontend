// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletRestoreOptionDialog from '../../../components/wallet/add/option-dialog/WalletRestoreOptionDialog';

type Props = {|
  +onClose: Function,
  +classicTheme: boolean,
  +onRestore: Function,
  +onPaperRestore: Function,
|};
@observer
export default class WalletRestoreOptionDialogContainer extends Component<Props> {

  render() {
    return (
      <WalletRestoreOptionDialog
        classicTheme={this.props.classicTheme}
        onCancel={this.props.onClose}
        onRestore={this.props.onRestore}
        onPaperRestore={this.props.onPaperRestore}
      />
    );
  }
}
