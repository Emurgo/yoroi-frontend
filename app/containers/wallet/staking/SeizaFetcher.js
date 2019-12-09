// @flow

import React, { Component } from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import type { InjectedContainerProps } from '../../../types/injectedPropsType';
import { defineMessages, intlShape, } from 'react-intl';
import DelegationTxDialog from '../../../components/wallet/staking/DelegationTxDialog';
import environment from '../../../environment';
import { getShelleyTxFee } from '../../../api/ada/transactions/shelley/utils';
import type { PoolRequest } from '../../../actions/ada/delegation-transaction-actions';
import AnnotatedLoader from '../../../components/transfer/AnnotatedLoader';
import ErrorBlock from '../../../components/widgets/ErrorBlock';
import Dialog from '../../../components/widgets/Dialog';
import DialogCloseButton from '../../../components/widgets/DialogCloseButton';
import globalMessages from '../../../i18n/global-messages';

const messages = defineMessages({
  txGeneration: {
    id: 'wallet.delegation.transaction.generation',
    defaultMessage: '!!!generating tx', // TODO
  },
});

type SelectedPool = {|
  +name: string,
  +poolHash: string
|};

type Props = {|
  ...InjectedContainerProps,
  stakingUrl: string,
|};

@observer
export default class Staking extends Component<Props> {

  @observable selectedPools = [];
  iframe: ?HTMLElement;

  messageHandler = (event: any) => {
    if (event.origin !== process.env.SEIZA_FOR_YOROI_URL) return;
    const pools: Array<SelectedPool> = JSON.parse(decodeURI(event.data));

    const delegationTxActions = this.props.actions[environment.API].delegationTransaction;
    delegationTxActions.createTransaction.trigger({
      id: pools[0].poolHash,
    });
    this.selectedPools = pools;
  }

  constructor(props: Props) {
    super(props);
    window.addEventListener('message', this.messageHandler, false);
  }

  componentWillUnmount() {
    this.props.actions.ada.delegationTransaction.reset.trigger();
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

    const dialogBackButton = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: () => this.cancel(),
        primary: true,
      },
    ];

    return (
      <>
        {delegationTxStore.createDelegationTx.isExecuting &&
          <Dialog
            title={intl.formatMessage(globalMessages.errorLabel)}
            closeOnOverlayClick={false}
            classicTheme={this.props.stores.profile.isClassicTheme}
            onClose={this.cancel}
            closeButton={<DialogCloseButton onClose={this.cancel} />}
          >
            <AnnotatedLoader
              title={intl.formatMessage(globalMessages.processingLabel)}
              details={intl.formatMessage(messages.txGeneration)}
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
            <ErrorBlock
              error={delegationTxStore.createDelegationTx.error}
            />
          </Dialog>
        }
        {delegationTx != null &&
          <DelegationTxDialog
            staleTx={delegationTxStore.isStale}
            poolName={this.selectedPools[0].name}
            poolHash={this.selectedPools[0].poolHash}
            transactionFee={getShelleyTxFee(delegationTx.IOs, false)}
            amountToDelegate={delegationTxStore.amountToDelegate}
            approximateReward="0.0" // TODO
            isSubmitting={
              delegationTxStore.signAndBroadcastDelegationTx.isExecuting
            }
            onCancel={this.cancel}
            onSubmit={(request) => {
              delegationTxActions.signTransaction.trigger(request);
            }}
            classicTheme={profile.isClassicTheme}
            error={delegationTxStore.signAndBroadcastDelegationTx.error}
            selectedExplorer={stores.profile.selectedExplorer}
          />
        }
        <iframe ref={iframe => { this.iframe = iframe; }} title="Staking" src={`${stakingUrl}&locale=${profile.currentLocale}`} frameBorder="0" width="100%" height="100%" />
      </>
    );
  }
}
