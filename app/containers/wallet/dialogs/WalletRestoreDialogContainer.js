// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
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
import {
  CheckAddressesInUseApiError,
  NoInputsError,
} from '../../../api/common/errors';
import type { RestoreModeType, WalletRestoreMeta } from '../../../actions/common/wallet-restore-actions';
import { RestoreSteps } from '../../../stores/toplevel/WalletRestoreStore';
import { defineMessages, intlShape } from 'react-intl';
import YoroiTransferWaitingPage from '../../transfer/YoroiTransferWaitingPage';
import SuccessPage from '../../../components/transfer/SuccessPage';
import { TransferStatus, } from '../../../types/TransferTypes';
import { formattedWalletAmount } from '../../../utils/formatters';
import ErrorPage from '../../../components/transfer/ErrorPage';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ApiOptions, getApiForNetwork, getApiMeta } from '../../../api/common/utils';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import type { RestoreStepsType, PlateWithMeta } from '../../../stores/toplevel/WalletRestoreStore';
import LocalizableError from '../../../i18n/LocalizableError';
import type { TransferStatusT, TransferTx } from '../../../types/TransferTypes';
import type { Notification } from '../../../types/notificationType';
import type {
  NetworkRow,
} from '../../../api/ada/lib/storage/database/primitives/tables';
import { isJormungandr } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { addressToDisplayString, } from '../../../api/ada/lib/storage/bridge/utils';

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
  +introMessage ?: string,
  +onBack: void => void,
|};

@observer
export default class WalletRestoreDialogContainer extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  static defaultProps: {|introMessage: void|} = {
    introMessage: undefined
  };

  @observable notificationElementId: string = '';

  getSelectedNetwork: void => $ReadOnly<NetworkRow> = () => {
    const { selectedNetwork } = this.generated.stores.profile;
    if (selectedNetwork === undefined) {
      throw new Error(`${nameof(WalletRestoreDialogContainer)} no API selected`);
    }
    return selectedNetwork;
  }

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

  render(): null | Node {
    const walletRestoreActions = this.generated.actions.walletRestore;
    const actions = this.generated.actions;
    const { uiNotifications, } = this.generated.stores;
    const { walletRestore, } = this.generated.stores;
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
        return (<WalletRestoreDialog
          mnemonicValidator={mnemonic => (
            this.generated.stores.walletRestore.isValidMnemonic({
              mnemonic,
              mode,
            })
          )}
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
        />);
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
        const isSubmitting = restoreRequest.isExecuting ||
          (restoreRequest.error instanceof CheckAddressesInUseApiError);
        return (
          <WalletRestoreVerifyDialog
            plates={walletRestore.recoveryResult?.plates ?? []}
            selectedExplorer={this.generated.stores.explorers.selectedExplorer
              .get(this.getSelectedNetwork().NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
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
            notification={uiNotifications.getTooltipActiveNotification(
              this.notificationElementId
            )}
            isSubmitting={!isJormungandr(this.getSelectedNetwork()) && isSubmitting}
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
      default: return null;
    }
  }

  _transferDialogContent(): null | Node {
    const selectedAPI = getApiForNetwork(this.getSelectedNetwork());
    if (selectedAPI !== ApiOptions.ada) {
      throw new Error(`${nameof(this._transferDialogContent)} not set to ADA API`);
    }
    (selectedAPI: typeof ApiOptions.ada);
    const apiMeta = getApiMeta(selectedAPI);
    if (apiMeta == null) throw new Error(`${nameof(this._transferDialogContent)} no API selected`);
    const { yoroiTransfer } = this.generated.stores;
    const adaWalletRestoreActions = this.generated.actions[ApiOptions.ada].walletRestore;
    const walletRestoreActions = this.generated.actions.walletRestore;
    const { profile, } = this.generated.stores;
    const { intl } = this.context;

    const coinPrice: ?number = this.generated.stores.profile.unitOfAccount.enabled
      ? (
        this.generated.stores.coinPriceStore.getCurrentPrice(
          apiMeta.meta.primaryTicker,
          this.generated.stores.profile.unitOfAccount.currency
        )
      )
      : null;

    switch (yoroiTransfer.status) {
      // we have to verify briefly go through this step
      // and we don't want to throw an error for it
      case TransferStatus.DISPLAY_CHECKSUM: return null;
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
        return (<TransferSummaryPage
          form={null}
          formattedWalletAmount={amount => formattedWalletAmount(
            amount,
            apiMeta.meta.decimalPlaces.toNumber()
          )}
          transferTx={yoroiTransfer.transferTx}
          selectedExplorer={this.generated.stores.explorers.selectedExplorer
            .get(this.getSelectedNetwork().NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
          }
          onSubmit={{
            label: intl.formatMessage(globalMessages.nextButtonLabel),
            trigger: adaWalletRestoreActions.transferFromLegacy.trigger,
          }}
          isSubmitting={this.generated.stores.wallets.sendMoneyRequest.isExecuting}
          onCancel={{
            label: intl.formatMessage(globalMessages.cancel),
            trigger: this.onCancel
          }}
          error={yoroiTransfer.error}
          addressLookup={
            /** no wallet is created yet so we can't know this information */
            () => undefined
          }
          dialogTitle={intl.formatMessage(globalMessages.walletUpgrade)}
          coinPrice={coinPrice}
          unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
          addressToDisplayString={
            addr => addressToDisplayString(addr, this.getSelectedNetwork())
          }
          ticker={apiMeta.meta.primaryTicker}
        />);
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
      default: throw new Error(`${nameof(WalletRestoreDialogContainer)} tx status ${yoroiTransfer.status}`);
    }
  }

  @computed get generated(): {|
    actions: {|
      walletRestore: {|
        back: {| trigger: (params: void) => void |},
        reset: {| trigger: (params: void) => void |},
        setMode: {|
          trigger: (params: RestoreModeType) => void
        |},
        startCheck: {|
          trigger: (params: void) => Promise<void>
        |},
        startRestore: {|
          trigger: (params: void) => Promise<void>
        |},
        submitFields: {|
          trigger: (params: WalletRestoreMeta) => void
        |},
        verifyMnemonic: {|
          trigger: (params: void) => Promise<void>
        |}
      |},
      ada: {|
        walletRestore: {|
          transferFromLegacy: {|
            trigger: (params: void) => Promise<void>
          |},
        |}
      |},
      notifications: {|
        open: {| trigger: (params: Notification) => void |}
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
        selectedNetwork: void | $ReadOnly<NetworkRow>,
        unitOfAccount: UnitOfAccountSettingType
      |},
      walletRestore: {|
        recoveryResult: void | {|
          plates: Array<PlateWithMeta>,
          phrase: string,
        |},
        step: RestoreStepsType,
        walletRestoreMeta: void | WalletRestoreMeta,
        isValidMnemonic: ({|
          mnemonic: string,
          mode: RestoreModeType,
        |}) => boolean,
      |},
      yoroiTransfer: {|
        error: ?LocalizableError,
        status: TransferStatusT,
        transferTx: ?TransferTx
      |},
      uiNotifications: {|
        getTooltipActiveNotification: string => ?Notification,
        isOpen: string => boolean
      |},
      wallets: {|
        sendMoneyRequest: {| isExecuting: boolean |},
        restoreRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          reset: () => void
        |},
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletRestoreDialogContainer)} no way to generated props`);
    }
    const { stores, actions, } = this.props;
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          selectedNetwork: stores.profile.selectedNetwork,
          isClassicTheme: stores.profile.isClassicTheme,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        uiNotifications: {
          isOpen: stores.uiNotifications.isOpen,
          getTooltipActiveNotification: stores.uiNotifications.getTooltipActiveNotification,
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
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        walletRestore: {
          step: stores.walletRestore.step,
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
