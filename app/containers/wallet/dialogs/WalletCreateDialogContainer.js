// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import WalletCreateDialog from '../../../components/wallet/WalletCreateDialog';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';

export type GeneratedData = typeof WalletCreateDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
|};

@observer
export default class WalletCreateDialogContainer extends Component<Props> {

  render(): Node {
    return (
      <WalletCreateDialog
        classicTheme={this.generated.stores.profile.isClassicTheme}
        onSubmit={this.generated.actions.ada.wallets.createWallet.trigger}
        onCancel={this.props.onClose}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      ada: {|
        wallets: {|
          createWallet: {|
            trigger: (params: {|name: string, password: string|}) => Promise<void>,
          |},
        |},
      |},
    |},
    stores: {|profile: {|isClassicTheme: boolean|}|},
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletCreateDialogContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
        },
      },
      actions: {
        ada: {
          wallets: {
            createWallet: {
              trigger: actions.ada.wallets.createWallet.trigger,
            },
          },
        },
      },
    });
  }
}
