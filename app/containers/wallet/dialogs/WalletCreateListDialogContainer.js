// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletCreateListDialog from '../../../components/wallet/WalletCreateListDialog';

type Props = {
  onClose: Function,
  classicTheme: boolean,
  onCreate: Function,
};
@observer
export default class WalletCreateListDialogContainer extends Component<Props> {

  render() {
    return (
      <WalletCreateListDialog
        classicTheme={this.props.classicTheme}
        onCancel={this.props.onClose}
        onCreate={this.props.onCreate}
      />
    );
  }
}
