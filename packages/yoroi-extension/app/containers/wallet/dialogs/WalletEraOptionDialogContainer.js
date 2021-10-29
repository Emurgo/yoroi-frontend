// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import WalletEraOptionDialog from '../../../components/wallet/add/option-dialog/WalletEraOptionDialog';

type Props = {|
  +onClose: void => void,
  +onByron: void => void,
  +onShelley: void => void,
  +onBack: void => void,
|};

@observer
export default class WalletEraOptionDialogContainer extends Component<Props> {

  render(): Node {
    return (
      <WalletEraOptionDialog
        onCancel={this.props.onClose}
        onByron={this.props.onByron}
        onShelley={this.props.onShelley}
        onBack={this.props.onBack}
      />
    );
  }
}
