// @flow
import {
  validateMnemonic,
} from 'bip39';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, } from 'react-intl';
import validWords from 'bip39/src/wordlists/english.json';
import type { InjectedProps } from '../../types/injectedPropsType';
import TransferLayout from '../../components/transfer/TransferLayout';
import TransferSummaryPage from '../../components/transfer/TransferSummaryPage';
import HardwareDisclaimerPage from './HardwareDisclaimerPage';
import BorderedBox from '../../components/widgets/BorderedBox';
import YoroiTransferFormPage from './YoroiTransferFormPage';
import YoroiPaperWalletFormPage from './YoroiPaperWalletFormPage';
import HardwareTransferFormPage from './HardwareTransferFormPage';
import YoroiPlatePage from './YoroiPlatePage';
import YoroiTransferWaitingPage from './YoroiTransferWaitingPage';
import YoroiTransferErrorPage from './YoroiTransferErrorPage';
import YoroiTransferSuccessPage from './YoroiTransferSuccessPage';
import YoroiTransferStartPage from '../../components/transfer/YoroiTransferStartPage';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import config from '../../config';
import { formattedWalletAmount } from '../../utils/formatters';
import { TransferKind, TransferStatus, TransferSource, } from '../../types/TransferTypes';

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

  startLegacyTransferFunds: void => void = () => {
    this._getYoroiTransferActions().startTransferFunds.trigger({
      source: TransferSource.BYRON
    });
  }

  startShelleyTransferFunds: void => void = () => {
    this._getYoroiTransferActions().startTransferFunds.trigger({
      source: TransferSource.SHELLEY_UTXO
    });
  }

  startTransferPaperFunds: void => void = () => {
    this._getYoroiTransferActions().startTransferPaperFunds.trigger({
      source: TransferSource.BYRON
    });
  }

  startTransferLegacyTrezorFunds: void => void = () => {
    this._getYoroiTransferActions().startTransferLegacyHardwareFunds.trigger(TransferKind.TREZOR);
  }

  startTransferLegacyLedgerFunds: void => void = () => {
    this._getYoroiTransferActions().startTransferLegacyHardwareFunds.trigger(TransferKind.LEDGER);
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
      throw new Error(`${nameof(this.transferFunds)} no wallet elected`);
    }
    await this._getYoroiTransferActions().transferFunds.trigger({
      next: async () => {
        const preRefreshTime = new Date().getTime();
        try {
          await walletsStore.refreshWallet(publicDeriver);
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
    const { stores } = this.props;
    const { profile } = stores;
    const wallets = this._getWalletsStore();
    const yoroiTransfer = this._getYoroiTransferStore();

    switch (yoroiTransfer.status) {
      case TransferStatus.UNINITIALIZED:
        return (
          <TransferLayout>
            <YoroiTransferStartPage
              onLegacy15Words={this.startLegacyTransferFunds}
              onShelley15Words={this.startShelleyTransferFunds}
              onLegacyPaper={this.startTransferPaperFunds}
              onLegacyLedger={this.startTransferLegacyLedgerFunds}
              onLegacyTrezor={this.startTransferLegacyTrezorFunds}
              classicTheme={profile.isClassicTheme}
              onFollowInstructionsPrerequisites={this.goToCreateWallet}
              disableTransferFunds={yoroiTransfer.disableTransferFunds}
            />
          </TransferLayout>
        );
      case TransferStatus.GETTING_MNEMONICS:
        return (
          <TransferLayout>
            <YoroiTransferFormPage
              onSubmit={this.setupTransferFundsWithMnemonic}
              onBack={this.backToUninitialized}
              mnemonicValidator={mnemonic => wallets.isValidMnemonic({
                mnemonic,
                numberOfWords: config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT
              })}
              validWords={validWords}
              mnemonicLength={config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT}
              classicTheme={profile.isClassicTheme}
            />
          </TransferLayout>
        );
      case TransferStatus.GETTING_PAPER_MNEMONICS:
        return (
          <TransferLayout>
            <YoroiPaperWalletFormPage
              onSubmit={this.setupTransferFundsWithPaperMnemonic}
              onBack={this.backToUninitialized}
              mnemonicValidator={mnemonic => wallets.isValidPaperMnemonic({
                mnemonic,
                numberOfWords: config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT
              })}
              validWords={validWords}
              mnemonicLength={config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT}
              passwordMatches={_password => true}
              includeLengthCheck={false}
              classicTheme={profile.isClassicTheme}
            />
          </TransferLayout>
        );
      case TransferStatus.HARDWARE_DISCLAIMER:
        return (
          <TransferLayout>
            <HardwareDisclaimerPage
              actions={this.props.actions}
              stores={this.props.stores}
              onBack={() => this._getYoroiTransferActions().cancelTransferFunds.trigger()}
              onNext={() => this._getYoroiTransferActions().startHardwareMnemnoic.trigger()}
            />
          </TransferLayout>
        );
      case TransferStatus.GETTING_HARDWARE_MNEMONIC:
        return (
          <TransferLayout>
            <HardwareTransferFormPage
              onSubmit={this.setupTransferFundsWithMnemonic} // TODO: hw-specific
              onBack={this.backToUninitialized}
              // different hardware wallet support different lengths
              // so we just allow any lenght as long as the mnemonic is valid
              mnemonicValidator={mnemonic => validateMnemonic(mnemonic)}
              validWords={validWords}
              classicTheme={profile.isClassicTheme}
            />
          </TransferLayout>
        );
      case TransferStatus.DISPLAY_CHECKSUM:
        return (
          <TransferLayout>
            <YoroiPlatePage
              stores={this.props.stores}
              actions={this.props.actions}
              onNext={this.checkAddresses}
              onCancel={this.backToUninitialized}
              recoveryPhrase={yoroiTransfer.recoveryPhrase}
              selectedExplorer={this.props.stores.profile.selectedExplorer}
              classicTheme={profile.isClassicTheme}
            />
          </TransferLayout>
        );
      case TransferStatus.RESTORING_ADDRESSES:
      case TransferStatus.CHECKING_ADDRESSES:
      case TransferStatus.GENERATING_TX:
        return (
          <TransferLayout>
            <YoroiTransferWaitingPage status={yoroiTransfer.status} />
          </TransferLayout>
        );
      case TransferStatus.READY_TO_TRANSFER:
        if (yoroiTransfer.transferTx == null) {
          return null; // TODO: throw error? Shoudln't happen
        }
        return (
          <TransferLayout>
            <BorderedBox>
              <TransferSummaryPage
                form={null}
                formattedWalletAmount={formattedWalletAmount}
                selectedExplorer={this.props.stores.profile.selectedExplorer}
                transferTx={yoroiTransfer.transferTx}
                onSubmit={this.transferFunds}
                isSubmitting={yoroiTransfer.transferFundsRequest.isExecuting}
                onCancel={this.cancelTransferFunds}
                error={yoroiTransfer.error}
                classicTheme={profile.isClassicTheme}
              />
            </BorderedBox>
          </TransferLayout>
        );
      case TransferStatus.ERROR:
        return (
          <TransferLayout>
            <YoroiTransferErrorPage
              error={yoroiTransfer.error}
              onCancel={this.cancelTransferFunds}
              classicTheme={profile.isClassicTheme}
            />
          </TransferLayout>
        );
      case TransferStatus.SUCCESS:
        return (
          <TransferLayout>
            <YoroiTransferSuccessPage
              classicTheme={profile.isClassicTheme}
            />
          </TransferLayout>
        );
      default:
        throw new Error('YoroiTransferPage Unexpected state ' + yoroiTransfer.status);
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
