// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { intlShape } from 'react-intl';
import validWords from 'bip39/wordlists/english.json';
import type { InjectedProps } from '../../types/injectedPropsType';
import MainLayout from '../MainLayout';
import DaedalusTransferForm from '../../components/daedalusTransfer/DaedalusTransferForm';
import DaedalusTransferWaitingPage from '../../components/daedalusTransfer/DaedalusTransferWaitingPage';
import DaedalusTransferSummaryPage from '../../components/daedalusTransfer/DaedalusTransferSummaryPage';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import environment from '../../environment';

@inject('stores', 'actions') @observer
export default class DaedalusTransferPage extends Component<InjectedProps> {

  static defaultProps = { actions: null, stores: null };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  onSubmit = (payload: { recoveryPhrase: string }) => {
    this.props.actions[environment.API].daedalusTransfer.restoreAddresses.trigger(payload);
  };

  onCancel = () => {};

  render() {
    const wallets = this._getWalletsStore();
    const daedalusTransfer = this._getDaedalusTransferStore();
    if (!wallets.active) return <MainLayout><LoadingSpinner /></MainLayout>;
    switch (daedalusTransfer.status) {
      case 'uninitialized':
        return (
          <MainLayout>
            <DaedalusTransferForm
              mnemonicValidator={mnemonic => wallets.isValidMnemonic(mnemonic)}
              suggestedMnemonics={validWords}
              isSubmitting={false}
              onSubmit={this.onSubmit}
              onCancel={this.onCancel}
              error={undefined}
            />
          </MainLayout>
        );
      case 'restoringAddresses':
      case 'checkingAddresses':
      case 'generatingTx':
        return (
          <MainLayout>
            <DaedalusTransferWaitingPage status={daedalusTransfer.status} />
          </MainLayout>
        );
      case 'aboutToSend':
        return (
          <MainLayout>
            <DaedalusTransferSummaryPage />
          </MainLayout>
        );
      default:
        return null;
    }
  }

  _getWalletsStore() {
    return this.props.stores[environment.API].wallets;
  }

  _getDaedalusTransferStore() {
    return this.props.stores[environment.API].daedalusTransfer;
  }
}
