// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletRestoreOptionsDialog from '../../../components/wallet/WalletRestoreOptionsDialog';

type Props = {
  onClose: Function,
  classicTheme: boolean,
  onCreate: Function,
};
@observer
export default class WalletRestoreOptionsDialogContainer extends Component<Props> {

  render() {
    return (
      <WalletRestoreOptionsDialog
        classicTheme={this.props.classicTheme}
        onCancel={this.props.onClose}
        onCreate={this.props.onCreate}
      />
    );
  }
}
