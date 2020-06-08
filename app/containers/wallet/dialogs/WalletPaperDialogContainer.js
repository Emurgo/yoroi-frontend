// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import UserPasswordDialog from '../../../components/wallet/add/paper-wallets/UserPasswordDialog';
import PaperWalletDialog from '../../../components/wallet/WalletPaperDialog';

export type GeneratedData = typeof WalletPaperDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
|};

@observer
export default class WalletPaperDialogContainer
  extends Component<Props> {

  @computed get generated(): {|
    actions: {|
      dialogs: {|
        open: {|trigger: (params: {|dialog: any, params?: any|}) => void|},
        updateDataForActiveDialog: {|
          trigger: (params: {[key: string]: any, ...}) => void,
        |},
      |},
    |},
    stores: {|profile: {|paperWalletsIntro: string|}|},
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletPaperDialogContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          paperWalletsIntro: stores.profile.paperWalletsIntro,
        },
      },
      actions: {
        dialogs: {
          open: { trigger: actions.dialogs.open.trigger },
          updateDataForActiveDialog: { trigger: actions.dialogs.updateDataForActiveDialog.trigger },
        },
      },
    });
  }

  createPaperWallet: ((data: {|
    numAddresses: number,
    printAccountPlate: boolean,
  |}) => void) = (data) => {
    this.generated.actions.dialogs.open.trigger({ dialog: UserPasswordDialog });
    this.generated.actions.dialogs.updateDataForActiveDialog.trigger({ data });
  };

  render(): Node {
    return (
      <PaperWalletDialog
        onCancel={this.props.onClose}
        onCreatePaper={this.createPaperWallet}
        paperWalletsIntroText={this.generated.stores.profile.paperWalletsIntro}
        error={null}
      />
    );
  }

}
