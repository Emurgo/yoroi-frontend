// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import validWords from 'bip39/wordlists/english.json';
import type { InjectedProps } from '../../types/injectedPropsType';
import TextOnlyTopBar from '../../components/layout/TextOnlyTopbar';
import DaedalusTransferInstructionsPage from '../../components/daedalusTransfer/DaedalusTransferInstructionsPage';
import DaedalusTransferFormPage from '../../components/daedalusTransfer/DaedalusTransferFormPage';
import DaedalusTransferWaitingPage from '../../components/daedalusTransfer/DaedalusTransferWaitingPage';
import DaedalusTransferSummaryPage from '../../components/daedalusTransfer/DaedalusTransferSummaryPage';
import DaedalusTransferErrorPage from '../../components/daedalusTransfer/DaedalusTransferErrorPage';
import environment from '../../environment';
import resolver from '../../utils/imports';
import { ROUTES } from '../../routes-config';

const { formattedWalletAmount } = resolver('utils/formatters');
const MainLayout = resolver('containers/MainLayout');

const messages = defineMessages({
  title: {
    id: 'daedalusTransfer.title',
    defaultMessage: '!!!Transfer funds from Daedalus',
    description: 'Transfer from Daedalus Title.'
  },
});

@inject('stores', 'actions') @observer
export default class DaedalusTransferPage extends Component<InjectedProps> {

  static defaultProps = { actions: null, stores: null };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  goToCreateWallet = () => {
    this._getRouter().goToRoute.trigger({
      route: ROUTES.WALLETS.ADD
    });
  }

  goToReceiveScreen = () => {
    const wallet = this._getWalletsStore().active;
    this._getRouter().goToRoute.trigger({
      route: ROUTES.WALLETS.PAGE,
      params: {
        id: wallet && wallet.id,
        page: 'receive'
      },
    });
  }

  startTransferFunds = () => {
    this._getDaedalusTransferActions().startTransferFunds.trigger();
  }

  setupTransferFunds = (payload: { recoveryPhrase: string }) => {
    this._getDaedalusTransferActions().setupTransferFunds.trigger(payload);
  };

  tranferFunds = () => {
    this._getDaedalusTransferActions().transferFunds.trigger({
      next: () => {
        this._getWalletsStore().refreshWalletsData();
        this._getRouter().goToRoute.trigger({
          route: this._getWalletsStore().activeWalletRoute
        });
      }
    });
  }

  backToUninitialized = () => {
    this._getDaedalusTransferActions().backToUninitialized.trigger();
  }

  cancelTransferFunds = () => {
    this._getDaedalusTransferActions().cancelTransferFunds.trigger();
  }

  render() {
    const topBar = (<TextOnlyTopBar title={this.context.intl.formatMessage(messages.title)} />);
    const wallets = this._getWalletsStore();
    const daedalusTransfer = this._getDaedalusTransferStore();
    switch (daedalusTransfer.status) {
      case 'uninitialized':
        return (
          <MainLayout topbar={topBar}>
            <DaedalusTransferInstructionsPage
              onFollowInstructionsPrerequisites={this.goToCreateWallet}
              onAnswerYes={this.goToReceiveScreen}
              onAnswerNo={this.startTransferFunds}
              disableTransferFunds={daedalusTransfer.disableTransferFunds}
            />
          </MainLayout>
        );
      case 'gettingMnemonics':
        return (
          <MainLayout topbar={topBar}>
            <DaedalusTransferFormPage
              onSubmit={this.setupTransferFunds}
              onBack={this.backToUninitialized}
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

  _getRouter() {
    return this.props.actions.router;
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
