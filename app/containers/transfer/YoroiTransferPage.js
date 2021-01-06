// @flow
import type { Node } from 'react';
import {
  validateMnemonic,
} from 'bip39';
import { computed, } from 'mobx';
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
import YoroiTransferKeyFormPage from './YoroiTransferKeyFormPage';
import YoroiPlatePage from './YoroiPlatePage';
import YoroiTransferWaitingPage from './YoroiTransferWaitingPage';
import YoroiTransferErrorPage from './YoroiTransferErrorPage';
import YoroiTransferSuccessPage from './YoroiTransferSuccessPage';
import config from '../../config';
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
import type { RestoreModeType } from '../../actions/common/wallet-restore-actions';
import { ApiOptions, getApiForNetwork, } from '../../api/common/utils';
import { addressToDisplayString, } from '../../api/ada/lib/storage/bridge/utils';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
} from '../../config/numbersConfig';
import WithdrawalTxDialogContainer from './WithdrawalTxDialogContainer';
import type { GeneratedData as WithdrawalTxDialogContainerData } from './WithdrawalTxDialogContainer';
import { genAddressLookup } from '../../stores/stateless/addressStores';
import type { IAddressTypeStore, IAddressTypeUiSubset } from '../../stores/stateless/addressStores';
import type {
  Address, Addressing
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import {
  Bip44DerivationLevels,
} from '../../api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';

// Stay this long on the success page, then jump to the wallet transactions page
const SUCCESS_PAGE_STAY_TIME = 5 * 1000;

export type GeneratedData = typeof YoroiTransferPage.prototype.generated;

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
    this.generated.actions.yoroiTransfer.setupTransferFundsWithMnemonic.trigger({
      ...payload,
    });
  };

  setupTransferFundsWithPaperMnemonic: ((payload: {|
    paperPassword: string,
    recoveryPhrase: string,
  |}) => void) = (payload) => {
    this.generated.actions.yoroiTransfer.setupTransferFundsWithPaperMnemonic.trigger({
      ...payload,
    });
  };

  setupTransferFundsWithKey: {|
    key: string,
  |} => Promise<void> = async (payload) => {
    const walletsStore = this.generated.stores.wallets;
    const publicDeriver = walletsStore.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.setupTransferFundsWithKey)} no wallet selected`);
    }
    this.generated.actions.yoroiTransfer.setPrivateKey.trigger(payload.key);
    await this.checkAddresses();
  };

  checkAddresses: void => Promise<void> = async () => {
    const walletsStore = this.generated.stores.wallets;
    const yoroiTransfer = this.generated.stores.yoroiTransfer;
    const publicDeriver = walletsStore.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.checkAddresses)} no wallet selected`);
    }
    await this.generated.actions.yoroiTransfer.checkAddresses.trigger({
      getDestinationAddress: yoroiTransfer.nextInternalAddress(publicDeriver),
    });
  };

  /** Broadcast the transfer transaction if one exists and return to wallet page */
  transferFunds: void => Promise<void> = async () => {
    // broadcast transfer transaction then call continuation
    const walletsStore = this.generated.stores.wallets;
    const yoroiTransfer = this.generated.stores.yoroiTransfer;
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.transferFunds)} no wallet selected`);
    }
    await this.generated.actions.yoroiTransfer.transferFunds.trigger({
      network: publicDeriver.getParent().getNetworkInfo(),
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
    this.generated.actions.yoroiTransfer.backToUninitialized.trigger();
  };

  cancelTransferFunds: (() => void) = () => {
    this.generated.actions.yoroiTransfer.cancelTransferFunds.trigger();
  };


  render(): null | Node {
    const { stores } = this.generated;
    const { profile } = stores;
    const yoroiTransfer = this.generated.stores.yoroiTransfer;

    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.checkAddresses)} no wallet selected`);
    }
    const api = getApiForNetwork(publicDeriver.getParent().getNetworkInfo());
    if (api !== ApiOptions.ada) {
      throw new Error(`${nameof(YoroiTransferPage)} not ADA API type`);
    }

    switch (yoroiTransfer.status) {
      case TransferStatus.GETTING_MNEMONICS:
        return (
          <YoroiTransferFormPage
            onSubmit={this.setupTransferFundsWithMnemonic}
            onBack={this.backToUninitialized}
            mnemonicValidator={mnemonic => this.generated.stores.walletRestore.isValidMnemonic({
              mnemonic,
              mode: { type: 'bip44', extra: undefined, length: config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT },
            })}
            validWords={validWords}
            mnemonicLength={config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT}
            classicTheme={profile.isClassicTheme}
          />
        );
      case TransferStatus.GETTING_WITHDRAWAL_KEY:
        return (
          <YoroiTransferKeyFormPage
            onSubmit={this.setupTransferFundsWithKey}
            onBack={this.backToUninitialized}
            classicTheme={profile.isClassicTheme}
            derivationPath={[
              WalletTypePurpose.CIP1852,
              CoinTypes.CARDANO,
              // note: we hard-code account #0 because the ITN only supported account #0
              // which is the main time people would put in a full key with chaincode
              HARD_DERIVATION_START + 0,
              ChainDerivations.CHIMERIC_ACCOUNT,
              0
            ]}
          />
        );
      case TransferStatus.GETTING_PAPER_MNEMONICS:
        return (
          <YoroiPaperWalletFormPage
            onSubmit={this.setupTransferFundsWithPaperMnemonic}
            onBack={this.backToUninitialized}
            mnemonicValidator={mnemonic => this.generated.stores.walletRestore.isValidMnemonic({
              mnemonic,
              mode: { type: 'bip44', extra: 'paper', length: config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT },
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
            onBack={() => this.generated.actions.yoroiTransfer.cancelTransferFunds.trigger()}
            onNext={() => this.generated.actions.yoroiTransfer.startHardwareMnemonic.trigger()}
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
            accountIndex={this.generated.stores.walletRestore.selectedAccount}
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
        const { transferTx } = yoroiTransfer;
        const { intl } = this.context;
        if (this.generated.stores.yoroiTransfer.mode == null) {
          throw new Error(`${nameof(YoroiTransferPage)} unknown mode`);
        }
        const { mode } = this.generated.stores.yoroiTransfer;
        if (
          mode.chain === ChainDerivations.CHIMERIC_ACCOUNT ||
          mode.derivationLevel === Bip44DerivationLevels.ADDRESS.level
        ) {
          return (
            <WithdrawalTxDialogContainer
              {...this.generated.WithdrawalTxDialogContainerProps}
              onClose={this.cancelTransferFunds}
            />
          );
        }
        return (
          <TransferSummaryPage
            form={null}
            transferTx={transferTx}
            selectedExplorer={this.generated.stores.explorers.selectedExplorer
              .get(publicDeriver.getParent().getNetworkInfo().NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
            }
            getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
            onSubmit={{
              label: intl.formatMessage(globalMessages.nextButtonLabel),
              trigger: this.transferFunds,
            }}
            isSubmitting={stores.wallets.sendMoneyRequest.isExecuting}
            onCancel={{
              label: intl.formatMessage(globalMessages.cancel),
              trigger: this.cancelTransferFunds
            }}
            error={yoroiTransfer.error}
            dialogTitle={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
            getCurrentPrice={this.generated.stores.coinPriceStore.getCurrentPrice}
            addressLookup={genAddressLookup(
              publicDeriver,
              intl,
              undefined, // don't want to go to route from within a dialog
              this.generated.stores.addresses.addressSubgroupMap,
            )}
            unitOfAccountSetting={stores.profile.unitOfAccount}
            addressToDisplayString={
              addr => addressToDisplayString(addr, publicDeriver.getParent().getNetworkInfo())
            }
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
      yoroiTransfer: {|
        backToUninitialized: {|
          trigger: (params: void) => void
        |},
        cancelTransferFunds: {|
          trigger: (params: void) => void
        |},
        checkAddresses: {|
          trigger: (params: {|
            getDestinationAddress: void => Promise<{| ...Address, ...InexactSubset<Addressing> |}>
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
        setPrivateKey: {|
          trigger: string => void
        |},
        startHardwareMnemonic: {|
          trigger: (params: void) => void
        |},
        transferFunds: {|
          trigger: (params: {|
            getDestinationAddress: void => Promise<{| ...Address, ...InexactSubset<Addressing> |}>,
            network: $ReadOnly<NetworkRow>,
            next: void => Promise<void>,
            rebuildTx: boolean
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
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        isClassicTheme: boolean,
        unitOfAccount: UnitOfAccountSettingType
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
      yoroiTransfer: {|
        error: ?LocalizableError,
        nextInternalAddress: (
          PublicDeriver<>
        ) => void => Promise<{| ...Address, ...InexactSubset<Addressing> |}>,
        recoveryPhrase: string,
        status: TransferStatusT,
        transferTx: ?TransferTx,
        mode: void | RestoreModeType,
      |},
      walletRestore: {|
        selectedAccount: number,
        isValidMnemonic: ({|
          mnemonic: string,
          mode: RestoreModeType,
        |}) => boolean,
      |},
      wallets: {|
        sendMoneyRequest: {| isExecuting: boolean |},
        refreshWalletFromRemote: (
          PublicDeriver<>
        ) => Promise<void>,
        selected: null | PublicDeriver<>
      |}
    |},
    WithdrawalTxDialogContainerProps: InjectedOrGenerated<WithdrawalTxDialogContainerData>,
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(YoroiTransferPage)} no way to generated props`);
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
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
        wallets: {
          selected: stores.wallets.selected,
          refreshWalletFromRemote: stores.wallets.refreshWalletFromRemote,
          sendMoneyRequest: {
            isExecuting: stores.wallets.sendMoneyRequest.isExecuting,
          },
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        walletRestore: {
          selectedAccount: stores.walletRestore.selectedAccount,
          isValidMnemonic: stores.walletRestore.isValidMnemonic,
        },
        yoroiTransfer: {
          mode: stores.yoroiTransfer.mode,
          status: stores.yoroiTransfer.status,
          error: stores.yoroiTransfer.error,
          transferTx: stores.yoroiTransfer.transferTx,
          nextInternalAddress: stores.yoroiTransfer.nextInternalAddress,
          recoveryPhrase: stores.yoroiTransfer.recoveryPhrase,
        },
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        yoroiTransfer: {
          backToUninitialized: { trigger: actions.yoroiTransfer.backToUninitialized.trigger },
          cancelTransferFunds: { trigger: actions.yoroiTransfer.cancelTransferFunds.trigger },
          startHardwareMnemonic: { trigger: actions.yoroiTransfer.startHardwareMnemonic.trigger },
          setPrivateKey: { trigger: actions.yoroiTransfer.setPrivateKey.trigger },
          transferFunds: { trigger: actions.yoroiTransfer.transferFunds.trigger },
          checkAddresses: { trigger: actions.yoroiTransfer.checkAddresses.trigger },
          setupTransferFundsWithPaperMnemonic: {
            trigger: actions.yoroiTransfer.setupTransferFundsWithPaperMnemonic.trigger
          },
          setupTransferFundsWithMnemonic: {
            trigger: actions.yoroiTransfer.setupTransferFundsWithMnemonic.trigger
          },
        },
      },
      YoroiPlateProps: ({ actions, stores, }: InjectedOrGenerated<YoroiPlateData>),
      WithdrawalTxDialogContainerProps:
        ({ actions, stores, }: InjectedOrGenerated<WithdrawalTxDialogContainerData>),
    });
  }
}
