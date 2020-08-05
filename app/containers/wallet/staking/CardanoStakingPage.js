// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed, observable, runInAction } from 'mobx';
import { intlShape } from 'react-intl';
import BigNumber from 'bignumber.js';
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
import { getApiForNetwork, getApiMeta } from '../../../api/common/utils';
import type { PoolMeta } from '../../../stores/toplevel/DelegationStore';
import DelegationTxDialog from '../../../components/wallet/staking/DelegationTxDialog';
import StakePool from '../../../components/wallet/staking/dashboard/StakePool';
import PoolWarningDialog from '../../../components/wallet/staking/dashboard/PoolWarningDialog';
import type { Notification } from '../../../types/notificationType';
import type { ReputationObject, } from '../../../api/jormungandr/lib/state-fetch/types';
import config from '../../../config';
import { handleExternalLinkClick } from '../../../utils/routing';

export type GeneratedData = typeof CardanoStakingPage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
|};

@observer
export default class CardanoStakingPage extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  @observable notificationElementId: string = '';

  cancel: void => void = () => {
    this.generated.actions.ada.delegationTransaction.reset.trigger();
  }
  componentWillUnmount() {
    this.cancel();
    this.generated.actions.ada.delegationTransaction.setPools.trigger([]);
    this.generated.stores.delegation.poolInfoQuery.reset();
  }

  render(): Node {
    return (
      <div>
        {this.getDialog()}
        <DelegationSendForm
          hasAnyPending={this.generated.stores.transactions.hasAnyPending}
          poolQueryError={this.generated.stores.delegation.poolInfoQuery.error}
          isProcessing={this.generated.stores.delegation.poolInfoQuery.isExecuting}
          updatePool={async (poolId) => {
            this.generated.stores.delegation.poolInfoQuery.reset();
            if (poolId == null) {
              await this.generated.actions.ada.delegationTransaction.setPools.trigger([]);
              return;
            }
            await this.generated.actions.ada.delegationTransaction.setPools.trigger([poolId]);
          }}
          onNext={async () => {
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
          }}
        />
        {this._displayPoolInfo()}
      </div>);
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
    const apiMeta = getApiMeta(getApiForNetwork(networkInfo))?.meta;
    if (apiMeta == null) throw new Error(`${nameof(CardanoStakingPage)} no API selected`);
    const currentParams = networkInfo.BaseConfig
      .reduce((acc, next) => Object.assign(acc, next), {});
    const amountPerUnit = new BigNumber(10).pow(apiMeta.decimalPlaces);

    const approximateReward: BigNumber => BigNumber = (amount) => {
      const rewardMultiplier = (number) => number
        .times(currentParams.PerEpochPercentageReward)
        .div(EPOCH_REWARD_DENOMINATOR);

      const result = rewardMultiplier(amount)
        .div(amountPerUnit);
      return result;
    };

    const showSignDialog = delegationTransaction.signAndBroadcastDelegationTx.isExecuting ||
      !delegationTransaction.signAndBroadcastDelegationTx.wasExecuted ||
      delegationTransaction.signAndBroadcastDelegationTx.error != null;

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
          transactionFee={delegationTx.signTxRequest.fee(true)}
          amountToDelegate={delegationTx.totalAmountToDelegate}
          approximateReward={approximateReward(delegationTx.totalAmountToDelegate)}
          isSubmitting={
            delegationTransaction.signAndBroadcastDelegationTx.isExecuting
          }
          onCancel={this.cancel}
          onSubmit={({ password }) => (
            this.generated.actions.ada.delegationTransaction.signTransaction.trigger({
              password,
              publicDeriver: selectedWallet,
            })
          )}
          classicTheme={this.generated.stores.profile.isClassicTheme}
          error={delegationTransaction.signAndBroadcastDelegationTx.error}
          selectedExplorer={this.generated.stores.explorers.selectedExplorer
            .get(
              selectedWallet.getParent().getNetworkInfo().NetworkId
            ) ?? (() => { throw new Error('No explorer for wallet network'); })()
          }
          meta={{
            decimalPlaces: apiMeta.decimalPlaces.toNumber(),
            totalSupply: apiMeta.totalSupply,
          }}
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
          reset: {| trigger: (params: void) => void |},
          setPools: {|
            trigger: (params: Array<string>) => Promise<void>,
          |},
          signTransaction: {|
            trigger: (params: {|
              password: string,
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
      transactions: {| hasAnyPending: boolean |},
      delegation: {|
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
            signAndBroadcastDelegationTx: {|
              error: ?LocalizableError,
              isExecuting: boolean,
              wasExecuted: boolean
            |}
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
      wallets: {| selected: null | PublicDeriver<> |}
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
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
        },
        transactions: {
          hasAnyPending: stores.transactions.hasAnyPending,
        },
        delegation: {
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
              signAndBroadcastDelegationTx: {
                error: delegationTxStore.signAndBroadcastDelegationTx.error,
                isExecuting: delegationTxStore.signAndBroadcastDelegationTx.isExecuting,
                wasExecuted: delegationTxStore.signAndBroadcastDelegationTx.wasExecuted,
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
