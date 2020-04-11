// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import TransferWaitingPage from '../../components/transfer/TransferWaitingPage';
import type { TransferStatusT } from '../../types/TransferTypes';
import Dialog from '../../components/widgets/Dialog';

type Props = {|
  +status: TransferStatusT
|};

@observer
export default class DaedalusTransferWaitingPage extends Component<Props> {

  render() {
    return (
      <Dialog
        closeOnOverlayClick={false}
      >
        <TransferWaitingPage status={this.props.status} />
      </Dialog>
    );
  }
}
