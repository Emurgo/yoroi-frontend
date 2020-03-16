// @flow
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
import environment from '../../../environment';
import globalMessages from '../../../i18n/global-messages';
import {
  CheckAdressesInUseApiError,
  NoInputsError,
} from '../../../api/ada/errors';
import ErrorBlock from '../../../components/widgets/ErrorBlock';
import type { RestoreModeType } from '../../../actions/ada/wallet-restore-actions';
import { RestoreMode } from '../../../actions/ada/wallet-restore-actions';
import { RestoreSteps } from '../../../stores/ada/WalletRestoreStore';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../../components/widgets/Dialog';
import YoroiTransferWaitingPage from '../../transfer/YoroiTransferWaitingPage';
import SuccessPage from '../../../components/transfer/SuccessPage';
import { TransferStatus, } from '../../../types/TransferTypes';
import { formattedWalletAmount } from '../../../utils/formatters';
import InvalidURIImg from '../../../assets/images/uri/invalid-uri.inline.svg';

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

  static contextTypes = {
    intl: intlShape.isRequired
  };

  static defaultProps = {
    introMessage: undefined
  };

  @observable notificationElementId: string = '';

  componentDidMount() {
    const { walletRestore } = this.props.generated
      ? this.props.generated.actions[environment.API]
      : this.props.actions[environment.API];
    walletRestore.reset.trigger();
    walletRestore.setMode.trigger(this.props.mode);
  }

  componentWillUnmount() {
    const { walletRestore } = this.generated.actions[environment.API];
    walletRestore.reset.trigger();
  }

  onCancel: void => void = () => {
    this.props.onClose();
    // Restore request should be reset only in case restore is finished/errored
    const { restoreRequest } = this._getWalletsStore();
    if (!restoreRequest.isExecuting) restoreRequest.reset();
  };

  render() {
    const { intl } = this.context;
    const walletRestoreActions = this.generated.actions[environment.API].walletRestore;
    const actions = this.generated.actions;
    const { uiNotifications, profile, } = this.generated.stores;
    const { walletRestore, } = this.generated.stores.substores[environment.API];
    const wallets = this._getWalletsStore();
    const { restoreRequest } = wallets;

    const isPaper = isPaperMode(this.props.mode);
    const wordsCount = getWordsCount(this.props.mode);

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    switch (walletRestore.step) {
      case RestoreSteps.START: {
        return (<WalletRestoreDialog
          mnemonicValidator={mnemonic => {
            if (isPaper) {
              return this._getAdaWalletsStore().isValidPaperMnemonic({
                mnemonic,
                numberOfWords: wordsCount
              });
            }
            return this._getAdaWalletsStore().isValidMnemonic({
              mnemonic,
              numberOfWords: wordsCount
            });
          }}
          validWords={validWords}
          numberOfMnemonics={wordsCount}
          onSubmit={meta => actions[environment.API].walletRestore.submitFields.trigger(meta)}
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
         * CheckAdressesInUseApiError happens when yoroi could not fetch Used Address.
         * Mostly because internet not connected or yoroi backend is down.
         * At this point wallet is already created in the storage.
         * When internet connection is back, everything will be loaded correctly.
         */
        if (restoreRequest.error instanceof CheckAdressesInUseApiError === false) {
          error = restoreRequest.error;
        }
        const isSubmitting = restoreRequest.isExecuting ||
          (restoreRequest.error instanceof CheckAdressesInUseApiError);
        return (
          <WalletRestoreVerifyDialog
            byronPlate={walletRestore.recoveryResult ?.byronPlate}
            shelleyPlate={walletRestore.recoveryResult ?.shelleyPlate}
            selectedExplorer={profile.selectedExplorer}
            onNext={actions[environment.API].walletRestore.verifyMnemonic.trigger}
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
        const { yoroiTransfer } = this.generated.stores.substores[environment.API];
        const content = this._transferDialogContent();

        const getDoneButton = () => {
          if (!(yoroiTransfer.error instanceof NoInputsError)) {
            return [{
              label: intl.formatMessage(globalMessages.cancel),
              onClick: this.onCancel,
              primary: true,
            }];
          }
          return [{
            label: intl.formatMessage(globalMessages.continue),
            onClick: walletRestoreActions.startRestore.trigger,
            primary: true,
            isSubmitting: restoreRequest.isExecuting,
          }];
        };
        return (
          <Dialog
            styleOveride={{ '--theme-modal-min-max-width-cmn': '680px' }}
            title={intl.formatMessage(globalMessages.walletUpgrade)}
            closeOnOverlayClick={false}
            actions={yoroiTransfer.status === TransferStatus.ERROR
              ? getDoneButton()
              : undefined
            }
          >
            {content}
          </Dialog>
        );
      }
      default: return null;
    }
  }

  _getAdaWalletsStore() {
    return this.generated.stores.substores[environment.API].wallets;
  }
  _getWalletsStore() {
    return this.generated.stores.wallets;
  }

  _transferDialogContent() {
    const { yoroiTransfer } = this.generated.stores.substores[environment.API];
    const walletRestoreActions = this.generated.actions[environment.API].walletRestore;
    const { profile, } = this.generated.stores;
    const { intl } = this.context;
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
          formattedWalletAmount={formattedWalletAmount}
          selectedExplorer={this.generated.stores.profile.selectedExplorer}
          transferTx={yoroiTransfer.transferTx}
          onSubmit={walletRestoreActions.transferFromLegacy.trigger}
          isSubmitting={yoroiTransfer.transferFundsRequest.isExecuting}
          onCancel={this.onCancel}
          error={yoroiTransfer.error}
        />);
      }
      case TransferStatus.ERROR: {
        if (!(yoroiTransfer.error instanceof NoInputsError)) {
          return (
            <>
              <center><InvalidURIImg /></center>
              <ErrorBlock
                error={yoroiTransfer.error}
              />
            </>
          );
        }
        return (
          <SuccessPage
            title={intl.formatMessage(globalMessages.pdfGenDone)}
            text={intl.formatMessage(messages.walletUpgradeNoop)}
            classicTheme={profile.isClassicTheme}
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

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletRestoreDialogContainer)} no way to generated props`);
    }
    const { stores, actions, } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          selectedExplorer: stores.profile.selectedExplorer,
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
        },
        substores: {
          ada: {
            yoroiTransfer: {
              status: stores.substores.ada.yoroiTransfer.status,
              error: stores.substores.ada.yoroiTransfer.error,
              transferTx: stores.substores.ada.yoroiTransfer.transferTx,
              transferFundsRequest: {
                isExecuting: stores.substores.ada.yoroiTransfer.transferFundsRequest.isExecuting,
              },
            },
            walletRestore: {
              step: stores.substores.ada.walletRestore.step,
              recoveryResult: stores.substores.ada.walletRestore.recoveryResult,
              walletRestoreMeta: stores.substores.ada.walletRestore.walletRestoreMeta,
            },
            wallets: {
              isValidPaperMnemonic: stores.substores.ada.wallets.isValidPaperMnemonic,
              isValidMnemonic: stores.substores.ada.wallets.isValidMnemonic,
            },
          },
        },
      },
      actions: {
        notifications: {
          open: {
            trigger: actions.notifications.open.trigger,
          },
        },
        ada: {
          walletRestore: {
            reset: {
              trigger: actions.ada.walletRestore.reset.trigger,
            },
            setMode: {
              trigger: actions.ada.walletRestore.setMode.trigger,
            },
            back: {
              trigger: actions.ada.walletRestore.back.trigger,
            },
            verifyMnemonic: {
              trigger: actions.ada.walletRestore.verifyMnemonic.trigger,
            },
            startRestore: {
              trigger: actions.ada.walletRestore.startRestore.trigger,
            },
            startCheck: {
              trigger: actions.ada.walletRestore.startCheck.trigger,
            },
            transferFromLegacy: {
              trigger: actions.ada.walletRestore.transferFromLegacy.trigger,
            },
            submitFields: {
              trigger: actions.ada.walletRestore.submitFields.trigger,
            },
          },
        },
      },
    });
  }
}

function isPaperMode(mode: RestoreModeType): boolean {
  return mode === RestoreMode.PAPER;
}

function getWordsCount(mode: RestoreModeType): number {
  return mode === RestoreMode.PAPER
    ? config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT
    : config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT;
}
