// @flow
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import validWords from 'bip39/src/wordlists/english.json';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import LegacyTransferLayout from '../../components/transfer/LegacyTransferLayout';
import TransferSummaryPage from '../../components/transfer/TransferSummaryPage';
import DaedalusTransferFormPage from './DaedalusTransferFormPage';
import DaedalusTransferMasterKeyFormPage from './DaedalusTransferMasterKeyFormPage';
import DaedalusTransferWaitingPage from './DaedalusTransferWaitingPage';
import DaedalusTransferErrorPage from './DaedalusTransferErrorPage';
import environment from '../../environment';
import config from '../../config';
import { TransferStatus, } from '../../types/TransferTypes';
import type { TransferStatusT, TransferTx } from '../../types/TransferTypes';
import LocalizableError from '../../i18n/LocalizableError';
import globalMessages from '../../i18n/global-messages';

import { formattedWalletAmount } from '../../utils/formatters';
import { ROUTES } from '../../routes-config';

export type MockDaedalusTransferStore = {|
  +status: TransferStatusT,
  +error: ?LocalizableError,
  +transferTx: ?TransferTx,
  +transferFundsRequest: {|
    isExecuting: boolean,
  |},
|};

export type GeneratedData = typeof DaedalusTransferPage.prototype.generated;

@observer
export default class DaedalusTransferPage extends Component<InjectedOrGenerated<GeneratedData>> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  goToCreateWallet: void => void = () => {
    this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
  }

  setupTransferFundsWithMnemonic: {|
    recoveryPhrase: string,
  |} => Promise<void> = async (payload) => {
    const walletsStore = this._getWalletsStore();
    const publicDeriver = walletsStore.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.setupTransferFundsWithMnemonic)} no wallet selected`);
    }
    await this._getDaedalusTransferActions().setupTransferFundsWithMnemonic.trigger({
      ...payload,
      publicDeriver
    });
  };

  setupTransferFundsWithMasterKey: {|
    masterKey: string,
  |} => Promise<void> = async (payload) => {
    const walletsStore = this._getWalletsStore();
    const publicDeriver = walletsStore.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.setupTransferFundsWithMasterKey)} no wallet selected`);
    }
    await this._getDaedalusTransferActions().setupTransferFundsWithMasterKey.trigger({
      ...payload,
      publicDeriver
    });
  };

  /** Broadcast the transfer transaction if one exists and return to wallet page */
  transferFunds: void => Promise<void> = async () => {
    const walletsStore = this._getWalletsStore();
    const publicDeriver = walletsStore.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.transferFunds)} no wallet selected`);
    }
    // broadcast transfer transaction then call continuation
    await this._getDaedalusTransferActions().transferFunds.trigger({
      next: async () => {
        try {
          await walletsStore.refreshWalletFromRemote(publicDeriver);
        } catch (_e) {
          // still need to re-route even if refresh failed
        }
        if (walletsStore.activeWalletRoute != null) {
          const newRoute = walletsStore.activeWalletRoute;
          this._getRouter().goToRoute.trigger({
            route: newRoute
          });
        }
      },
      publicDeriver
    });
  }

  backToUninitialized = () => {
    this._getDaedalusTransferActions().backToUninitialized.trigger();
  }

  cancelTransferFunds = () => {
    this._getDaedalusTransferActions().cancelTransferFunds.trigger();
  }

  render() {
    const { profile } = this.generated.stores;
    const adaWallets = this._getAdaWalletsStore();
    const daedalusTransfer = this._getDaedalusTransferStore();

    switch (daedalusTransfer.status) {
      case TransferStatus.GETTING_MNEMONICS:
        return (
          <LegacyTransferLayout>
            <DaedalusTransferFormPage
              onSubmit={this.setupTransferFundsWithMnemonic}
              onBack={this.backToUninitialized}
              mnemonicValidator={mnemonic => adaWallets.isValidMnemonic({
                mnemonic,
                numberOfWords: config.wallets.DAEDALUS_RECOVERY_PHRASE_WORD_COUNT
              })}
              validWords={validWords}
              mnemonicLength={config.wallets.DAEDALUS_RECOVERY_PHRASE_WORD_COUNT}
              classicTheme={profile.isClassicTheme}
            />
          </LegacyTransferLayout>
        );
      case TransferStatus.GETTING_PAPER_MNEMONICS:
        return (
          <LegacyTransferLayout>
            <DaedalusTransferFormPage
              onSubmit={this.setupTransferFundsWithMnemonic}
              onBack={this.backToUninitialized}
              mnemonicValidator={mnemonic => adaWallets.isValidPaperMnemonic({
                mnemonic,
                numberOfWords: config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT
              })}
              validWords={validWords}
              mnemonicLength={config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT}
              classicTheme={profile.isClassicTheme}
            />
          </LegacyTransferLayout>
        );
      case TransferStatus.GETTING_MASTER_KEY:
        return (
          <LegacyTransferLayout>
            <DaedalusTransferMasterKeyFormPage
              onSubmit={this.setupTransferFundsWithMasterKey}
              onBack={this.backToUninitialized}
              classicTheme={profile.isClassicTheme}
            />
          </LegacyTransferLayout>
        );
      case TransferStatus.RESTORING_ADDRESSES:
      case TransferStatus.CHECKING_ADDRESSES:
      case TransferStatus.GENERATING_TX:
        return (
          <LegacyTransferLayout>
            <DaedalusTransferWaitingPage status={daedalusTransfer.status} />
          </LegacyTransferLayout>
        );
      case TransferStatus.READY_TO_TRANSFER: {
        if (daedalusTransfer.transferTx == null) {
          return null; // TODO: throw error? Shouldn't happen
        }
        const { intl } = this.context;
        return (
          <LegacyTransferLayout>
            <TransferSummaryPage
              form={null}
              formattedWalletAmount={formattedWalletAmount}
              selectedExplorer={this.generated.stores.profile.selectedExplorer}
              transferTx={daedalusTransfer.transferTx}
              onSubmit={this.transferFunds}
              isSubmitting={daedalusTransfer.transferFundsRequest.isExecuting}
              onCancel={this.cancelTransferFunds}
              error={daedalusTransfer.error}
              dialogTitle={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
            />
          </LegacyTransferLayout>
        );
      }
      case TransferStatus.ERROR:
        return (
          <LegacyTransferLayout>
            <DaedalusTransferErrorPage
              error={daedalusTransfer.error}
              onCancel={this.cancelTransferFunds}
              classicTheme={profile.isClassicTheme}
            />
          </LegacyTransferLayout>
        );
      default:
        throw new Error('DaedalusTransferPage Unexpected state ' + daedalusTransfer.status);
    }
  }

  _getRouter() {
    return this.generated.actions.router;
  }

  _getWalletsStore() {
    return this.generated.stores.wallets;
  }

  _getAdaWalletsStore() {
    return this.generated.stores.substores[environment.API].wallets;
  }

  _getDaedalusTransferStore() {
    return this.generated.stores.substores.ada.daedalusTransfer;
  }

  _getDaedalusTransferActions() {
    return this.generated.actions.ada.daedalusTransfer;
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(DaedalusTransferPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const adaStores = stores.substores.ada;
    const { daedalusTransfer } = actions.ada;
    return Object.freeze({
      stores: {
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          selectedExplorer: stores.profile.selectedExplorer,
        },
        wallets: {
          selected: stores.wallets.selected,
          activeWalletRoute: stores.wallets.activeWalletRoute,
          refreshWalletFromRemote: stores.wallets.refreshWalletFromRemote,
        },
        substores: {
          ada: {
            wallets: {
              isValidMnemonic: adaStores.wallets.isValidMnemonic,
              isValidPaperMnemonic: adaStores.wallets.isValidPaperMnemonic,
            },
            daedalusTransfer: {
              status: adaStores.daedalusTransfer.status,
              error: adaStores.daedalusTransfer.error,
              transferTx: adaStores.daedalusTransfer.transferTx,
              transferFundsRequest: {
                isExecuting: adaStores.daedalusTransfer.transferFundsRequest.isExecuting,
              },
            },
          },
        },
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        ada: {
          daedalusTransfer: {
            backToUninitialized: { trigger: daedalusTransfer.backToUninitialized.trigger },
            cancelTransferFunds: { trigger: daedalusTransfer.cancelTransferFunds.trigger },
            transferFunds: { trigger: daedalusTransfer.transferFunds.trigger },
            setupTransferFundsWithMasterKey: {
              trigger: daedalusTransfer.setupTransferFundsWithMasterKey.trigger
            },
            setupTransferFundsWithMnemonic: {
              trigger: daedalusTransfer.setupTransferFundsWithMnemonic.trigger
            },
          },
        },
      },
    });
  }
}
