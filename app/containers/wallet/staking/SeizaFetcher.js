// @flow

import React, { Component } from 'react';
import { computed, action, observable } from 'mobx';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import { intlShape, } from 'react-intl';
import DelegationTxDialog from '../../../components/wallet/staking/DelegationTxDialog';
import environment from '../../../environment';
import { getShelleyTxFee } from '../../../api/ada/transactions/shelley/utils';
import AnnotatedLoader from '../../../components/transfer/AnnotatedLoader';
import ErrorBlock from '../../../components/widgets/ErrorBlock';
import Dialog from '../../../components/widgets/Dialog';
import DialogCloseButton from '../../../components/widgets/DialogCloseButton';
import DelegationSuccessDialog from '../../../components/wallet/staking/DelegationSuccessDialog';
import globalMessages from '../../../i18n/global-messages';
import InvalidURIImg from '../../../assets/images/uri/invalid-uri.inline.svg';
import {
  LOVELACES_PER_ADA,
  EPOCH_REWARD_DENOMINATOR,
} from '../../../config/numbersConfig';
import type { ConfigType } from '../../../../config/config-types';
import type { SelectedPool } from '../../../actions/ada/delegation-transaction-actions';

declare var CONFIG: ConfigType;

export type GeneratedData = typeof SeizaFetcher.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +children?: Node,
  +stakingUrl: string,
|};

@observer
export default class SeizaFetcher extends Component<Props> {
  static defaultProps = {
    children: undefined
  };

  @observable iframe: ?HTMLIFrameElement;
  @observable frameHeight = 0;

  @action
  messageHandler: any => Promise<void> = async (event: any) => {
    if (event.origin !== process.env.SEIZA_FOR_YOROI_URL) return;
    const pools: Array<SelectedPool> = JSON.parse(decodeURI(event.data));

    const selectedWallet = this.generated.stores.wallets.selected;
    if (selectedWallet == null) {
      return;
    }
    const delegationTxActions = this.generated.actions[environment.API].delegationTransaction;
    await delegationTxActions.createTransaction.trigger({
      poolRequest: { id: pools[0].poolHash },
      publicDeriver: selectedWallet,
    });
    delegationTxActions.setPools.trigger(pools);
  }

  @action setFrame: (null | HTMLIFrameElement) => void = (frame) => {
    this.iframe = frame;
  }

  constructor(props: Props) {
    super(props);
    window.addEventListener('message', this.messageHandler, false);
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    this.generated.actions.ada.delegationTransaction.reset.trigger();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('message', this.messageHandler);
  }

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  cancel: void => void = () => {
    this.generated.actions[environment.API].delegationTransaction.setPools.trigger([]);
    this.generated.actions[environment.API].delegationTransaction.reset.trigger();
  }

  render() {
    const { stakingUrl } = this.props;
    const { actions, stores } = this.generated;
    const { intl } = this.context;
    const { profile } = stores;
    const delegationTxStore = stores.substores[environment.API].delegationTransaction;
    const delegationTxActions = actions[environment.API].delegationTransaction;

    const delegationTx = delegationTxStore.createDelegationTx.result;

    if (stakingUrl == null) {
      throw new Error('Staking undefined SEIZA_FOR_YOROI_URL should never happen');
    }

    const selectedWallet = this.generated.stores.wallets.selected;
    if (selectedWallet == null) {
      return null;
    }

    const dialogBackButton = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: this.cancel,
        primary: true,
      },
    ];

    const approximateReward: BigNumber => BigNumber = (amount) => {
      // TODO: based on https://staking.cardano.org/en/calculator/
      // needs to be update per-network
      const rewardMultiplier = (number) => number
        .times(CONFIG.genesis.epoch_reward)
        .div(EPOCH_REWARD_DENOMINATOR)
        .div(100);

      const result = rewardMultiplier(amount)
        .div(LOVELACES_PER_ADA);
      return result;
    };

    const showSignDialog = delegationTxStore.signAndBroadcastDelegationTx.isExecuting ||
      !delegationTxStore.signAndBroadcastDelegationTx.wasExecuted ||
      delegationTxStore.signAndBroadcastDelegationTx.error;

    return (
      <>
        {(
          delegationTxStore.createDelegationTx.isExecuting ||
          (delegationTx == null && delegationTxStore.selectedPools.length >= 1)
        ) &&
          <Dialog
            title={intl.formatMessage(globalMessages.processingLabel)}
            closeOnOverlayClick={false}
            onClose={this.cancel}
            closeButton={<DialogCloseButton onClose={this.cancel} />}
          >
            <AnnotatedLoader
              title={intl.formatMessage(globalMessages.processingLabel)}
              details={intl.formatMessage(globalMessages.txGeneration)}
            />
          </Dialog>
        }
        {delegationTxStore.createDelegationTx.error != null &&
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
                error={delegationTxStore.createDelegationTx.error}
              />
            </>
          </Dialog>
        }
        {delegationTx != null && delegationTxStore.selectedPools.length >= 1 && showSignDialog &&
          <DelegationTxDialog
            staleTx={delegationTxStore.isStale}
            poolName={delegationTxStore.selectedPools[0].name}
            poolHash={delegationTxStore.selectedPools[0].poolHash}
            transactionFee={getShelleyTxFee(delegationTx.unsignedTx.IOs, true)}
            amountToDelegate={delegationTx.totalAmountToDelegate}
            approximateReward={approximateReward(delegationTx.totalAmountToDelegate)}
            isSubmitting={
              delegationTxStore.signAndBroadcastDelegationTx.isExecuting
            }
            onCancel={this.cancel}
            onSubmit={({ password }) => delegationTxActions.signTransaction.trigger({
              password,
              publicDeriver: selectedWallet,
            })}
            classicTheme={profile.isClassicTheme}
            error={delegationTxStore.signAndBroadcastDelegationTx.error}
            selectedExplorer={stores.profile.selectedExplorer}
          />
        }
        {delegationTx != null && !showSignDialog &&
          <DelegationSuccessDialog
            onClose={() => delegationTxActions.complete.trigger(selectedWallet)}
            classicTheme={profile.isClassicTheme}
          />
        }
        <iframe
          ref={this.setFrame}
          title="Staking"
          src={`${stakingUrl}`}
          frameBorder="0"
          width="100%"
          height={this.iframe != null && this.frameHeight != null ? this.frameHeight + 'px' : null}
        />
      </>
    );
  }

  @action
  resize: void => void = () => {
    if (this.iframe == null) {
      this.frameHeight = 0;
      return;
    }
    this.frameHeight = Math.max(
      window.innerHeight - this.iframe.getBoundingClientRect().top - 30,
      0
    );
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SeizaFetcher)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const delegationTxStore = stores.substores.ada.delegationTransaction;
    return Object.freeze({
      stores: {
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          selectedExplorer: stores.profile.selectedExplorer,
        },
        wallets: {
          selected: stores.wallets.selected,
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
                isExecuting: delegationTxStore.createDelegationTx.isExecuting,
                wasExecuted: delegationTxStore.createDelegationTx.wasExecuted,
              },
            },
          },
        },
      },
      actions: {
        ada: {
          delegationTransaction: {
            createTransaction: {
              trigger: actions.ada.delegationTransaction.createTransaction.trigger,
            },
            signTransaction: {
              trigger: actions.ada.delegationTransaction.signTransaction.trigger,
            },
            complete: {
              trigger: actions.ada.delegationTransaction.complete.trigger,
            },
            reset: {
              trigger: actions.ada.delegationTransaction.reset.trigger,
            },
            setPools: {
              trigger: actions.ada.delegationTransaction.setPools.trigger,
            },
          },
        },
      },
    });
  }
}
