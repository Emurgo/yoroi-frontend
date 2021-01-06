// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed, observable, runInAction, } from 'mobx';
import { intlShape } from 'react-intl';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';

import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import DelegationSendForm from '../../../components/wallet/send/DelegationSendForm';
import LocalizableError from '../../../i18n/LocalizableError';
import type {
  CreateDelegationTxFunc,
} from '../../../api/ada/index';
import Dialog from '../../../components/widgets/Dialog';
import {
  EPOCH_REWARD_DENOMINATOR,
} from '../../../config/numbersConfig';
import DialogCloseButton from '../../../components/widgets/DialogCloseButton';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import globalMessages from '../../../i18n/global-messages';
import InvalidURIImg from '../../../assets/images/uri/invalid-uri.inline.svg';
import ErrorBlock from '../../../components/widgets/ErrorBlock';
import AnnotatedLoader from '../../../components/transfer/AnnotatedLoader';
import DelegationSuccessDialog from '../../../components/wallet/staking/DelegationSuccessDialog';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { PoolMeta, DelegationRequests } from '../../../stores/toplevel/DelegationStore';
import { WalletTypeOption } from '../../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import DelegationTxDialog from '../../../components/wallet/staking/DelegationTxDialog';
import StakePool from '../../../components/wallet/staking/dashboard/StakePool';
import SeizaFetcher from './SeizaFetcher';
import PoolWarningDialog from '../../../components/wallet/staking/dashboard/PoolWarningDialog';
import type { Notification } from '../../../types/notificationType';
import type { ReputationObject } from '../../../api/jormungandr/lib/state-fetch/types';
import config from '../../../config';
import { handleExternalLinkClick } from '../../../utils/routing';
import type { TxRequests } from '../../../stores/toplevel/TransactionsStore'
import type { TokenInfoMap } from '../../../stores/toplevel/TokenInfoStore';
import { genLookupOrFail } from '../../../stores/stateless/tokenHelpers';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';

export type GeneratedData = typeof CardanoStakingPage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  urlTemplate: ?string,
|};

@observer
export default class CardanoStakingPage extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  @observable notificationElementId: string = '';

  cancel: void => void = () => {
    this.generated.actions.ada.delegationTransaction.reset.trigger({ justTransaction: true });
  }
  async componentWillUnmount() {
    this.generated.actions.ada.delegationTransaction.reset.trigger({ justTransaction: false });
    await this.generated.actions.ada.delegationTransaction.setPools.trigger([]);
    this.generated.stores.delegation.poolInfoQuery.reset();
  }

  render(): null | Node {
    const { urlTemplate } = this.props;

    const selectedWallet = this.generated.stores.wallets.selected;
    if (selectedWallet == null) {
      return null;
    }
    const delegationRequests = this.generated.stores.delegation.getDelegationRequests(
      selectedWallet
    );
    if (delegationRequests == null) {
      throw new Error(`${nameof(SeizaFetcher)} opened for non-reward wallet`);
    }

    if (urlTemplate != null) {
      const totalAda = this._getTotalAda();
      const locale = this.generated.stores.profile.currentLocale;
      return (
        <div>
          {this.getDialog()}
          <SeizaFetcher
            urlTemplate={urlTemplate}
            locale={locale}
            totalAda={totalAda}
            poolList={delegationRequests.getCurrentDelegation.result?.currEpoch?.pools.map(
              tuple => tuple[0]
            ) ?? []}
            stakepoolSelectedAction={async (poolId) => {
              await this._updatePool(poolId);
              await this._next();
            }}
          />
        </div>
      );
    }
    return (
      <div>
        {this.getDialog()}
        <DelegationSendForm
          hasAnyPending={this.generated.stores.transactions.hasAnyPending}
          poolQueryError={this.generated.stores.delegation.poolInfoQuery.error}
          isProcessing={this.generated.stores.delegation.poolInfoQuery.isExecuting}
          updatePool={poolId => {
            /* note: it's okay for triggering a pool update to be async, so we don't await  */
            // eslint-disable-next-line no-unused-vars
            const _ = this._updatePool(poolId);
          }}
          onNext={async () => (this._next())}
        />
        {this._displayPoolInfo()}
      </div>);

  }

  _getTotalAda: ?MultiToken => ?number = () => {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(CardanoStakingPage)} no public deriver. Should never happen`);
    }

    const delegationStore = this.generated.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(CardanoStakingPage)} opened for non-reward wallet`);
    }

    const txRequests = this.generated.stores.transactions.getTxRequests(publicDeriver);
    const balance = txRequests.requests.getBalanceRequest.result;
    const rewardBalance =
      delegationRequests.getDelegatedBalance.result == null
        ? new MultiToken([], publicDeriver.getParent().getDefaultToken())
        : delegationRequests.getDelegatedBalance.result.accountPart;
    const tokenInfo = genLookupOrFail(
      this.generated.stores.tokenInfoStore.tokenInfo
    )(rewardBalance.getDefaultEntry());

    if (balance == null || rewardBalance == null) throw new Error(`${nameof(CardanoStakingPage)} balance or rewardBalance is null`)
    return balance
      .joinAddCopy(rewardBalance)
      .getDefaultEntry()
      .amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals)
      .toNumber();
  }

  _updatePool: ?string => Promise<void> = async (poolId) => {
    this.generated.stores.delegation.poolInfoQuery.reset();
    if (poolId == null) {
      await this.generated.actions.ada.delegationTransaction.setPools.trigger([]);
      return;
    }
    await this.generated.actions.ada.delegationTransaction.setPools.trigger([poolId]);
  }

  _next: void => Promise<void> = async () => {
    const selectedWallet = this.generated.stores.wallets.selected;
    if (selectedWallet == null) {
      return;
    }
    const { delegationTransaction } = this.generated.stores.substores.ada;
    if (delegationTransaction.selectedPools.length === 0) {
      return;
    }
    await this.generated.actions.ada.delegationTransaction.createTransaction.trigger({
      poolRequest: delegationTransaction.selectedPools[0],
      publicDeriver: selectedWallet,
    });
  }

  _displayPoolInfo: void => (void | Node) = () => {
    const { intl } = this.context;
    const selectedWallet = this.generated.stores.wallets.selected;
    if (selectedWallet == null) {
      return null;
    }
    const selectedPoolInfo = this._getPoolInfo(selectedWallet);
    if (selectedPoolInfo == null) return;

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    const moreInfo = selectedPoolInfo.info?.homepage != null
      ? {
        openPoolPage: handleExternalLinkClick,
        url: selectedPoolInfo.info.homepage,
      }
      : undefined;

    return (
      <StakePool
        purpose="delegation"
        poolName={selectedPoolInfo.info?.name
            ?? intl.formatMessage(globalMessages.unknownPoolLabel)
        }
        data={{
          description: selectedPoolInfo.info?.description ?? undefined,
          /* TODO: fill once we know this from the backend */
        }}
        selectedExplorer={this.generated.stores.explorers.selectedExplorer.get(
          selectedWallet.getParent().getNetworkInfo().NetworkId
        ) ?? (() => { throw new Error('No explorer for wallet network'); })()}
        hash={selectedPoolInfo.poolId}
        moreInfo={moreInfo}
        classicTheme={this.generated.stores.profile.isClassicTheme}
        onCopyAddressTooltip={(address, elementId) => {
          if (!this.generated.stores.uiNotifications.isOpen(elementId)) {
            runInAction(() => {
              this.notificationElementId = elementId;
            });
            this.generated.actions.notifications.open.trigger({
              id: elementId,
              duration: tooltipNotification.duration,
              message: tooltipNotification.message,
            });
          }
        }}
        notification={this.notificationElementId == null
          ? null
          : this.generated.stores.uiNotifications.getTooltipActiveNotification(
            this.notificationElementId
          )
        }
        undelegate={undefined}
        reputationInfo={selectedPoolInfo.reputation}
        openReputationDialog={() => this.generated.actions.dialogs.open.trigger({
          dialog: PoolWarningDialog,
          params: { reputation: selectedPoolInfo.reputation },
        })}
      />
    );
  };

  _getPoolInfo: PublicDeriver<> => (void | PoolMeta) = (publicDeriver) => {
    const { delegationTransaction } = this.generated.stores.substores.ada;
    return delegationTransaction.selectedPools.length === 0
      ? undefined
      : this.generated.stores.delegation.getLocalPoolInfo(
        publicDeriver.getParent().getNetworkInfo(),
        delegationTransaction.selectedPools[0],
      );
  };

  _errorDialog: LocalizableError => Node = (error) => {
    const { intl } = this.context;
    const dialogBackButton = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: this.cancel,
        primary: true,
      },
    ];
    return (
      <Dialog
        title={intl.formatMessage(globalMessages.errorLabel)}
        closeOnOverlayClick={false}
        onClose={this.cancel}
        closeButton={<DialogCloseButton onClose={this.cancel} />}
        actions={dialogBackButton}
      >
        <>
          <center><InvalidURIImg /></center>
          <ErrorBlock
            error={error}
          />
        </>
      </Dialog>
    );
  }

  getDialog: void => (void | Node) = () => {
    const { intl } = this.context;
    const { delegationTransaction } = this.generated.stores.substores.ada;
    const delegationTx = delegationTransaction.createDelegationTx.result;

    const selectedWallet = this.generated.stores.wallets.selected;
    if (selectedWallet == null) {
      return null;
    }

    if (this.generated.stores.uiDialogs.isOpen(PoolWarningDialog)) {
      return (
        <PoolWarningDialog
          close={() => this.generated.actions.dialogs.closeActiveDialog.trigger()}
          reputationInfo={this.generated.stores.uiDialogs.getParam<ReputationObject>('reputation')}
        />
      );
    }

    const networkInfo = selectedWallet.getParent().getNetworkInfo();
    const currentParams = networkInfo.BaseConfig
      .reduce((acc, next) => Object.assign(acc, next), {});

    const approximateReward = (tokenEntry) => {
      const tokenRow = this.generated.stores.tokenInfoStore.tokenInfo
        .get(tokenEntry.networkId.toString())
        ?.get(tokenEntry.identifier);
      if (tokenRow == null) throw new Error(`${nameof(CardanoStakingPage)} no token info for ${JSON.stringify(tokenEntry)}`);

      return {
        amount: tokenEntry.amount
          .times(currentParams.PerEpochPercentageReward)
          .div(EPOCH_REWARD_DENOMINATOR),
        token: tokenRow,
      };
    };

    const showSignDialog = this.generated.stores.wallets.sendMoneyRequest.isExecuting ||
      !this.generated.stores.wallets.sendMoneyRequest.wasExecuted ||
      this.generated.stores.wallets.sendMoneyRequest.error != null;

    const selectedPoolInfo = this._getPoolInfo(selectedWallet);
    if (this.generated.stores.delegation.poolInfoQuery.error != null) {
      return undefined;
    }
    if (this.generated.stores.delegation.poolInfoQuery.isExecuting) {
      return (
        <Dialog
          title={intl.formatMessage(globalMessages.processingLabel)}
          closeOnOverlayClick={false}
        >
          <AnnotatedLoader
            title={intl.formatMessage(globalMessages.processingLabel)}
            details={intl.formatMessage(globalMessages.poolFetching)}
          />
        </Dialog>
      );
    }
    if (delegationTransaction.createDelegationTx.isExecuting) {
      return (
        <Dialog
          title={intl.formatMessage(globalMessages.processingLabel)}
          closeOnOverlayClick={false}
        >
          <AnnotatedLoader
            title={intl.formatMessage(globalMessages.processingLabel)}
            details={intl.formatMessage(globalMessages.txGeneration)}
          />
        </Dialog>
      );
    }
    if (delegationTransaction.createDelegationTx.error != null) {
      return this._errorDialog(delegationTransaction.createDelegationTx.error);
    }
    if (delegationTx != null && delegationTransaction.selectedPools.length >= 1 && showSignDialog) {
      // may happen for a split second before backend query starts
      if (selectedPoolInfo == null) return null;
      return (
        <DelegationTxDialog
          staleTx={delegationTransaction.isStale}
          poolName={selectedPoolInfo.info?.name
            ?? intl.formatMessage(globalMessages.unknownPoolLabel)
          }
          poolHash={delegationTransaction.selectedPools[0]}
          transactionFee={delegationTx.signTxRequest.fee()}
          amountToDelegate={delegationTx.totalAmountToDelegate}
          approximateReward={
            approximateReward(delegationTx.totalAmountToDelegate.getDefaultEntry())
          }
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
          isSubmitting={
            this.generated.stores.wallets.sendMoneyRequest.isExecuting
          }
          isHardware={
            selectedWallet.getParent().getWalletType() === WalletTypeOption.HARDWARE_WALLET
          }
          onCancel={this.cancel}
          onSubmit={({ password }) => (
            this.generated.actions.ada.delegationTransaction.signTransaction.trigger({
              password,
              publicDeriver: selectedWallet,
            })
          )}
          classicTheme={this.generated.stores.profile.isClassicTheme}
          error={this.generated.stores.wallets.sendMoneyRequest.error}
          selectedExplorer={this.generated.stores.explorers.selectedExplorer
            .get(
              selectedWallet.getParent().getNetworkInfo().NetworkId
            ) ?? (() => { throw new Error('No explorer for wallet network'); })()
          }
        />
      );
    }
    if (delegationTx != null && !showSignDialog) {
      return (
        <DelegationSuccessDialog
          onClose={this.generated.actions.ada.delegationTransaction.complete.trigger}
          classicTheme={this.generated.stores.profile.isClassicTheme}
        />
      );
    }
    return undefined;
  }

  @computed get generated(): {|
    actions: {|
      ada: {|
        delegationTransaction: {|
          complete: {|
            trigger: void => void
          |},
          createTransaction: {|
            trigger: (params: {|
              poolRequest: string | void,
              publicDeriver: PublicDeriver<>
            |}) => Promise<void>
          |},
          reset: {| trigger: (params: {| justTransaction: boolean |}) => void |},
          setPools: {|
            trigger: (params: Array<string>) => Promise<void>,
          |},
          signTransaction: {|
            trigger: (params: {|
              password?: string,
              publicDeriver: PublicDeriver<>
            |}) => Promise<void>
          |}
        |}
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |},
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any
          |}) => void
        |}
      |},
      notifications: {|
        open: {| trigger: (params: Notification) => void |}
      |}
    |},
    stores: {|
      transactions: {|
        hasAnyPending: boolean,
        getTxRequests: (PublicDeriver<>) => TxRequests,
      |},
      delegation: {|
        getDelegationRequests: (
          PublicDeriver<>
        ) => void | DelegationRequests,
        getLocalPoolInfo: ($ReadOnly<NetworkRow>, string) => (void | PoolMeta),
        poolInfoQuery: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          reset: void => void,
        |},
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        isClassicTheme: boolean,
        currentLocale: string,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
      substores: {|
        ada: {|
          delegationTransaction: {|
            createDelegationTx: {|
              error: ?LocalizableError,
              isExecuting: boolean,
              result: ?PromisslessReturnType<CreateDelegationTxFunc>,
            |},
            isStale: boolean,
            selectedPools: Array<string>,
          |}
        |}
      |},
      uiDialogs: {|
        getParam: <T>(number | string) => T,
        isOpen: any => boolean
      |},
      uiNotifications: {|
        getTooltipActiveNotification: string => ?Notification,
        isOpen: string => boolean
      |},
      wallets: {|
        sendMoneyRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          wasExecuted: boolean
        |},
        selected: null | PublicDeriver<>
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(CardanoStakingPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const delegationTxStore = stores.substores.ada.delegationTransaction;
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        wallets: {
          selected: stores.wallets.selected,
          sendMoneyRequest: {
            error: stores.wallets.sendMoneyRequest.error,
            isExecuting: stores.wallets.sendMoneyRequest.isExecuting,
            wasExecuted: stores.wallets.sendMoneyRequest.wasExecuted,
          },
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          currentLocale: stores.profile.currentLocale,
        },
        transactions: {
          hasAnyPending: stores.transactions.hasAnyPending,
          getTxRequests: stores.transactions.getTxRequests,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
        delegation: {
          getDelegationRequests: stores.delegation.getDelegationRequests,
          getLocalPoolInfo: stores.delegation.getLocalPoolInfo,
          poolInfoQuery: {
            isExecuting: stores.delegation.poolInfoQuery.isExecuting,
            error: stores.delegation.poolInfoQuery.error,
            reset: stores.delegation.poolInfoQuery.reset,
          },
        },
        substores: {
          ada: {
            delegationTransaction: {
              selectedPools: delegationTxStore.selectedPools,
              isStale: delegationTxStore.isStale,
              createDelegationTx: {
                result: delegationTxStore.createDelegationTx.result,
                error: delegationTxStore.createDelegationTx.error,
                isExecuting: delegationTxStore.createDelegationTx.isExecuting,
              },
            },
          },
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        uiNotifications: {
          isOpen: stores.uiNotifications.isOpen,
          getTooltipActiveNotification: stores.uiNotifications.getTooltipActiveNotification,
        },
      },
      actions: {
        notifications: {
          open: {
            trigger: actions.notifications.open.trigger,
          },
        },
        ada: {
          delegationTransaction: {
            createTransaction: {
              trigger: actions.ada.delegationTransaction.createTransaction.trigger,
            },
            signTransaction: {
              trigger: actions.ada.delegationTransaction.signTransaction.trigger,
            },
            reset: {
              trigger: actions.ada.delegationTransaction.reset.trigger,
            },
            complete: {
              trigger: actions.ada.delegationTransaction.complete.trigger,
            },
            setPools: {
              trigger: actions.ada.delegationTransaction.setPools.trigger,
            },
          },
        },
        dialogs: {
          closeActiveDialog: {
            trigger: actions.dialogs.closeActiveDialog.trigger,
          },
          open: {
            trigger: actions.dialogs.open.trigger,
          },
        },
      },
    });
  }
}
