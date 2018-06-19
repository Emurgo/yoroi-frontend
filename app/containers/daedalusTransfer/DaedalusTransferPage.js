// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { intlShape } from 'react-intl';
import validWords from 'bip39/wordlists/english.json';
import type { InjectedProps } from '../../types/injectedPropsType';
import MainLayout from '../MainLayout';
import DaedalusTransferForm from '../../components/daedalusTransfer/DaedalusTransferForm';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import environment from '../../environment';

@inject('stores', 'actions') @observer
export default class DaedalusTransferPage extends Component<InjectedProps> {

  static defaultProps = { actions: null, stores: null };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  onSubmit = (values: { recoveryPhrase: string, walletName: string, walletPassword: string }) => {
    this.props.actions[environment.API].wallets.restoreWallet.trigger(values);
  };

  onCancel = () => {
    // Restore request should be reset only in case restore is finished/errored
    const { restoreRequest } = this._getWalletsStore();
    if (!restoreRequest.isExecuting) restoreRequest.reset();
  };

  render() {
    const wallets = this._getWalletsStore();
    const { restoreRequest } = wallets;
    /* TODO: Replace with Daedalus transfer workflow */
    if (!wallets.active) return <MainLayout><LoadingSpinner /></MainLayout>;
    return (
      <MainLayout>
        <DaedalusTransferForm
          mnemonicValidator={mnemonic => wallets.isValidMnemonic(mnemonic)}
          suggestedMnemonics={validWords}
          isSubmitting={restoreRequest.isExecuting}
          onSubmit={this.onSubmit}
          onCancel={this.onCancel}
          error={restoreRequest.error}
        />
      </MainLayout>
    );
  }

  _getWalletsStore() {
    return this.props.stores[environment.API].wallets;
  }
}
