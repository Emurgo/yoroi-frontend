// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import validWords from 'bip39/wordlists/english.json';
import type { InjectedProps } from '../../types/injectedPropsType';
import TextOnlyTopBar from '../../components/layout/TextOnlyTopbar';
import DaedalusTransferForm from '../../components/daedalusTransfer/DaedalusTransferForm';
import DaedalusTransferWaitingPage from '../../components/daedalusTransfer/DaedalusTransferWaitingPage';
import DaedalusTransferSummaryPage from '../../components/daedalusTransfer/DaedalusTransferSummaryPage';
import DaedalusTransferErrorPage from '../../components/daedalusTransfer/DaedalusTransferErrorPage';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import environment from '../../environment';
import resolver from '../../utils/imports';

const { formattedWalletAmount } = resolver('utils/formatters');
const MainLayout = resolver('containers/MainLayout');

const messages = defineMessages({
  title: {
    id: 'daedalusTransfer.title',
    defaultMessage: '!!!Transfer From Daedalus',
    description: 'Transfer from Daedalus Title.'
  },
});

@inject('stores', 'actions') @observer
export default class DaedalusTransferPage extends Component<InjectedProps> {

  static defaultProps = { actions: null, stores: null };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  setupTransferFunds = (payload: { recoveryPhrase: string }) => {
    this._getDaedalusTransferActions().setupTransferFunds.trigger(payload);
  };

  tranferFunds = () => {
    this._getDaedalusTransferActions().transferFunds.trigger({
      next: () => {
        this._getWalletsStore().refreshWalletsData();
        this.props.actions.router.goToRoute.trigger({
          route: this._getWalletsStore().activeWalletRoute
        });
      }
    });
  }

  cancelTransferFunds = () => {
    this._getDaedalusTransferActions().cancelTransferFunds.trigger();
  }

  render() {
    const topBar = (<TextOnlyTopBar title={this.context.intl.formatMessage(messages.title)} />);
    const wallets = this._getWalletsStore();
    const daedalusTransfer = this._getDaedalusTransferStore();
    if (!wallets.active) {
      return (
        <MainLayout topbar={topBar}>
          <LoadingSpinner />
        </MainLayout>
      );
    }
    switch (daedalusTransfer.status) {
      case 'uninitialized':
        return (
          <MainLayout topbar={topBar}>
            <DaedalusTransferForm
              onSubmit={this.setupTransferFunds}
              mnemonicValidator={mnemonic => wallets.isValidMnemonic(mnemonic, 12)}
              suggestedMnemonics={validWords}
            />
          </MainLayout>
        );
      case 'restoringAddresses':
      case 'checkingAddresses':
      case 'generatingTx':
        return (
          <MainLayout topbar={topBar}>
            <DaedalusTransferWaitingPage status={daedalusTransfer.status} />
          </MainLayout>
        );
      case 'readyToTransfer':
        return (
          <MainLayout topbar={topBar}>
            <DaedalusTransferSummaryPage
              formattedWalletAmount={formattedWalletAmount}
              transferTx={daedalusTransfer.transferTx}
              onSubmit={this.tranferFunds}
              isSubmitting={daedalusTransfer.transferFundsRequest.isExecuting}
              onCancel={this.cancelTransferFunds}
              error={daedalusTransfer.error}
            />
          </MainLayout>
        );
      case 'error':
        return (
          <MainLayout topbar={topBar}>
            <DaedalusTransferErrorPage
              error={daedalusTransfer.error}
              onCancel={this.cancelTransferFunds}
            />
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

  _getDaedalusTransferActions() {
    return this.props.actions[environment.API].daedalusTransfer;
  }
}
