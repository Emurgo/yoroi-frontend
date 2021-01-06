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
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { RestoreModeType } from '../../actions/common/wallet-restore-actions';
import { ROUTES } from '../../routes-config';
import { ApiOptions, getApiForNetwork } from '../../api/common/utils';
import { addressToDisplayString, } from '../../api/ada/lib/storage/bridge/utils';
import { genAddressLookup } from '../../stores/stateless/addressStores';
import type { IAddressTypeStore, IAddressTypeUiSubset } from '../../stores/stateless/addressStores';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';

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
    await this.generated.actions.daedalusTransfer.setupTransferFundsWithMnemonic.trigger({
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
    await this.generated.actions.daedalusTransfer.setupTransferFundsWithMasterKey.trigger({
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
    await this.generated.actions.daedalusTransfer.transferFunds.trigger({
      next: async () => {
        try {
          await walletsStore.refreshWalletFromRemote(publicDeriver);
        } catch (_e) {
          // still need to re-route even if refresh failed
        }
        if (walletsStore.selected != null) {
          this.generated.actions.router.goToRoute.trigger({
            route: ROUTES.WALLETS.ROOT
          });
        }
      },
      publicDeriver
    });
  }

  backToUninitialized: (() => void) = () => {
    this.generated.actions.daedalusTransfer.backToUninitialized.trigger();
  }

  cancelTransferFunds: (() => void) = () => {
    this.generated.actions.daedalusTransfer.cancelTransferFunds.trigger();
  }

  render(): null | Node {
    const { profile } = this.generated.stores;
    const daedalusTransfer = this.generated.stores.daedalusTransfer;
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.setupTransferFundsWithMnemonic)} no wallet selected`);
    }
    const api = getApiForNetwork(publicDeriver.getParent().getNetworkInfo());
    if (api !== ApiOptions.ada) {
      throw new Error(`${nameof(DaedalusTransferPage)} not ADA API type`);
    }

    switch (daedalusTransfer.status) {
      case TransferStatus.GETTING_MNEMONICS:
        return (
          <DaedalusTransferFormPage
            onSubmit={this.setupTransferFundsWithMnemonic}
            onBack={this.backToUninitialized}
            mnemonicValidator={mnemonic => this.generated.stores.walletRestore.isValidMnemonic({
              mnemonic,
              mode: { type: 'bip44', extra: undefined, length: config.wallets.DAEDALUS_RECOVERY_PHRASE_WORD_COUNT },
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
              mode: { type: 'bip44', extra: 'paper', length: config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT },
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
            transferTx={daedalusTransfer.transferTx}
            selectedExplorer={this.generated.stores.explorers.selectedExplorer
              .get(publicDeriver.getParent().getNetworkInfo().NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
            }
            onSubmit={{
              label: intl.formatMessage(globalMessages.nextButtonLabel),
              trigger: this.transferFunds,
            }}
            isSubmitting={daedalusTransfer.transferFundsRequest.isExecuting}
            onCancel={{
              label: intl.formatMessage(globalMessages.cancel),
              trigger: this.cancelTransferFunds
            }}
            error={daedalusTransfer.error}
            dialogTitle={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
            getCurrentPrice={this.generated.stores.coinPriceStore.getCurrentPrice}
            getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
            addressLookup={genAddressLookup(
              publicDeriver,
              intl,
              undefined, // don't want to go to route from within a dialog
              this.generated.stores.addresses.addressSubgroupMap,
            )}
            unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
            addressToDisplayString={
              addr => addressToDisplayString(addr, publicDeriver.getParent().getNetworkInfo())
            }
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
      addresses: {|
        addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
      |},
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?number
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        isClassicTheme: boolean,
        unitOfAccount: UnitOfAccountSettingType
      |},
      walletRestore: {|
        isValidMnemonic: ({|
          mnemonic: string,
          mode: RestoreModeType,
        |}) => boolean,
      |},
      daedalusTransfer: {|
        error: ?LocalizableError,
        status: TransferStatusT,
        transferFundsRequest: {| isExecuting: boolean |},
        transferTx: ?TransferTx
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
      throw new Error(`${nameof(DaedalusTransferPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        addresses: {
          addressSubgroupMap: stores.addresses.addressSubgroupMap,
        },
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        walletRestore: {
          isValidMnemonic: stores.walletRestore.isValidMnemonic,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
        wallets: {
          selected: stores.wallets.selected,
          refreshWalletFromRemote: stores.wallets.refreshWalletFromRemote,
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        daedalusTransfer: {
          status: stores.daedalusTransfer.status,
          error: stores.daedalusTransfer.error,
          transferTx: stores.daedalusTransfer.transferTx,
          transferFundsRequest: {
            isExecuting: stores.daedalusTransfer.transferFundsRequest.isExecuting,
          },
        }
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        daedalusTransfer: {
          backToUninitialized: { trigger: actions.daedalusTransfer.backToUninitialized.trigger },
          cancelTransferFunds: { trigger: actions.daedalusTransfer.cancelTransferFunds.trigger },
          transferFunds: { trigger: actions.daedalusTransfer.transferFunds.trigger },
          setupTransferFundsWithMasterKey: {
            trigger: actions.daedalusTransfer.setupTransferFundsWithMasterKey.trigger
          },
          setupTransferFundsWithMnemonic: {
            trigger: actions.daedalusTransfer.setupTransferFundsWithMnemonic.trigger
          },
        },
      },
    });
  }
}
