// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import WalletCreateDialog from '../../../components/wallet/WalletCreateDialog';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';

type LocalProps = {|
  +onClose: void => void,
|};

@observer
export default class WalletCreateDialogContainer extends Component<{| ...StoresAndActionsProps, ...LocalProps |}> {
  render(): Node {
    return (
      <WalletCreateDialog
        classicTheme={this.props.stores.profile.isClassicTheme}
        onSubmit={request => this.props.stores.substores.ada.wallets.startWalletCreation(request)}
        onCancel={this.props.onClose}
      />
    );
  }
}
