// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import config from '../../../config';
import validWords from 'bip39/src/wordlists/english.json';
import WalletRestoreDialog from '../../../components/wallet/WalletRestoreDialog';
import WalletRestoreVerifyDialog from '../../../components/wallet/WalletRestoreVerifyDialog';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';
import globalMessages from '../../../i18n/global-messages';
import { CheckAdressesInUseApiError } from '../../../api/ada/errors';
import type { RestoreModeType } from '../../../actions/ada/wallet-restore-actions';
import { RestoreMode } from '../../../actions/ada/wallet-restore-actions';
import { RestoreSteps } from '../../../stores/ada/WalletRestoreStore';

type Props = {|
  ...InjectedDialogContainerProps,
  +mode: RestoreModeType,
  +introMessage?: string,
  +onBack: void => void,
|};

type WalletRestoreDialogContainerState = {|
  notificationElementId: string,
|}

@observer
export default class WalletRestoreDialogContainer
  extends Component<Props, WalletRestoreDialogContainerState> {

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

  cancelVerification = () => {
    const { walletRestore } = this.props.actions[environment.API];
    walletRestore.back.trigger();
  };

  onCancel = () => {
    this.props.onClose();
    // Restore request should be reset only in case restore is finished/errored
    const { restoreRequest } = this._getWalletsStore();
    if (!restoreRequest.isExecuting) restoreRequest.reset();
  };

  render() {
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
            byronPlate={walletRestore.recoveryResult?.byronPlate}
            shelleyPlate={walletRestore.recoveryResult?.shelleyPlate}
            selectedExplorer={profile.selectedExplorer}
            onNext={() => actions[environment.API].walletRestore.startRestore.trigger()}
            onCancel={this.cancelVerification}
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
      default: return null;
    }
  }

  _getWalletsStore() {
    return this.props.stores.substores[environment.API].wallets;
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
