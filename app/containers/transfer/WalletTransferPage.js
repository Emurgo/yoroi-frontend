// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape } from 'react-intl';

import environment from '../../environment';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import globalMessages from '../../i18n/global-messages';

import MainLayout from '../MainLayout';
import WalletAdd from '../../components/wallet/WalletAdd';
import AddAnotherWallet from '../../components/wallet/add/AddAnotherWallet';

import WalletConnectHWOptionDialogContainer from '../wallet/dialogs/WalletConnectHWOptionDialogContainer';
import WalletConnectHWOptionDialog from '../../components/wallet/add/option-dialog/WalletConnectHWOptionDialog';

export type GeneratedData = typeof WalletTransferPage.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>;

@observer
export default class WalletTransferPage extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    this.generated.actions.dialogs.closeActiveDialog.trigger();
  };

  render() {
    const { actions, stores } = this.generated;
    const { uiDialogs } = stores;

    let activeDialog = null;
    if (uiDialogs.isOpen(WalletConnectHWOptionDialog)) {
      activeDialog = (
        <WalletConnectHWOptionDialogContainer
          onClose={this.onClose}
          onTrezor={() => {}}
          onLedger={() => {}}
        />
      );
    }

    const { hasActiveWallet } = this.generated.stores.wallets;
    if (!hasActiveWallet) {
      return (
        <>
          {/* <WalletAdd
            onHardwareConnect={
              () => actions.dialogs.open.trigger({ dialog: WalletConnectHWOptionDialog })
            }
            onCreate={() => actions.dialogs.open.trigger({ dialog: null })}
            onRestore={() => actions.dialogs.open.trigger({ dialog: null })}
          /> */}
          {activeDialog}
        </>
      );
    }
    return (
      <>
        <AddAnotherWallet
          onHardwareConnect={
            () => actions.dialogs.open.trigger({ dialog: WalletConnectHWOptionDialog })
          }
          onCreate={() => actions.dialogs.open.trigger({ dialog: null })}
          onRestore={() => actions.dialogs.open.trigger({ dialog: null })}
        />
        {activeDialog}
      </>
    );
  }

  _getRouter() {
    return this.generated.actions.router;
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletTransferPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        wallets: {
          hasActiveWallet: stores.wallets.hasActiveWallet,
        }
      },
      actions: {
        router: {
          goToRoute: {
            trigger: actions.router.goToRoute.trigger,
          },
        },
        dialogs: {
          closeActiveDialog: {
            trigger: actions.dialogs.closeActiveDialog.trigger,
          },
          open: {
            trigger: actions.dialogs.open.trigger,
          },
        },
      },
    });
  }
}
