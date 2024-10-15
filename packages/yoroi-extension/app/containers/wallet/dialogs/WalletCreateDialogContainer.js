// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import WalletCreateDialog from '../../../components/wallet/WalletCreateDialog';
import type { StoresProps } from '../../../stores';

type LocalProps = {|
  +onClose: void => void,
|};

@observer
export default class WalletCreateDialogContainer extends Component<{| ...StoresProps, ...LocalProps |}> {
  render(): Node {
    return (
      <WalletCreateDialog
        onSubmit={request => this.props.stores.substores.ada.wallets.startWalletCreation(request)}
        onCancel={this.props.onClose}
      />
    );
  }
}
