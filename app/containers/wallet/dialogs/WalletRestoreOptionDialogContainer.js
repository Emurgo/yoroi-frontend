// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletRestoreOptionDialog from '../../../components/wallet/add/option-dialog/WalletRestoreOptionDialog';

type Props = {|
  +onClose: void => void,
  +classicTheme: boolean,
  +onRestore: void => void,
  +onPaperRestore: void => void,
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
