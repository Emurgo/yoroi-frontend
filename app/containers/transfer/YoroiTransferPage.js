// @flow
import {
  validateMnemonic,
} from 'bip39';
import { computed } from 'mobx';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, } from 'react-intl';
import validWords from 'bip39/src/wordlists/english.json';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import TransferSummaryPage from '../../components/transfer/TransferSummaryPage';
import HardwareDisclaimerPage from './HardwareDisclaimerPage';
import YoroiTransferFormPage from './YoroiTransferFormPage';
import YoroiPaperWalletFormPage from './YoroiPaperWalletFormPage';
import HardwareTransferFormPage from './HardwareTransferFormPage';
import YoroiPlatePage from './YoroiPlatePage';
import YoroiTransferWaitingPage from './YoroiTransferWaitingPage';
import YoroiTransferErrorPage from './YoroiTransferErrorPage';
import YoroiTransferSuccessPage from './YoroiTransferSuccessPage';
import environment from '../../environment';
import config from '../../config';
import { formattedWalletAmount } from '../../utils/formatters';
import { TransferStatus, } from '../../types/TransferTypes';
import type { TransferStatusT, TransferTx } from '../../types/TransferTypes';
import LocalizableError from '../../i18n/LocalizableError';
import { ROUTES } from '../../routes-config';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import globalMessages from '../../i18n/global-messages';
import type { GeneratedData as YoroiPlateData } from './YoroiPlatePage';

// Stay this long on the success page, then jump to the wallet transactions page
const SUCCESS_PAGE_STAY_TIME = 5 * 1000;

export type GeneratedData = typeof YoroiTransferPage.prototype.generated;

export type MockYoroiTransferStore = {|
  +status: TransferStatusT,
  +error: ?LocalizableError,
  +transferTx: ?TransferTx,
  +transferFundsRequest: {|
    isExecuting: boolean,
  |},
  +nextInternalAddress: PublicDeriver<> => (void => Promise<string>),
  +recoveryPhrase: string,
  +reset: void => void,
|};

@observer
export default class YoroiTransferPage extends Component<InjectedOrGenerated<GeneratedData>> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  goToCreateWallet: void => void = () => {
    this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
  }

  setupTransferFundsWithMnemonic: {|
    recoveryPhrase: string,
  |} => void = (payload) => {
    this._getYoroiTransferActions().setupTransferFundsWithMnemonic.trigger({
      ...payload,
    });
  };

  setupTransferFundsWithPaperMnemonic = (payload: {|
    recoveryPhrase: string,
    paperPassword: string,
  |}) => {
    this._getYoroiTransferActions().setupTransferFundsWithPaperMnemonic.trigger({
      ...payload,
    });
  };

  checkAddresses: void => Promise<void> = async () => {
    const walletsStore = this._getWalletsStore();
    const yoroiTransfer = this._getYoroiTransferStore();
    const publicDeriver = walletsStore.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.checkAddresses)} no wallet selected`);
    }
    await this._getYoroiTransferActions().checkAddresses.trigger({
      getDestinationAddress: yoroiTransfer.nextInternalAddress(publicDeriver),
    });
  };

  /** Broadcast the transfer transaction if one exists and return to wallet page */
  transferFunds: void => Promise<void> = async () => {
    // broadcast transfer transaction then call continuation
    const walletsStore = this._getWalletsStore();
    const yoroiTransfer = this._getYoroiTransferStore();
    const publicDeriver = walletsStore.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.transferFunds)} no wallet selected`);
    }
    await this._getYoroiTransferActions().transferFunds.trigger({
      next: async () => {
        const preRefreshTime = new Date().getTime();
        try {
          await walletsStore.refreshWalletFromRemote(publicDeriver);
        } catch (_e) {
          // still need to re-route even if refresh failed
        }
        const timeToRefresh = (new Date().getTime()) - preRefreshTime;
        await new Promise(resolve => {
          setTimeout(() => {
            if (walletsStore.activeWalletRoute != null) {
              const newRoute = walletsStore.activeWalletRoute;
              this._getRouter().goToRoute.trigger({
                route: newRoute
              });
            }
            resolve();
          }, Math.max(SUCCESS_PAGE_STAY_TIME - timeToRefresh, 0));
        });
      },
      getDestinationAddress: yoroiTransfer.nextInternalAddress(publicDeriver),
      rebuildTx: true,
    });
  }

  backToUninitialized = () => {
    this._getYoroiTransferActions().backToUninitialized.trigger();
  };

  cancelTransferFunds = () => {
    this._getYoroiTransferActions().cancelTransferFunds.trigger();
  };


  render() {
    const { stores } = this.generated;
    const { profile } = stores;
    const yoroiTransfer = this._getYoroiTransferStore();

    const coinPrice: ?number = this.generated.stores.profile.unitOfAccount.enabled
      ? (
        this.generated.stores.coinPriceStore
          .getCurrentPrice('ADA', this.generated.stores.profile.unitOfAccount.currency)
      )
      : null;

    switch (yoroiTransfer.status) {
      case TransferStatus.GETTING_MNEMONICS:
        return (
          <YoroiTransferFormPage
            onSubmit={this.setupTransferFundsWithMnemonic}
            onBack={this.backToUninitialized}
            mnemonicValidator={mnemonic => this._getAdaWalletsStore().isValidMnemonic({
              mnemonic,
              numberOfWords: config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT
            })}
            validWords={validWords}
            mnemonicLength={config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT}
            classicTheme={profile.isClassicTheme}
          />
        );
      case TransferStatus.GETTING_PAPER_MNEMONICS:
        return (
          <YoroiPaperWalletFormPage
            onSubmit={this.setupTransferFundsWithPaperMnemonic}
            onBack={this.backToUninitialized}
            mnemonicValidator={mnemonic => this._getAdaWalletsStore().isValidPaperMnemonic({
              mnemonic,
              numberOfWords: config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT
            })}
            validWords={validWords}
            mnemonicLength={config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT}
            passwordMatches={_password => true}
            includeLengthCheck={false}
            classicTheme={profile.isClassicTheme}
          />
        );
      case TransferStatus.HARDWARE_DISCLAIMER:
        return (
          <HardwareDisclaimerPage
            onBack={() => this._getYoroiTransferActions().cancelTransferFunds.trigger()}
            onNext={() => this._getYoroiTransferActions().startHardwareMnemnoic.trigger()}
          />
        );
      case TransferStatus.GETTING_HARDWARE_MNEMONIC:
        return (
          <HardwareTransferFormPage
            onSubmit={this.setupTransferFundsWithMnemonic}
            onBack={this.backToUninitialized}
            // different hardware wallet support different lengths
            // so we just allow any length as long as the mnemonic is valid
            mnemonicValidator={mnemonic => validateMnemonic(mnemonic)}
            validWords={validWords}
            classicTheme={profile.isClassicTheme}
          />
        );
      case TransferStatus.DISPLAY_CHECKSUM:
        return (
          <YoroiPlatePage
            {...this.generated.YoroiPlateProps}
            onNext={this.checkAddresses}
            onCancel={this.backToUninitialized}
          />
        );
      case TransferStatus.RESTORING_ADDRESSES:
      case TransferStatus.CHECKING_ADDRESSES:
      case TransferStatus.GENERATING_TX:
        return (
          <YoroiTransferWaitingPage status={yoroiTransfer.status} />
        );
      case TransferStatus.READY_TO_TRANSFER: {
        if (yoroiTransfer.transferTx == null) {
          return null; // TODO: throw error? Shouldn't happen
        }
        const { intl } = this.context;
        return (
          <TransferSummaryPage
            form={null}
            formattedWalletAmount={formattedWalletAmount}
            selectedExplorer={this.generated.stores.profile.selectedExplorer}
            transferTx={yoroiTransfer.transferTx}
            onSubmit={this.transferFunds}
            isSubmitting={yoroiTransfer.transferFundsRequest.isExecuting}
            onCancel={this.cancelTransferFunds}
            error={yoroiTransfer.error}
            dialogTitle={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
            coinPrice={coinPrice}
            unitOfAccountSetting={stores.profile.unitOfAccount}
          />
        );
      }
      case TransferStatus.ERROR:
        return (
          <YoroiTransferErrorPage
            error={yoroiTransfer.error}
            onCancel={this.cancelTransferFunds}
            classicTheme={profile.isClassicTheme}
          />
        );
      case TransferStatus.SUCCESS:
        return (
          <YoroiTransferSuccessPage
            classicTheme={profile.isClassicTheme}
          />
        );
      default:
        return null;
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

  _getYoroiTransferStore() {
    return this.generated.stores.substores.ada.yoroiTransfer;
  }

  _getYoroiTransferActions() {
    return this.generated.actions.ada.yoroiTransfer;
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(YoroiTransferPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const adaStores = stores.substores.ada;
    const { yoroiTransfer } = actions.ada;
    return Object.freeze({
      stores: {
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          selectedExplorer: stores.profile.selectedExplorer,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        wallets: {
          selected: stores.wallets.selected,
          activeWalletRoute: stores.wallets.activeWalletRoute,
          refreshWalletFromRemote: stores.wallets.refreshWalletFromRemote,
        },
        coinPriceStore: {
          getCurrentPrice: stores.substores.ada.coinPriceStore.getCurrentPrice,
        },
        substores: {
          ada: {
            wallets: {
              isValidMnemonic: adaStores.wallets.isValidMnemonic,
              isValidPaperMnemonic: adaStores.wallets.isValidPaperMnemonic,
            },
            yoroiTransfer: {
              status: adaStores.yoroiTransfer.status,
              error: adaStores.yoroiTransfer.error,
              transferTx: adaStores.yoroiTransfer.transferTx,
              transferFundsRequest: {
                isExecuting: adaStores.yoroiTransfer.transferFundsRequest.isExecuting,
              },
              nextInternalAddress: adaStores.yoroiTransfer.nextInternalAddress,
              recoveryPhrase: adaStores.yoroiTransfer.recoveryPhrase,
            },
          },
        },
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        ada: {
          yoroiTransfer: {
            backToUninitialized: { trigger: yoroiTransfer.backToUninitialized.trigger },
            cancelTransferFunds: { trigger: yoroiTransfer.cancelTransferFunds.trigger },
            startHardwareMnemnoic: { trigger: yoroiTransfer.startHardwareMnemnoic.trigger },
            transferFunds: { trigger: yoroiTransfer.transferFunds.trigger },
            checkAddresses: { trigger: yoroiTransfer.checkAddresses.trigger },
            setupTransferFundsWithPaperMnemonic: {
              trigger: yoroiTransfer.setupTransferFundsWithPaperMnemonic.trigger
            },
            setupTransferFundsWithMnemonic: {
              trigger: yoroiTransfer.setupTransferFundsWithMnemonic.trigger
            },
          },
        },
      },
      YoroiPlateProps: ({ actions, stores, }: InjectedOrGenerated<YoroiPlateData>),
    });
  }
}
