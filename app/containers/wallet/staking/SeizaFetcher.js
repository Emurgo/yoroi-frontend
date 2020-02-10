// @flow

import React, { Component } from 'react';
import { runInAction, action, observable } from 'mobx';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import type { InjectedContainerProps } from '../../../types/injectedPropsType';
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

declare var CONFIG: ConfigType;

type SelectedPool = {|
  +name: null | string,
  +poolHash: string
|};

type Props = {|
  ...InjectedContainerProps,
  stakingUrl: string,
|};

@observer
export default class SeizaFetcher extends Component<Props> {

  @observable selectedPools = [];
  @observable iframe: ?HTMLIFrameElement;
  @observable frameHeight = 0;

  @action
  messageHandler: any => Promise<void> = async (event: any) => {
    if (event.origin !== process.env.SEIZA_FOR_YOROI_URL) return;
    const pools: Array<SelectedPool> = JSON.parse(decodeURI(event.data));

    const selectedWallet = this.props.stores.wallets.selected;
    if (selectedWallet == null) {
      return;
    }
    const delegationTxActions = this.props.actions[environment.API].delegationTransaction;
    await delegationTxActions.createTransaction.trigger({
      poolRequest: { id: pools[0].poolHash },
      publicDeriver: selectedWallet,
    });
    runInAction(() => { this.selectedPools = pools; });
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
    this.props.actions.ada.delegationTransaction.reset.trigger();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('message', this.messageHandler);
  }

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  @action
  cancel: void => void = () => {
    this.selectedPools = [];
    this.props.actions[environment.API].delegationTransaction.reset.trigger();
  }

  render() {
    const { actions, stores, stakingUrl } = this.props;
    const { intl } = this.context;
    const { profile } = stores;
    const delegationTxStore = stores.substores[environment.API].delegationTransaction;
    const delegationTxActions = actions[environment.API].delegationTransaction;

    const delegationTx = delegationTxStore.createDelegationTx.result;

    if (stakingUrl == null) {
      throw new Error('Staking undefined SEIZA_FOR_YOROI_URL should never happen');
    }

    const selectedWallet = this.props.stores.wallets.selected;
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
          (delegationTx == null && this.selectedPools.length >= 1)
        ) &&
          <Dialog
            title={intl.formatMessage(globalMessages.processingLabel)}
            closeOnOverlayClick={false}
            classicTheme={this.props.stores.profile.isClassicTheme}
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
            classicTheme={this.props.stores.profile.isClassicTheme}
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
        {delegationTx != null && this.selectedPools.length >= 1 && showSignDialog &&
          <DelegationTxDialog
            staleTx={delegationTxStore.isStale}
            poolName={this.selectedPools[0].name}
            poolHash={this.selectedPools[0].poolHash}
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
}
