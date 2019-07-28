// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import validWords from 'bip39/src/wordlists/english.json';
import type { InjectedProps } from '../../types/injectedPropsType';
import TransferLayout from '../../components/transfer/TransferLayout';
import YoroiTransferFormPage from './YoroiTransferFormPage';
import YoroiTransferSummaryPage from './YoroiTransferSummaryPage';
import YoroiTransferWaitingPage from './YoroiTransferWaitingPage';
import YoroiTransferErrorPage from './YoroiTransferErrorPage';
import YoroiTransferSuccessPage from './YoroiTransferSuccessPage';
import YoroiTransferStartPage from '../../components/transfer/YoroiTransferStartPage';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import config from '../../config';
import { formattedWalletAmount } from '../../utils/formatters';

// Stay this long on the success page, then jump to the wallet transactions page
const SUCCESS_PAGE_STAY_TIME = 5 * 1000;

@observer
export default class YoroiTransferPage extends Component<InjectedProps> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  componentWillUnmount() {
    const yoroiTransfer = this._getYoroiTransferStore();
    yoroiTransfer.reset();
  }

  goToCreateWallet = () => {
    this._getRouter().goToRoute.trigger({
      route: ROUTES.WALLETS.ADD
    });
  }

  startTransferFunds = () => {
    this._getYoroiTransferActions().startTransferFunds.trigger();
  }

  setupTransferFundsWithMnemonic = (payload: { recoveryPhrase: string }) => {
    this._getYoroiTransferActions().setupTransferFundsWithMnemonic.trigger(payload);
  };

  /** Broadcast the transfer transaction if one exists and return to wallet page */
  tranferFunds = () => {
    // broadcast transfer transaction then call continuation
    this._getYoroiTransferActions().transferFunds.trigger({
      next: () => new Promise(resolve => {
        const walletsStore = this._getWalletsStore();
        walletsStore.refreshWalletsData();

        setTimeout(() => {
          if (walletsStore.activeWalletRoute != null) {
            const newRoute = walletsStore.activeWalletRoute;
            this._getRouter().goToRoute.trigger({
              route: newRoute
            });
          }
          resolve();
        }, SUCCESS_PAGE_STAY_TIME);
      })
    });
  }

  backToUninitialized = () => {
    this._getYoroiTransferActions().backToUninitialized.trigger();
  };

  cancelTransferFunds = () => {
    this._getYoroiTransferActions().cancelTransferFunds.trigger();
  };


  render() {
    const { stores } = this.props;
    const { profile } = stores;
    const wallets = this._getWalletsStore();
    const yoroiTransfer = this._getYoroiTransferStore();

    switch (yoroiTransfer.status) {
      case 'uninitialized':
        return (
          <TransferLayout>
            <YoroiTransferStartPage
              onNext={this.startTransferFunds}
              classicTheme={profile.isClassicTheme}
              onFollowInstructionsPrerequisites={this.goToCreateWallet}
              disableTransferFunds={yoroiTransfer.disableTransferFunds}
            />
          </TransferLayout>
        );
      case 'gettingMnemonics':
        return (
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
        );
      case 'restoringAddresses':
      case 'checkingAddresses':
      case 'generatingTx':
        return (
          <TransferLayout>
            <YoroiTransferWaitingPage status={yoroiTransfer.status} />
          </TransferLayout>
        );
      case 'readyToTransfer':
        if (yoroiTransfer.transferTx == null) {
          return null; // TODO: throw error? Shoudln't happen
        }
        return (
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
        );
      case 'error':
        return (
          <TransferLayout>
            <YoroiTransferErrorPage
              error={yoroiTransfer.error}
              onCancel={this.cancelTransferFunds}
              classicTheme={profile.isClassicTheme}
            />
          </TransferLayout>
        );
      case 'success':
        return (
          <TransferLayout>
            <YoroiTransferSuccessPage
              classicTheme={profile.isClassicTheme}
            />
          </TransferLayout>
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
