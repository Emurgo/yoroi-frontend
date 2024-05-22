// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import WalletCreateDialog from '../../../components/wallet/WalletCreateDialog';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';

type Props = {|
  ...StoresAndActionsProps,
  +onClose: void => void,
|};

@observer
export default class WalletCreateDialogContainer extends Component<Props> {
  render(): Node {
    return (
      <WalletCreateDialog
        classicTheme={this.props.stores.profile.isClassicTheme}
        onSubmit={this.props.actions.ada.wallets.startWalletCreation.trigger}
        onCancel={this.props.onClose}
      />
    );
  }
}
