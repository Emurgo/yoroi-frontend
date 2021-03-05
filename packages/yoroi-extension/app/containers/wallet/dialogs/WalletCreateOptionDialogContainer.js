// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletCreateOptionDialog from '../../../components/wallet/add/option-dialog/WalletCreateOptionDialog';

type Props = {|
  +onClose: void => void,
  +onCreate: void => void,
  +onPaper: void | (void => void),
|};

@observer
export default class WalletCreateOptionDialogContainer extends Component<Props> {
  render(): Node {
    return (
      <WalletCreateOptionDialog
        onCancel={this.props.onClose}
        onCreate={this.props.onCreate}
        onPaper={this.props.onPaper}
      />
    );
  }
}
