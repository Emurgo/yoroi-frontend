// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import TransferWaitingPage from '../../components/transfer/TransferWaitingPage';

type Props = {|
  status: string
|};

@observer
export default class DaedalusTransferWaitingPage extends Component<Props> {

  render() {
    return (
      <TransferWaitingPage status={this.props.status} />
    );
  }
}
