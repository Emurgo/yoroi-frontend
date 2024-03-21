// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import config from '../../../config';
import validWords from 'bip39/src/wordlists/english.json';
import WalletRestoreDialog from '../../../components/wallet/WalletRestoreDialog';
import WalletRestoreVerifyDialog from '../../../components/wallet/WalletRestoreVerifyDialog';
import TransferSummaryPage from '../../../components/transfer/TransferSummaryPage';
import LegacyExplanation from '../../../components/wallet/restore/LegacyExplanation';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import globalMessages from '../../../i18n/global-messages';
import { CheckAddressesInUseApiError, NoInputsError } from '../../../api/common/errors';
import type { RestoreModeType, } from '../../../actions/common/wallet-restore-actions';
import { RestoreSteps } from '../../../stores/toplevel/WalletRestoreStore';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import YoroiTransferWaitingPage from '../../transfer/YoroiTransferWaitingPage';
import SuccessPage from '../../../components/transfer/SuccessPage';
import { TransferStatus } from '../../../types/TransferTypes';
import ErrorPage from '../../../components/transfer/ErrorPage';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { addressToDisplayString } from '../../../api/ada/lib/storage/bridge/utils';
import { genLookupOrFail } from '../../../stores/stateless/tokenHelpers';
import WalletAlreadyExistDialog from '../../../components/wallet/WalletAlreadyExistDialog';
import { asGetPublicKey } from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import NavPlate from '../../../components/topbar/NavPlate';
import WalletDetails from '../../../components/wallet/my-wallets/WalletDetails';
import { ROUTES } from '../../../routes-config';
import { MultiToken } from '../../../api/common/lib/MultiToken';

const messages = defineMessages({
  walletUpgradeNoop: {
    id: 'wallet.restore.dialog.upgrade.noop',
    defaultMessage: '!!!Your wallet did not need to be upgraded',
  },
});

type Props = {|
  ...StoresAndActionsProps,
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
    const { selectedNetwork } = this.props.stores.profile;
    if (selectedNetwork === undefined) {
      throw new Error(`${nameof(WalletRestoreDialogContainer)} no API selected`);
    }
    return selectedNetwork;
  };

  componentDidMount() {
    this.props.actions.walletRestore.reset.trigger();
  }

  componentWillUnmount() {
    this.props.actions.walletRestore.reset.trigger();
  }

  onCancel: void => void = () => {
    this.props.onClose();
    // Restore request should be reset only in case restore is finished/errored
    const { restoreRequest } = this.props.stores.wallets;
    if (!restoreRequest.isExecuting) restoreRequest.reset();
  };

  updateHideBalance: void => Promise<void> = async () => {
    await this.props.actions.profile.updateHideBalance.trigger();
  };

  openToTransactions: (PublicDeriver<>) => void = publicDeriver => {
    this.props.actions.wallets.setActiveWallet.trigger({
      wallet: publicDeriver,
    });
    this.props.actions.router.goToRoute.trigger({
      route: ROUTES.WALLETS.TRANSACTIONS,
    });
  };

  render(): null | Node {
    const walletRestoreActions = this.props.actions.walletRestore;
    const actions = this.props.actions;
    const { uiNotifications } = this.props.stores;
    const { walletRestore } = this.props.stores;
    const { wallets } = this.props.stores;
    const { restoreRequest } = wallets;

    const mode = this.props.mode;

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
            mnemonicValidator={mnemonic => walletRestore.isValidMnemonic({ mnemonic, mode })}
            validWords={validWords}
            numberOfMnemonics={wordsCount}
            onSubmit={meta => actions.walletRestore.submitFields.trigger(meta)}
            onCancel={this.onCancel}
            onBack={this.props.onBack}
            error={restoreRequest.error}
            classicTheme={this.props.stores.profile.isClassicTheme}
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
        const settingsCache = this.props.stores.walletSettings.getConceptualWalletSettingsCache(
          parent
        );
        const withPubKey = asGetPublicKey(publicDeriver);
        const plate = withPubKey == null
          ? null
          : this.props.stores.wallets.getPublicKeyCache(withPubKey).plate;
        const balance: ?MultiToken = this.props.stores.transactions.getBalance(publicDeriver);
        const rewards: MultiToken = this.props.stores.delegation.getRewardBalanceOrZero(publicDeriver);

        return (
          <WalletAlreadyExistDialog
            walletPlate={<NavPlate plate={plate} wallet={settingsCache} />}
            walletSumDetails={
              <WalletDetails
                walletAmount={balance}
                rewards={rewards}
                onUpdateHideBalance={this.updateHideBalance}
                shouldHideBalance={this.props.stores.profile.shouldHideBalance}
                getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
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
              this.props.stores.explorers.selectedExplorer.get(
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
            classicTheme={this.props.stores.profile.isClassicTheme}
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
    const { yoroiTransfer } = this.props.stores;

    const walletRestoreActions = this.props.actions.walletRestore;
    const { profile } = this.props.stores;
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
              this.props.stores.explorers.selectedExplorer.get(
                this.getSelectedNetwork().NetworkId
              ) ??
              (() => {
                throw new Error('No explorer for wallet network');
              })()
            }
            getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
            onSubmit={{
              label: intl.formatMessage(globalMessages.nextButtonLabel),
              trigger: walletRestoreActions.transferFromLegacy.trigger,
            }}
            isSubmitting={this.props.stores.wallets.sendMoneyRequest.isExecuting}
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
            getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
            unitOfAccountSetting={this.props.stores.profile.unitOfAccount}
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
            title={intl.formatMessage(globalMessages.success)}
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
}
