// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import config from '../../../config';
import validWords from 'bip39/src/wordlists/english.json';
import WalletRestoreDialog from '../../../components/wallet/WalletRestoreDialog';
import WalletRestoreVerifyDialog from '../../../components/wallet/WalletRestoreVerifyDialog';
import TransferSummaryPage from '../../../components/transfer/TransferSummaryPage';
import LegacyExplanation from '../../../components/wallet/restore/LegacyExplanation';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';
import globalMessages from '../../../i18n/global-messages';
import { CheckAdressesInUseApiError } from '../../../api/ada/errors';
import type { RestoreModeType } from '../../../actions/ada/wallet-restore-actions';
import { RestoreMode } from '../../../actions/ada/wallet-restore-actions';
import { RestoreSteps } from '../../../stores/ada/WalletRestoreStore';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../../components/widgets/Dialog';
import YoroiTransferWaitingPage from '../../transfer/YoroiTransferWaitingPage';
import SuccessPage from '../../../components/transfer/SuccessPage';
import { TransferStatus, } from '../../../types/TransferTypes';
import { formattedWalletAmount } from '../../../utils/formatters';

const messages = defineMessages({
  walletUpgradeNoop: {
    id: 'wallet.restore.dialog.upgrade.noop',
    defaultMessage: '!!!Your wallet did not need to be upgraded',
  },
});

type Props = {|
  ...InjectedDialogContainerProps,
  +mode: RestoreModeType,
    +introMessage ?: string,
    +onBack: void => void,
|};

type WalletRestoreDialogContainerState = {|
  notificationElementId: string,
|}

@observer
export default class WalletRestoreDialogContainer
  extends Component<Props, WalletRestoreDialogContainerState> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  static defaultProps = {
    introMessage: undefined
  };

  state = {
    notificationElementId: '',
  };

  constructor(props: Props) {
    super(props);
    const { walletRestore } = props.actions[environment.API];
    walletRestore.reset.trigger();
    walletRestore.setMode.trigger(props.mode);
  }

  componentWillUnmount() {
    const { walletRestore } = this.props.actions[environment.API];
    walletRestore.reset.trigger();
  }

  onCancel = () => {
    this.props.onClose();
    // Restore request should be reset only in case restore is finished/errored
    const { restoreRequest } = this._getWalletsStore();
    if (!restoreRequest.isExecuting) restoreRequest.reset();
  };

  render() {
    const { intl } = this.context;
    const walletRestoreActions = this.props.actions[environment.API].walletRestore;
    const actions = this.props.actions;
    const { uiNotifications, profile, } = this.props.stores;
    const { walletRestore, } = this.props.stores.substores[environment.API];
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
              return wallets.isValidPaperMnemonic({
                mnemonic,
                numberOfWords: wordsCount
              });
            }
            return wallets.isValidMnemonic({
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
          classicTheme={this.props.classicTheme}
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
            onNext={() => actions[environment.API].walletRestore.verifyMnemonic.trigger()}
            onCancel={() => walletRestoreActions.back.trigger()}
            onCopyAddressTooltip={(address, elementId) => {
              if (!uiNotifications.isOpen(elementId)) {
                this.setState({ notificationElementId: elementId });
                actions.notifications.open.trigger({
                  id: elementId,
                  duration: tooltipNotification.duration,
                  message: tooltipNotification.message,
                });
              }
            }}
            notification={uiNotifications.getTooltipActiveNotification(
              this.state.notificationElementId
            )}
            isSubmitting={isSubmitting}
            classicTheme={this.props.classicTheme}
            error={error}
          />
        );
      }
      case RestoreSteps.LEGACY_EXPLANATION: {
        return (
          <LegacyExplanation
            onBack={() => walletRestoreActions.back.trigger()}
            onClose={this.onCancel}
            onSkip={() => walletRestoreActions.startRestore.trigger()}
            onCheck={() => walletRestoreActions.startCheck.trigger()}
            classicTheme={this.props.classicTheme}
          />
        );
      }
      case RestoreSteps.TRANSFER_TX_GEN: {
        const { yoroiTransfer } = this.props.stores.substores[environment.API];
        const content = this._transferDialogContent();

        const completeButton = [
          {
            label: intl.formatMessage(globalMessages.continue),
            onClick: () => walletRestoreActions.startRestore.trigger(),
            primary: true,
          },
        ];
        return (
          <Dialog
            styleOveride={{ '--theme-modal-min-max-width-cmn': '680px' }}
            title={intl.formatMessage(globalMessages.walletUpgrade)}
            closeOnOverlayClick={false}
            classicTheme={profile.isClassicTheme}
            actions={yoroiTransfer.status === TransferStatus.ERROR
              ? completeButton
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

  _getWalletsStore() {
    return this.props.stores.substores[environment.API].wallets;
  }

  _transferDialogContent() {
    const { yoroiTransfer } = this.props.stores.substores[environment.API];
    const walletRestoreActions = this.props.actions[environment.API].walletRestore;
    const { profile, } = this.props.stores;
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
          return null; // TODO: throw error? Shoudln't happen
        }
        return (<TransferSummaryPage
          formattedWalletAmount={formattedWalletAmount}
          selectedExplorer={this.props.stores.profile.selectedExplorer}
          transferTx={yoroiTransfer.transferTx}
          onSubmit={() => walletRestoreActions.transferFromLegacy.trigger()}
          isSubmitting={yoroiTransfer.transferFundsRequest.isExecuting}
          onCancel={this.onCancel}
          error={yoroiTransfer.error}
          classicTheme={profile.isClassicTheme}
        />);
      }
      case TransferStatus.ERROR: {
        return (
          <SuccessPage
            title={intl.formatMessage(globalMessages.pdfGenDone)}
            text={intl.formatMessage(messages.walletUpgradeNoop)}
            classicTheme={profile.isClassicTheme}
          />
        );
      }
      default: throw new Error(`${nameof(WalletRestoreDialogContainer)} tx status ${yoroiTransfer.status}`);
    }
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
