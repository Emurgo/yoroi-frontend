// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import validWords from 'bip39/src/wordlists/english.json';
import type { InjectedProps } from '../../types/injectedPropsType';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TransferLayout from '../../components/transfer/TransferLayout';
import TransferInstructionsPage from '../../components/transfer/TransferInstructionsPage';
import DaedalusTransferFormPage from './DaedalusTransferFormPage';
import DaedalusTransferMasterKeyFormPage from './DaedalusTransferMasterKeyFormPage';
import DaedalusTransferWaitingPage from './DaedalusTransferWaitingPage';
import DaedalusTransferSummaryPage from './DaedalusTransferSummaryPage';
import DaedalusTransferErrorPage from './DaedalusTransferErrorPage';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import config from '../../config';

import { formattedWalletAmount } from '../../utils/formatters';
import MainLayout from '../MainLayout';

const messages = defineMessages({
  title: {
    id: 'daedalusTransfer.title',
    defaultMessage: '!!!Transfer funds from Daedalus',
  },
});

@observer
export default class DaedalusTransferPage extends Component<InjectedProps> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  goToCreateWallet = () => {
    this._getRouter().goToRoute.trigger({
      route: ROUTES.WALLETS.ADD
    });
  }

  startTransferFunds = () => {
    this._getDaedalusTransferActions().startTransferFunds.trigger();
  }

  startTransferPaperFunds = () => {
    this._getDaedalusTransferActions().startTransferPaperFunds.trigger();
  }

  startTransferMasterKey = () => {
    this._getDaedalusTransferActions().startTransferMasterKey.trigger();
  }

  setupTransferFundsWithMnemonic = (payload: { recoveryPhrase: string }) => {
    this._getDaedalusTransferActions().setupTransferFundsWithMnemonic.trigger(payload);
  };

  setupTransferFundsWithMasterKey = (payload: { masterKey: string }) => {
    this._getDaedalusTransferActions().setupTransferFundsWithMasterKey.trigger(payload);
  };

  /** Broadcast the transfer transaction if one exists and return to wallet page */
  tranferFunds = () => {
    // broadcast transfer transaction then call continuation
    this._getDaedalusTransferActions().transferFunds.trigger({
      next: () => {
        const walletsStore = this._getWalletsStore();
        walletsStore.refreshWalletsData();
        if (walletsStore.activeWalletRoute != null) {
          const newRoute = walletsStore.activeWalletRoute;
          this._getRouter().goToRoute.trigger({
            route: newRoute
          });
        }
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
    const { stores, actions } = this.props;
    const { topbar, profile } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;

    const topbarTitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topBar = (
      <TopBar
        title={topbarTitle}
        onCategoryClicked={category => {
          actions.topbar.activateTopbarCategory.trigger({ category });
        }}
        isActiveCategory={topbar.isActiveCategory}
        categories={topbar.categories}
      />
    );
    const wallets = this._getWalletsStore();
    const daedalusTransfer = this._getDaedalusTransferStore();

    switch (daedalusTransfer.status) {
      case 'uninitialized':
        return (
          <MainLayout
            topbar={topBar}
            classicTheme={profile.isClassicTheme}
            connectionErrorType={checkAdaServerStatus}
            actions={actions}
            stores={stores}
          >
            <TransferLayout>
              <TransferInstructionsPage
                onFollowInstructionsPrerequisites={this.goToCreateWallet}
                onConfirm={this.startTransferFunds}
                onPaperConfirm={this.startTransferPaperFunds}
                onMasterKeyConfirm={this.startTransferMasterKey}
                disableTransferFunds={daedalusTransfer.disableTransferFunds}
              />
            </TransferLayout>
          </MainLayout>
        );
      case 'gettingMnemonics':
        return (
          <MainLayout
            topbar={topBar}
            classicTheme={profile.isClassicTheme}
            connectionErrorType={checkAdaServerStatus}
            actions={actions}
            stores={stores}
          >
            <TransferLayout>
              <DaedalusTransferFormPage
                onSubmit={this.setupTransferFundsWithMnemonic}
                onBack={this.backToUninitialized}
                mnemonicValidator={mnemonic => wallets.isValidMnemonic(
                  mnemonic,
                  config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT
                )}
                validWords={validWords}
                mnemonicLength={12}
                classicTheme={profile.isClassicTheme}
              />
            </TransferLayout>
          </MainLayout>
        );
      case 'gettingPaperMnemonics':
        return (
          <MainLayout
            topbar={topBar}
            classicTheme={profile.isClassicTheme}
            connectionErrorType={checkAdaServerStatus}
            actions={actions}
            stores={stores}
          >
            <TransferLayout>
              <DaedalusTransferFormPage
                onSubmit={this.setupTransferFundsWithMnemonic}
                onBack={this.backToUninitialized}
                mnemonicValidator={mnemonic => wallets.isValidPaperMnemonic(mnemonic, 27)}
                validWords={validWords}
                mnemonicLength={27}
                classicTheme={profile.isClassicTheme}
              />
            </TransferLayout>
          </MainLayout>
        );
      case 'gettingMasterKey':
        return (
          <MainLayout
            topbar={topBar}
            classicTheme={profile.isClassicTheme}
            connectionErrorType={checkAdaServerStatus}
            actions={actions}
            stores={stores}
          >
            <TransferLayout>
              <DaedalusTransferMasterKeyFormPage
                onSubmit={this.setupTransferFundsWithMasterKey}
                onBack={this.backToUninitialized}
                classicTheme={profile.isClassicTheme}
              />
            </TransferLayout>
          </MainLayout>
        );
      case 'restoringAddresses':
      case 'checkingAddresses':
      case 'generatingTx':
        return (
          <MainLayout
            topbar={topBar}
            classicTheme={profile.isClassicTheme}
            connectionErrorType={checkAdaServerStatus}
            actions={actions}
            stores={stores}
          >
            <TransferLayout>
              <DaedalusTransferWaitingPage status={daedalusTransfer.status} />
            </TransferLayout>
          </MainLayout>
        );
      case 'readyToTransfer':
        if (daedalusTransfer.transferTx == null) {
          return null; // TODO: throw error? Shoudln't happen
        }
        return (
          <MainLayout
            topbar={topBar}
            classicTheme={profile.isClassicTheme}
            connectionErrorType={checkAdaServerStatus}
            actions={actions}
            stores={stores}
          >
            <TransferLayout>
              <DaedalusTransferSummaryPage
                formattedWalletAmount={formattedWalletAmount}
                selectedExplorer={this.props.stores.profile.selectedExplorer}
                transferTx={daedalusTransfer.transferTx}
                onSubmit={this.tranferFunds}
                isSubmitting={daedalusTransfer.transferFundsRequest.isExecuting}
                onCancel={this.cancelTransferFunds}
                error={daedalusTransfer.error}
                classicTheme={profile.isClassicTheme}
              />
            </TransferLayout>
          </MainLayout>
        );
      case 'error':
        return (
          <MainLayout
            topbar={topBar}
            classicTheme={profile.isClassicTheme}
            connectionErrorType={checkAdaServerStatus}
            actions={actions}
            stores={stores}
          >
            <TransferLayout>
              <DaedalusTransferErrorPage
                error={daedalusTransfer.error}
                onCancel={this.cancelTransferFunds}
                classicTheme={profile.isClassicTheme}
              />
            </TransferLayout>
          </MainLayout>
        );
      default:
        return null; // TODO: throw error? Shouldn't happen
    }
  }

  _getRouter() {
    return this.props.actions.router;
  }

  _getWalletsStore() {
    return this.props.stores.substores[environment.API].wallets;
  }

  _getDaedalusTransferStore() {
    return this.props.stores.substores.ada.daedalusTransfer;
  }

  _getDaedalusTransferActions() {
    return this.props.actions.ada.daedalusTransfer;
  }
}
