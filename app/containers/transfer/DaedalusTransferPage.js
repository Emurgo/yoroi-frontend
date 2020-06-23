// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import validWords from 'bip39/src/wordlists/english.json';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import TransferSummaryPage from '../../components/transfer/TransferSummaryPage';
import DaedalusTransferFormPage from './DaedalusTransferFormPage';
import DaedalusTransferMasterKeyFormPage from './DaedalusTransferMasterKeyFormPage';
import DaedalusTransferWaitingPage from './DaedalusTransferWaitingPage';
import DaedalusTransferErrorPage from './DaedalusTransferErrorPage';
import config from '../../config';
import { TransferStatus, } from '../../types/TransferTypes';
import type { TransferStatusT, TransferTx } from '../../types/TransferTypes';
import LocalizableError from '../../i18n/LocalizableError';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { ExplorerType } from '../../domain/Explorer';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { RestoreMode } from '../../actions/common/wallet-restore-actions';
import { formattedWalletAmount } from '../../utils/formatters';
import { ROUTES } from '../../routes-config';
import { ApiOptions, getApiMeta } from '../../api/common/utils';

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

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  goToCreateWallet: void => void = () => {
    this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
  }

  setupTransferFundsWithMnemonic: {|
    recoveryPhrase: string,
  |} => Promise<void> = async (payload) => {
    const walletsStore = this.generated.stores.wallets;
    const publicDeriver = walletsStore.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.setupTransferFundsWithMnemonic)} no wallet selected`);
    }
    await this.generated.actions.ada.daedalusTransfer.setupTransferFundsWithMnemonic.trigger({
      ...payload,
      publicDeriver
    });
  };

  setupTransferFundsWithMasterKey: {|
    masterKey: string,
  |} => Promise<void> = async (payload) => {
    const walletsStore = this.generated.stores.wallets;
    const publicDeriver = walletsStore.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.setupTransferFundsWithMasterKey)} no wallet selected`);
    }
    await this.generated.actions.ada.daedalusTransfer.setupTransferFundsWithMasterKey.trigger({
      ...payload,
      publicDeriver
    });
  };

  /** Broadcast the transfer transaction if one exists and return to wallet page */
  transferFunds: void => Promise<void> = async () => {
    const walletsStore = this.generated.stores.wallets;
    const publicDeriver = walletsStore.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.transferFunds)} no wallet selected`);
    }
    // broadcast transfer transaction then call continuation
    await this.generated.actions.ada.daedalusTransfer.transferFunds.trigger({
      next: async () => {
        try {
          await walletsStore.refreshWalletFromRemote(publicDeriver);
        } catch (_e) {
          // still need to re-route even if refresh failed
        }
        if (walletsStore.activeWalletRoute != null) {
          const newRoute = walletsStore.activeWalletRoute;
          this.generated.actions.router.goToRoute.trigger({
            route: newRoute
          });
        }
      },
      publicDeriver
    });
  }

  backToUninitialized: (() => void) = () => {
    this.generated.actions.ada.daedalusTransfer.backToUninitialized.trigger();
  }

  cancelTransferFunds: (() => void) = () => {
    this.generated.actions.ada.daedalusTransfer.cancelTransferFunds.trigger();
  }

  render(): null | Node {
    const { profile } = this.generated.stores;
    const daedalusTransfer = this.generated.stores.substores.ada.daedalusTransfer;
    const apiMeta = getApiMeta(ApiOptions.ada);
    if (apiMeta == null) throw new Error(`${nameof(DaedalusTransferPage)} no API selected`);

    const coinPrice: ?number = this.generated.stores.profile.unitOfAccount.enabled
      ? (
        this.generated.stores.coinPriceStore
          .getCurrentPrice(
            apiMeta.meta.primaryTicker,
            this.generated.stores.profile.unitOfAccount.currency
          )
      )
      : null;

    switch (daedalusTransfer.status) {
      case TransferStatus.GETTING_MNEMONICS:
        return (
          <DaedalusTransferFormPage
            onSubmit={this.setupTransferFundsWithMnemonic}
            onBack={this.backToUninitialized}
            mnemonicValidator={mnemonic => this.generated.stores.walletRestore.isValidMnemonic({
              mnemonic,
              numberOfWords: config.wallets.DAEDALUS_RECOVERY_PHRASE_WORD_COUNT,
              mode: RestoreMode.REGULAR,
            })}
            validWords={validWords}
            mnemonicLength={config.wallets.DAEDALUS_RECOVERY_PHRASE_WORD_COUNT}
            classicTheme={profile.isClassicTheme}
          />
        );
      case TransferStatus.GETTING_PAPER_MNEMONICS:
        return (
          <DaedalusTransferFormPage
            onSubmit={this.setupTransferFundsWithMnemonic}
            onBack={this.backToUninitialized}
            mnemonicValidator={mnemonic => this.generated.stores.walletRestore.isValidMnemonic({
              mnemonic,
              numberOfWords: config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT,
              mode: RestoreMode.PAPER,
            })}
            validWords={validWords}
            mnemonicLength={config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT}
            classicTheme={profile.isClassicTheme}
          />
        );
      case TransferStatus.GETTING_MASTER_KEY:
        return (
          <DaedalusTransferMasterKeyFormPage
            onSubmit={this.setupTransferFundsWithMasterKey}
            onBack={this.backToUninitialized}
            classicTheme={profile.isClassicTheme}
          />
        );
      case TransferStatus.RESTORING_ADDRESSES:
      case TransferStatus.CHECKING_ADDRESSES:
      case TransferStatus.GENERATING_TX:
        return (
          <DaedalusTransferWaitingPage status={daedalusTransfer.status} />
        );
      case TransferStatus.READY_TO_TRANSFER: {
        if (daedalusTransfer.transferTx == null) {
          return null; // TODO: throw error? Shouldn't happen
        }
        const { intl } = this.context;
        return (
          <TransferSummaryPage
            form={null}
            formattedWalletAmount={amount => formattedWalletAmount(
              amount,
              apiMeta.meta.decimalPlaces.toNumber()
            )}
            selectedExplorer={this.generated.stores.profile.selectedExplorer}
            transferTx={daedalusTransfer.transferTx}
            onSubmit={this.transferFunds}
            isSubmitting={daedalusTransfer.transferFundsRequest.isExecuting}
            onCancel={this.cancelTransferFunds}
            error={daedalusTransfer.error}
            dialogTitle={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
            coinPrice={coinPrice}
            unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
          />
        );
      }
      case TransferStatus.ERROR:
        return (
          <DaedalusTransferErrorPage
            error={daedalusTransfer.error}
            onCancel={this.cancelTransferFunds}
            classicTheme={profile.isClassicTheme}
          />
        );
      default:
        return null;
    }
  }


  @computed get generated(): {|
    actions: {|
      ada: {|
        daedalusTransfer: {|
          backToUninitialized: {|
            trigger: (params: void) => void
          |},
          cancelTransferFunds: {|
            trigger: (params: void) => void
          |},
          setupTransferFundsWithMasterKey: {|
            trigger: (params: {|
              masterKey: string,
              publicDeriver: PublicDeriver<>
            |}) => Promise<void>
          |},
          setupTransferFundsWithMnemonic: {|
            trigger: (params: {|
              publicDeriver: PublicDeriver<>,
              recoveryPhrase: string
            |}) => Promise<void>
          |},
          transferFunds: {|
            trigger: (params: {|
              next: () => Promise<void>,
              publicDeriver: PublicDeriver<>
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
      profile: {|
        isClassicTheme: boolean,
        selectedExplorer: ExplorerType,
        unitOfAccount: UnitOfAccountSettingType
      |},
      walletRestore: {|
        isValidMnemonic: ({|
          mnemonic: string,
          numberOfWords: number,
          mode: $PropertyType<typeof RestoreMode, 'REGULAR'> | $PropertyType<typeof RestoreMode, 'PAPER'>,
        |}) => boolean,
      |},
      substores: {|
        ada: {|
          daedalusTransfer: {|
            error: ?LocalizableError,
            status: TransferStatusT,
            transferFundsRequest: {| isExecuting: boolean |},
            transferTx: ?TransferTx
          |},
        |}
      |},
      wallets: {|
        activeWalletRoute: ?string,
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
          unitOfAccount: stores.profile.unitOfAccount,
        },
        walletRestore: {
          isValidMnemonic: stores.walletRestore.isValidMnemonic,
        },
        wallets: {
          selected: stores.wallets.selected,
          activeWalletRoute: stores.wallets.activeWalletRoute,
          refreshWalletFromRemote: stores.wallets.refreshWalletFromRemote,
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        substores: {
          ada: {
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
