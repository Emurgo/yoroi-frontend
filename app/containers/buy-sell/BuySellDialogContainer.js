// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import BuySellDialog from '../../components/buySell/BuySellDialog'

type Props = {|
  +onClose: void => void,
|};

@observer
export default class BuySellDialogContainer extends Component<Props> {

  render(): Node {
    return (
      <BuySellDialog onCancel={this.props.onClose} />
    );
  }
}
