// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { InjectedProps } from '../../../types/injectedPropsType';
import UserPasswordDialog from '../../../components/wallet/add/paper-wallets/UserPasswordDialog';
import PaperWalletDialog from '../../../components/wallet/WalletPaperDialog';

type Props = {|
  ...InjectedProps,
  +onClose: void => void,
|};

@observer
// <TODO:PENDING_REMOVAL> paper
export default class WalletPaperDialogContainer
  extends Component<Props> {

  createPaperWallet: ((data: {|
    numAddresses: number,
  |}) => void) = (data) => {
    this.props.actions.dialogs.open.trigger({ dialog: UserPasswordDialog });
    this.props.actions.dialogs.updateDataForActiveDialog.trigger(data);
  };

  render(): Node {
    return (
      <PaperWalletDialog
        onCancel={this.props.onClose}
        onCreatePaper={this.createPaperWallet}
        paperWalletsIntroText={this.props.stores.profile.paperWalletsIntro}
        error={null}
      />
    );
  }

}
