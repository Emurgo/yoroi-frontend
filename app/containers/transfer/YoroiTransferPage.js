// @flow
import type { Node } from 'react';
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
import config from '../../config';
import { formattedWalletAmount } from '../../utils/formatters';
import { TransferStatus, } from '../../types/TransferTypes';
import type { TransferStatusT, TransferTx } from '../../types/TransferTypes';
import LocalizableError from '../../i18n/LocalizableError';
import { ROUTES } from '../../routes-config';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { GeneratedData as YoroiPlateData } from './YoroiPlatePage';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { RestoreMode } from '../../actions/common/wallet-restore-actions';
import { ApiOptions, getApiMeta, getApiForNetwork, } from '../../api/common/utils';

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
|};

@observer
export default class YoroiTransferPage extends Component<InjectedOrGenerated<GeneratedData>> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  goToCreateWallet: void => void = () => {
    this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
  }

  setupTransferFundsWithMnemonic: {|
    recoveryPhrase: string,
  |} => void = (payload) => {
    this.generated.actions.ada.yoroiTransfer.setupTransferFundsWithMnemonic.trigger({
      ...payload,
    });
  };

  setupTransferFundsWithPaperMnemonic: ((payload: {|
    paperPassword: string,
    recoveryPhrase: string,
  |}) => void) = (payload) => {
    this.generated.actions.ada.yoroiTransfer.setupTransferFundsWithPaperMnemonic.trigger({
      ...payload,
    });
  };

  checkAddresses: void => Promise<void> = async () => {
    const walletsStore = this.generated.stores.wallets;
    const yoroiTransfer = this.generated.stores.substores.ada.yoroiTransfer;
    const publicDeriver = walletsStore.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.checkAddresses)} no wallet selected`);
    }
    await this.generated.actions.ada.yoroiTransfer.checkAddresses.trigger({
      getDestinationAddress: yoroiTransfer.nextInternalAddress(publicDeriver),
    });
  };

  /** Broadcast the transfer transaction if one exists and return to wallet page */
  transferFunds: void => Promise<void> = async () => {
    // broadcast transfer transaction then call continuation
    const walletsStore = this.generated.stores.wallets;
    const yoroiTransfer = this.generated.stores.substores.ada.yoroiTransfer;
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.transferFunds)} no wallet selected`);
    }
    await this.generated.actions.ada.yoroiTransfer.transferFunds.trigger({
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
            if (walletsStore.selected != null) {
              this.generated.actions.router.goToRoute.trigger({
                route: ROUTES.WALLETS.ROOT
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

  backToUninitialized: (() => void) = () => {
    this.generated.actions.ada.yoroiTransfer.backToUninitialized.trigger();
  };

  cancelTransferFunds: (() => void) = () => {
    this.generated.actions.ada.yoroiTransfer.cancelTransferFunds.trigger();
  };


  render(): null | Node {
    const { stores } = this.generated;
    const { profile } = stores;
    const yoroiTransfer = this.generated.stores.substores.ada.yoroiTransfer;

    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.checkAddresses)} no wallet selected`);
    }
    const api = getApiForNetwork(publicDeriver.getParent().getNetworkInfo());
    if (api !== ApiOptions.ada) {
      throw new Error(`${nameof(YoroiTransferPage)} not ADA API type`);
    }
    const apiMeta = getApiMeta(api);
    if (apiMeta == null) throw new Error(`${nameof(YoroiTransferPage)} no API selected`);

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
            mnemonicValidator={mnemonic => this.generated.stores.walletRestore.isValidMnemonic({
              mnemonic,
              numberOfWords: config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT,
              mode: RestoreMode.REGULAR,
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
            mnemonicValidator={mnemonic => this.generated.stores.walletRestore.isValidMnemonic({
              mnemonic,
              numberOfWords: config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT,
              mode: RestoreMode.PAPER,
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
            onBack={() => this.generated.actions.ada.yoroiTransfer.cancelTransferFunds.trigger()}
            onNext={() => this.generated.actions.ada.yoroiTransfer.startHardwareMnemonic.trigger()}
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
            formattedWalletAmount={amount => formattedWalletAmount(
              amount,
              apiMeta.meta.decimalPlaces.toNumber(),
            )}
            transferTx={yoroiTransfer.transferTx}
            selectedExplorer={this.generated.stores.explorers.selectedExplorer
              .get(publicDeriver.getParent().getNetworkInfo().NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
            }
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

  @computed get generated(): {|
    YoroiPlateProps: InjectedOrGenerated<YoroiPlateData>,
    actions: {|
      ada: {|
        yoroiTransfer: {|
          backToUninitialized: {|
            trigger: (params: void) => void
          |},
          cancelTransferFunds: {|
            trigger: (params: void) => void
          |},
          checkAddresses: {|
            trigger: (params: {|
              getDestinationAddress: void => Promise<string>
            |}) => Promise<void>
          |},
          setupTransferFundsWithMnemonic: {|
            trigger: (params: {|
              recoveryPhrase: string
            |}) => void
          |},
          setupTransferFundsWithPaperMnemonic: {|
            trigger: (params: {|
              paperPassword: string,
              recoveryPhrase: string
            |}) => void
          |},
          startHardwareMnemonic: {|
            trigger: (params: void) => void
          |},
          transferFunds: {|
            trigger: (params: {|
              getDestinationAddress: void => Promise<string>,
              next: void => Promise<void>,
              rebuildTx: boolean
            |}) => Promise<void>
          |}
        |}
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string
          |}) => void
        |}
      |}
    |},
    stores: {|
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?number
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        isClassicTheme: boolean,
        unitOfAccount: UnitOfAccountSettingType
      |},
      substores: {|
        ada: {|
          yoroiTransfer: {|
            error: ?LocalizableError,
            nextInternalAddress: (
              PublicDeriver<>
            ) => void => Promise<string>,
            recoveryPhrase: string,
            status: TransferStatusT,
            transferFundsRequest: {| isExecuting: boolean |},
            transferTx: ?TransferTx
          |}
        |}
      |},
      walletRestore: {|
        isValidMnemonic: ({|
          mnemonic: string,
          numberOfWords: number,
          mode: $PropertyType<typeof RestoreMode, 'REGULAR'> | $PropertyType<typeof RestoreMode, 'PAPER'>,
        |}) => boolean,
      |},
      wallets: {|
        refreshWalletFromRemote: (
          PublicDeriver<>
        ) => Promise<void>,
        selected: null | PublicDeriver<>
      |}
    |}
    |} {
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
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        wallets: {
          selected: stores.wallets.selected,
          refreshWalletFromRemote: stores.wallets.refreshWalletFromRemote,
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        walletRestore: {
          isValidMnemonic: stores.walletRestore.isValidMnemonic,
        },
        substores: {
          ada: {
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
            startHardwareMnemonic: { trigger: yoroiTransfer.startHardwareMnemonic.trigger },
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
