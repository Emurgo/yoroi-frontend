// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { computed, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import config from '../../../config';
import validWords from 'bip39/src/wordlists/english.json';
import WalletRestoreDialog from '../../../components/wallet/WalletRestoreDialog';
import WalletRestoreVerifyDialog from '../../../components/wallet/WalletRestoreVerifyDialog';
import TransferSummaryPage from '../../../components/transfer/TransferSummaryPage';
import LegacyExplanation from '../../../components/wallet/restore/LegacyExplanation';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import globalMessages from '../../../i18n/global-messages';
import { CheckAddressesInUseApiError, NoInputsError } from '../../../api/common/errors';
import type {
  RestoreModeType,
  PaperWalletRestoreMeta,
} from '../../../actions/common/wallet-restore-actions';
import { RestoreSteps } from '../../../stores/toplevel/WalletRestoreStore';
import { defineMessages, intlShape } from 'react-intl';
import YoroiTransferWaitingPage from '../../transfer/YoroiTransferWaitingPage';
import SuccessPage from '../../../components/transfer/SuccessPage';
import { TransferStatus } from '../../../types/TransferTypes';
import ErrorPage from '../../../components/transfer/ErrorPage';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ApiOptions, getApiForNetwork } from '../../../api/common/utils';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import type { RestoreStepsType, PlateWithMeta } from '../../../stores/toplevel/WalletRestoreStore';
import LocalizableError from '../../../i18n/LocalizableError';
import type { TransferStatusT, TransferTx } from '../../../types/TransferTypes';
import type { Notification } from '../../../types/notificationType';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { addressToDisplayString } from '../../../api/ada/lib/storage/bridge/utils';
import type { TokenInfoMap } from '../../../stores/toplevel/TokenInfoStore';
import { genLookupOrFail } from '../../../stores/stateless/tokenHelpers';
import WalletAlreadyExistDialog from '../../../components/wallet/WalletAlreadyExistDialog';
import type { PublicKeyCache } from '../../../stores/toplevel/WalletStore';
import { asGetPublicKey } from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import NavPlate from '../../../components/topbar/NavPlate';
import WalletDetails from '../../../components/wallet/my-wallets/WalletDetails';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { ROUTES } from '../../../routes-config';
import type { IGetPublic } from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { DelegationRequests } from '../../../stores/toplevel/DelegationStore';
import type { ConceptualWalletSettingsCache } from '../../../stores/toplevel/WalletSettingsStore';
import type { ConceptualWallet } from '../../../api/ada/lib/storage/models/ConceptualWallet';

const messages = defineMessages({
  walletUpgradeNoop: {
    id: 'wallet.restore.dialog.upgrade.noop',
    defaultMessage: '!!!Your wallet did not need to be upgraded',
  },
});

export type GeneratedData = typeof WalletRestoreDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
  +mode: RestoreModeType,
  +introMessage?: string,
  +onBack: void => void,
|};

@observer
export default class WalletRestoreDialogContainer extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  static defaultProps: {| introMessage: void |} = {
    introMessage: undefined,
  };

  @observable notificationElementId: string = '';

  getSelectedNetwork: void => $ReadOnly<NetworkRow> = () => {
    const { selectedNetwork } = this.generated.stores.profile;
    if (selectedNetwork === undefined) {
      throw new Error(`${nameof(WalletRestoreDialogContainer)} no API selected`);
    }
    return selectedNetwork;
  };

  componentDidMount() {
    const { walletRestore } = this.props.generated
      ? this.props.generated.actions
      : this.props.actions;
    walletRestore.reset.trigger();
    walletRestore.setMode.trigger(this.props.mode);
  }

  componentWillUnmount() {
    this.generated.actions.walletRestore.reset.trigger();
  }

  onCancel: void => void = () => {
    this.props.onClose();
    // Restore request should be reset only in case restore is finished/errored
    const { restoreRequest } = this.generated.stores.wallets;
    if (!restoreRequest.isExecuting) restoreRequest.reset();
  };

  updateHideBalance: void => Promise<void> = async () => {
    await this.generated.actions.profile.updateHideBalance.trigger();
  };

  getRewardBalance: (PublicDeriver<>) => null | void | MultiToken = publicDeriver => {
    const delegationRequest = this.generated.stores.delegation.getDelegationRequests(publicDeriver);
    if (delegationRequest == null) return undefined;

    const balanceResult = delegationRequest.getDelegatedBalance.result;
    if (balanceResult == null) {
      return null;
    }
    return balanceResult.accountPart;
  };

  openToTransactions: (PublicDeriver<>) => void = publicDeriver => {
    this.generated.actions.wallets.setActiveWallet.trigger({
      wallet: publicDeriver,
    });
    this.generated.actions.router.goToRoute.trigger({
      route: ROUTES.WALLETS.TRANSACTIONS,
    });
  };

  render(): null | Node {
    const walletRestoreActions = this.generated.actions.walletRestore;
    const actions = this.generated.actions;
    const { uiNotifications } = this.generated.stores;
    const { walletRestore } = this.generated.stores;
    const { wallets } = this.generated.stores;
    const { restoreRequest } = wallets;

    const mode = this.props.mode;
    const isPaper = mode.extra === 'paper';

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    switch (walletRestore.step) {
      case RestoreSteps.START: {
        if (!mode.length) {
          throw new Error(`${nameof(WalletRestoreDialogContainer)} no length in mode`);
        }
        const wordsCount = mode.length;
        return (
          <WalletRestoreDialog
            mnemonicValidator={mnemonic =>
              this.generated.stores.walletRestore.isValidMnemonic({ mnemonic, mode })
            }
            validWords={validWords}
            numberOfMnemonics={wordsCount}
            onSubmit={meta => actions.walletRestore.submitFields.trigger(meta)}
            onCancel={this.onCancel}
            onBack={this.props.onBack}
            error={restoreRequest.error}
            isPaper={isPaper}
            showPaperPassword={isPaper}
            classicTheme={this.generated.stores.profile.isClassicTheme}
            initValues={walletRestore.walletRestoreMeta}
            introMessage={this.props.introMessage || ''}
          />
        );
      }
      case RestoreSteps.WALLET_EXIST: {
        const publicDeriver = walletRestore.duplicatedWallet;
        if (!publicDeriver) {
          throw new Error(`${nameof(WalletRestoreDialogContainer)} no duplicated wallet`);
        }
        const parent = publicDeriver.getParent();
        const settingsCache = this.generated.stores.walletSettings.getConceptualWalletSettingsCache(
          parent
        );
        const withPubKey = asGetPublicKey(publicDeriver);
        const plate = withPubKey == null
          ? null
          : this.generated.stores.wallets.getPublicKeyCache(withPubKey).plate;
        const balance = this.generated.stores.transactions.getBalance(publicDeriver);

        return (
          <WalletAlreadyExistDialog
            walletPlate={<NavPlate plate={plate} wallet={settingsCache} />}
            walletSumDetails={
              <WalletDetails
                walletAmount={balance}
                rewards={this.getRewardBalance(publicDeriver)}
                onUpdateHideBalance={this.updateHideBalance}
                shouldHideBalance={this.generated.stores.profile.shouldHideBalance}
                getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
                isRefreshing={false}
              />
            }
            openWallet={() => {
              this.openToTransactions(publicDeriver);
            }}
            onCancel={walletRestoreActions.back.trigger}
          />
        );
      }
      case RestoreSteps.VERIFY_MNEMONIC: {
        // Refer: https://github.com/Emurgo/yoroi-frontend/pull/1055
        let error;
        /**
         * CheckAddressesInUseApiError happens when yoroi could not fetch Used Address.
         * Mostly because internet not connected or yoroi backend is down.
         * At this point wallet is already created in the storage.
         * When internet connection is back, everything will be loaded correctly.
         */
        if (restoreRequest.error instanceof CheckAddressesInUseApiError === false) {
          error = restoreRequest.error;
        }
        const isSubmitting =
          restoreRequest.isExecuting || restoreRequest.error instanceof CheckAddressesInUseApiError;
        return (
          <WalletRestoreVerifyDialog
            plates={walletRestore.recoveryResult?.plates ?? []}
            selectedExplorer={
              this.generated.stores.explorers.selectedExplorer.get(
                this.getSelectedNetwork().NetworkId
              ) ??
              (() => {
                throw new Error('No explorer for wallet network');
              })()
            }
            onNext={actions.walletRestore.verifyMnemonic.trigger}
            onCancel={walletRestoreActions.back.trigger}
            onCopyAddressTooltip={(address, elementId) => {
              if (!uiNotifications.isOpen(elementId)) {
                runInAction(() => {
                  this.notificationElementId = elementId;
                });
                actions.notifications.open.trigger({
                  id: elementId,
                  duration: tooltipNotification.duration,
                  message: tooltipNotification.message,
                });
              }
            }}
            notification={uiNotifications.getTooltipActiveNotification(this.notificationElementId)}
            isSubmitting={isSubmitting}
            error={error}
          />
        );
      }
      case RestoreSteps.LEGACY_EXPLANATION: {
        return (
          <LegacyExplanation
            onBack={walletRestoreActions.back.trigger}
            onClose={this.onCancel}
            onSkip={walletRestoreActions.startRestore.trigger}
            onCheck={walletRestoreActions.startCheck.trigger}
            classicTheme={this.generated.stores.profile.isClassicTheme}
            isSubmitting={restoreRequest.isExecuting}
          />
        );
      }
      case RestoreSteps.TRANSFER_TX_GEN: {
        return this._transferDialogContent();
      }
      default:
        return null;
    }
  }

  _transferDialogContent(): null | Node {
    const selectedAPI = getApiForNetwork(this.getSelectedNetwork());
    if (selectedAPI !== ApiOptions.ada) {
      throw new Error(`${nameof(this._transferDialogContent)} not set to ADA API`);
    }
    (selectedAPI: typeof ApiOptions.ada);
    const { yoroiTransfer } = this.generated.stores;
    const adaWalletRestoreActions = this.generated.actions[ApiOptions.ada].walletRestore;
    const walletRestoreActions = this.generated.actions.walletRestore;
    const { profile } = this.generated.stores;
    const { intl } = this.context;

    switch (yoroiTransfer.status) {
      // we have to verify briefly go through this step
      // and we don't want to throw an error for it
      case TransferStatus.DISPLAY_CHECKSUM:
        return null;
      case TransferStatus.RESTORING_ADDRESSES:
      case TransferStatus.CHECKING_ADDRESSES:
      case TransferStatus.GENERATING_TX:
        return <YoroiTransferWaitingPage status={yoroiTransfer.status} />;
      case TransferStatus.READY_TO_TRANSFER: {
        if (yoroiTransfer.transferTx == null) {
          return null; // TODO: throw error? Shouldn't happen
        }
        return (
          <TransferSummaryPage
            form={null}
            transferTx={yoroiTransfer.transferTx}
            selectedExplorer={
              this.generated.stores.explorers.selectedExplorer.get(
                this.getSelectedNetwork().NetworkId
              ) ??
              (() => {
                throw new Error('No explorer for wallet network');
              })()
            }
            getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
            onSubmit={{
              label: intl.formatMessage(globalMessages.nextButtonLabel),
              trigger: adaWalletRestoreActions.transferFromLegacy.trigger,
            }}
            isSubmitting={this.generated.stores.wallets.sendMoneyRequest.isExecuting}
            onCancel={{
              label: intl.formatMessage(globalMessages.cancel),
              trigger: this.onCancel,
            }}
            error={yoroiTransfer.error}
            addressLookup={
              /** no wallet is created yet so we can't know this information */
              () => undefined
            }
            dialogTitle={intl.formatMessage(globalMessages.walletUpgrade)}
            getCurrentPrice={this.generated.stores.coinPriceStore.getCurrentPrice}
            unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
            addressToDisplayString={addr => addressToDisplayString(addr, this.getSelectedNetwork())}
          />
        );
      }
      case TransferStatus.ERROR: {
        if (!(yoroiTransfer.error instanceof NoInputsError)) {
          return (
            <ErrorPage
              error={yoroiTransfer.error}
              onCancel={this.onCancel}
              title=""
              backButtonLabel={intl.formatMessage(globalMessages.cancel)}
              classicTheme={profile.isClassicTheme}
            />
          );
        }
        return (
          <SuccessPage
            title={intl.formatMessage(globalMessages.pdfGenDone)}
            text={intl.formatMessage(messages.walletUpgradeNoop)}
            classicTheme={profile.isClassicTheme}
            closeInfo={{
              closeLabel: intl.formatMessage(globalMessages.continue),
              onClose: walletRestoreActions.startRestore.trigger,
            }}
          />
        );
      }
      case TransferStatus.SUCCESS: {
        return null;
      }
      case TransferStatus.UNINITIALIZED: {
        return null;
      }
      default:
        throw new Error(
          `${nameof(WalletRestoreDialogContainer)} tx status ${yoroiTransfer.status}`
        );
    }
  }

  @computed get generated(): {|
    actions: {|
      profile: {|
        updateHideBalance: {|
          trigger: (params: void) => Promise<void>,
        |},
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string,
          |}) => void,
        |},
      |},
      walletRestore: {|
        back: {| trigger: (params: void) => void |},
        reset: {| trigger: (params: void) => void |},
        setMode: {|
          trigger: (params: RestoreModeType) => void,
        |},
        startCheck: {|
          trigger: (params: void) => Promise<void>,
        |},
        startRestore: {|
          trigger: (params: void) => Promise<void>,
        |},
        submitFields: {|
          trigger: (params: PaperWalletRestoreMeta) => Promise<void>,
        |},
        verifyMnemonic: {|
          trigger: (params: void) => Promise<void>,
        |},
      |},
      ada: {|
        walletRestore: {|
          transferFromLegacy: {|
            trigger: (params: void) => Promise<void>,
          |},
        |},
      |},
      notifications: {|
        open: {| trigger: (params: Notification) => void |},
      |},
      wallets: {|
        setActiveWallet: {|
          trigger: (params: {|
            wallet: PublicDeriver<>,
          |}) => void,
        |},
      |},
    |},
    stores: {|
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?string,
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        isClassicTheme: boolean,
        selectedNetwork: void | $ReadOnly<NetworkRow>,
        unitOfAccount: UnitOfAccountSettingType,
        shouldHideBalance: boolean,
      |},
      transactions: {|
        getBalance: (PublicDeriver<>) => MultiToken | null,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
      walletSettings: {|
        getConceptualWalletSettingsCache: ConceptualWallet => ConceptualWalletSettingsCache,
      |},
      delegation: {|
        getDelegationRequests: (PublicDeriver<>) => void | DelegationRequests,
      |},
      walletRestore: {|
        recoveryResult: void | {|
          plates: Array<PlateWithMeta>,
          phrase: string,
        |},
        step: RestoreStepsType,
        duplicatedWallet: null | void | PublicDeriver<>,
        walletRestoreMeta: void | PaperWalletRestoreMeta,
        isValidMnemonic: ({|
          mnemonic: string,
          mode: RestoreModeType,
        |}) => boolean,
      |},
      yoroiTransfer: {|
        error: ?LocalizableError,
        status: TransferStatusT,
        transferTx: ?TransferTx,
      |},
      uiNotifications: {|
        getTooltipActiveNotification: string => ?Notification,
        isOpen: string => boolean,
      |},
      wallets: {|
        sendMoneyRequest: {| isExecuting: boolean |},
        restoreRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          reset: () => void,
        |},
        getPublicKeyCache: IGetPublic => PublicKeyCache,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletRestoreDialogContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          selectedNetwork: stores.profile.selectedNetwork,
          isClassicTheme: stores.profile.isClassicTheme,
          unitOfAccount: stores.profile.unitOfAccount,
          shouldHideBalance: stores.profile.shouldHideBalance,
        },
        transactions: {
          getBalance: stores.transactions.getBalance,
        },
        uiNotifications: {
          isOpen: stores.uiNotifications.isOpen,
          getTooltipActiveNotification: stores.uiNotifications.getTooltipActiveNotification,
        },
        walletSettings: {
          getConceptualWalletSettingsCache: stores.walletSettings.getConceptualWalletSettingsCache,
        },
        delegation: {
          getDelegationRequests: stores.delegation.getDelegationRequests,
        },
        wallets: {
          restoreRequest: {
            isExecuting: stores.wallets.restoreRequest.isExecuting,
            error: stores.wallets.restoreRequest.error,
            reset: stores.wallets.restoreRequest.reset,
          },
          sendMoneyRequest: {
            isExecuting: stores.wallets.sendMoneyRequest.isExecuting,
          },
          getPublicKeyCache: stores.wallets.getPublicKeyCache,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        walletRestore: {
          step: stores.walletRestore.step,
          duplicatedWallet: stores.walletRestore.duplicatedWallet,
          recoveryResult: stores.walletRestore.recoveryResult,
          walletRestoreMeta: stores.walletRestore.walletRestoreMeta,
          isValidMnemonic: stores.walletRestore.isValidMnemonic,
        },
        yoroiTransfer: {
          status: stores.yoroiTransfer.status,
          error: stores.yoroiTransfer.error,
          transferTx: stores.yoroiTransfer.transferTx,
        },
      },
      actions: {
        notifications: {
          open: {
            trigger: actions.notifications.open.trigger,
          },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        wallets: {
          setActiveWallet: { trigger: actions.wallets.setActiveWallet.trigger },
        },
        profile: {
          updateHideBalance: { trigger: actions.profile.updateHideBalance.trigger },
        },
        walletRestore: {
          reset: {
            trigger: actions.walletRestore.reset.trigger,
          },
          setMode: {
            trigger: actions.walletRestore.setMode.trigger,
          },
          back: {
            trigger: actions.walletRestore.back.trigger,
          },
          verifyMnemonic: {
            trigger: actions.walletRestore.verifyMnemonic.trigger,
          },
          startRestore: {
            trigger: actions.walletRestore.startRestore.trigger,
          },
          startCheck: {
            trigger: actions.walletRestore.startCheck.trigger,
          },
          submitFields: {
            trigger: actions.walletRestore.submitFields.trigger,
          },
        },
        ada: {
          walletRestore: {
            transferFromLegacy: {
              trigger: actions.walletRestore.transferFromLegacy.trigger,
            },
          },
        },
      },
    });
  }
}
