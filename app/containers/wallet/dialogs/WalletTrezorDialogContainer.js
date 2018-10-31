// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import validWords from 'bip39/wordlists/english.json';
import WalletTrezorDialog from '../../../components/wallet/WalletTrezorDialog';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';

type Props = InjectedDialogContainerProps;

@inject('stores', 'actions') @observer
export default class WalletTrezorDialogContainer extends Component<Props> {

  static defaultProps = { actions: null, stores: null, children: null, onClose: () => {} };

  onSubmit = (values: { publicKey : string, walletName: string, deviceFeatures: any, }) => {
    this.props.actions[environment.API].wallets.connectTrezor.trigger(values);
  };

  onCancel = () => {
    this.props.onClose();
    // Restore request should be reset only in case restore is finished/errored
    const { restoreRequest } = this._getWalletsStore();
    if (!restoreRequest.isExecuting) restoreRequest.reset();
  };

  render() {
    const wallets = this._getWalletsStore();
    const { restoreRequest } = wallets;

    return (
      <WalletTrezorDialog
        mnemonicValidator={mnemonic => wallets.isValidMnemonic(mnemonic)}
        suggestedMnemonics={validWords}
        isSubmitting={restoreRequest.isExecuting}
        onSubmit={this.onSubmit}
        onCancel={this.onCancel}
        error={restoreRequest.error}
      />
    );
  }

  _getWalletsStore() {
    return this.props.stores[environment.API].wallets;
  }
}