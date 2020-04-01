// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ByronOptionDialog from '../../components/transfer/cards/ByronOptionDialog';

type Props = {|
  +onClose: void => void,
  +onTrezor: void => void,
  +onLedger: void => void,
|};

@observer
export default class ByronEraOptionDialogContainer extends Component<Props> {

  render() {
    return (
      <ByronOptionDialog
        onCancel={this.props.onClose}
        onTrezor={this.props.onTrezor}
        onLedger={this.props.onLedger}
      />
    );
  }
}
