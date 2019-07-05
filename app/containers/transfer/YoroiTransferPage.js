// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import validWords from 'bip39/src/wordlists/english.json';
import type { InjectedProps } from '../../types/injectedPropsType';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TransferLayout from '../../components/transfer/TransferLayout';
import YoroiTransferFormPage from './YoroiTransferFormPage';
import YoroiTransferSummaryPage from './YoroiTransferSummaryPage';
import YoroiTransferWaitingPage from './YoroiTransferWaitingPage';
import YoroiTransferErrorPage from './YoroiTransferErrorPage';
import MainLayout from '../MainLayout';
import environment from '../../environment';
import config from '../../config';
import { formattedWalletAmount } from '../../utils/formatters';

const messages = defineMessages({
  title: {
    id: 'yoroiTransfer.title',
    defaultMessage: '!!!Transfer funds from another wallet',
  },
});

@observer
export default class YoroiTransferPage extends Component<InjectedProps> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  setupTransferFundsWithMnemonic = (payload: { recoveryPhrase: string }) => {
    this._getYoroiTransferActions().setupTransferFundsWithMnemonic.trigger(payload);
  };

  /** Broadcast the transfer transaction if one exists and return to wallet page */
  tranferFunds = () => {
    // broadcast transfer transaction then call continuation
    this._getYoroiTransferActions().transferFunds.trigger({
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
    // FIXME: need the unintilized page design
  }

  cancelTransferFunds = () => {
    this._getYoroiTransferActions().cancelTransferFunds.trigger();
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
        categories={topbar.CATEGORIES}
        activeTopbarCategory={topbar.activeTopbarCategory}
      />
    );
    const wallets = this._getWalletsStore();
    const yoroiTransfer = this._getYoroiTransferStore();

    switch (yoroiTransfer.status) {
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
              <YoroiTransferFormPage
                onSubmit={this.setupTransferFundsWithMnemonic}
                onBack={this.backToUninitialized}
                mnemonicValidator={mnemonic => wallets.isValidMnemonic(
                  mnemonic,
                  config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT
                )}
                validWords={validWords}
                mnemonicLength={config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT}
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
              <YoroiTransferWaitingPage status={yoroiTransfer.status} />
            </TransferLayout>
          </MainLayout>
        );
      case 'readyToTransfer':
        if (yoroiTransfer.transferTx == null) {
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
              <YoroiTransferSummaryPage
                formattedWalletAmount={formattedWalletAmount}
                selectedExplorer={this.props.stores.profile.selectedExplorer}
                transferTx={yoroiTransfer.transferTx}
                onSubmit={this.tranferFunds}
                isSubmitting={yoroiTransfer.transferFundsRequest.isExecuting}
                onCancel={this.cancelTransferFunds}
                error={yoroiTransfer.error}
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
              <YoroiTransferErrorPage
                error={yoroiTransfer.error}
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

  _getYoroiTransferStore() {
    return this.props.stores.substores.ada.yoroiTransfer;
  }

  _getYoroiTransferActions() {
    return this.props.actions.ada.yoroiTransfer;
  }

}
