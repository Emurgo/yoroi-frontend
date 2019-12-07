// @flow

import React from 'react';
import type { InjectedContainerProps } from '../../../types/injectedPropsType';
import DelegationTxDialog from '../../../components/wallet/staking/DelegationTxDialog';
import environment from '../../../environment';
import { getShelleyTxFee } from '../../../api/ada/transactions/shelley/utils';
import type { PoolRequest } from '../../../actions/ada/delegation-transaction-actions';

type SelectedPool = {|
  +name: string,
  +poolHash: string
|};

const useIframeMessageReceiver: ({|
    createTransaction: PoolRequest => void,
    setSelectedPools: Array<SelectedPool> => void,
|}) => void = (payload) => {
  const messageHandler = (event) => {
    if (event.origin !== process.env.SEIZA_FOR_YOROI_URL) return;
    const pools: Array<SelectedPool> = JSON.parse(decodeURI(event.data));
    payload.createTransaction({
      // TODO: fix pool ids from Seiza
      id: '938d890d29f86128ec6864cfc6921d37f45cb3a477a348ef87b5c9b18c82a050',
      // id: pools[0].poolHash,
    });
    payload.setSelectedPools(pools);
  };

  React.useEffect(() => {
    window.addEventListener('message', messageHandler, false);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);
};

const Staking = (props: {|
    ...InjectedContainerProps,
    stakingUrl: string,
|}) => {
  const [selectedPools, setSelectedPools] = React.useState([]);
  React.useEffect(() => {
    props.actions.ada.delegationTransaction.reset.trigger();

    return () => {
      props.actions.ada.delegationTransaction.reset.trigger();
    };
  }, []);

  const iframeRef = React.useRef(null);
  const { actions, stores, stakingUrl } = props;
  const { profile } = stores;
  const delegationTxStore = stores.substores[environment.API].delegationTransaction;
  const delegationTxActions = actions[environment.API].delegationTransaction;

  useIframeMessageReceiver({
    createTransaction: delegationTxActions.createTransaction.trigger,
    setSelectedPools,
  });

  const delegationTx = delegationTxStore.createDelegationTx.result;

  if (stakingUrl == null) {
    throw new Error('Staking undefined SEIZA_FOR_YOROI_URL should never happen');
  }
  // TODO: some dialog component that loads when createDelegationTx is executing
  // screen also needs to be able to handle not enough ada error
  return (
    <>
      {delegationTx != null &&
        <DelegationTxDialog
          staleTx={delegationTxStore.isStale}
          poolName={selectedPools[0].name}
          poolHash={selectedPools[0].poolHash}
          transactionFee={getShelleyTxFee(delegationTx.IOs, false)}
          amountToDelegate={delegationTxStore.amountToDelegate}
          approximateReward="0.0" // TODO
          isSubmitting={
            delegationTxStore.signAndBroadcastDelegationTx.isExecuting
          }
          onCancel={() => {
            setSelectedPools([]);
            delegationTxActions.reset.trigger();
          }}
          onSubmit={(request) => {
            delegationTxActions.signTransaction.trigger(request);
          }}
          classicTheme={profile.isClassicTheme}
          error={delegationTxStore.signAndBroadcastDelegationTx.error}
          selectedExplorer={stores.profile.selectedExplorer}
        />
      }
      <iframe ref={iframeRef} title="Staking" src={`${stakingUrl}&locale=${profile.currentLocale}`} frameBorder="0" width="100%" height="100%" />
    </>
  );
};

export default Staking;
