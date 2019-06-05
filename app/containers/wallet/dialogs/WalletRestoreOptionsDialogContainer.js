// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletRestoreOptionsDialog from '../../../components/wallet/WalletRestoreOptionsDialog';

type Props = {
  onClose: Function,
  classicTheme: boolean,
  onRestore: Function,
  onPaperRestore: Function,
};
@observer
export default class WalletRestoreOptionsDialogContainer extends Component<Props> {

  render() {
    return (
      <WalletRestoreOptionsDialog
        classicTheme={this.props.classicTheme}
        onCancel={this.props.onClose}
        onRestore={this.props.onRestore}
        onPaperRestore={this.props.onPaperRestore}
      />
    );
  }
}
