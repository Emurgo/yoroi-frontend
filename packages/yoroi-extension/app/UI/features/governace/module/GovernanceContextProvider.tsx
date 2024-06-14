import { GovernanceApi } from '@emurgo/yoroi-lib/dist/governance/emurgo-api';
import * as React from 'react';

import { RustModule } from '../../../../api/ada/lib/cardanoCrypto/rustLoader';
import { unwrapStakingKey } from '../../../../api/ada/lib/storage/bridge/utils';
import { asGetStakingKey } from '../../../../api/ada/lib/storage/models/PublicDeriver/traits';
import { useGovernanceManagerMaker } from '../common/useGovernanceManagerMaker';
import { GovernanceActionType, GovernanceReducer, defaultGovernanceActions, defaultGovernanceState } from './state';

const initialGovernanceProvider = {
  ...defaultGovernanceState,
  ...defaultGovernanceActions,
  walletId: '',
  governanceManager: null,
};
const GovernanceContext = React.createContext(initialGovernanceProvider);

type GovernanceProviderProps = {
  children: React.ReactNode;
  currentWallet: any; // TODO to be defined
};

export const GovernanceContextProvider = ({ children, currentWallet }: GovernanceProviderProps) => {
  console.log('currentWallet', currentWallet);
  if (!currentWallet?.selectedWallet) throw new Error(`requires a wallet to be selected`);
  const [state, dispatch] = React.useReducer(GovernanceReducer, {
    ...defaultGovernanceState,
  });
  const [stakingKeyHash, setStakingKeyHash] = React.useState(null);
  const [stakingKeyHex, setStakingKeyHex] = React.useState(null);

  const { walletId, networkId, currentPool, selectedWallet, backendService } = currentWallet;
  const governanceManager = useGovernanceManagerMaker(walletId, networkId);

  React.useEffect(() => {
    const withStakingKey = asGetStakingKey(selectedWallet);
    if (withStakingKey == null) {
      throw new Error(`missing staking key functionality`);
    }

    withStakingKey
      .getStakingKey()
      .then(async stakingKeyResp => {
        setStakingKeyHash(stakingKeyResp.addr.Hash);
        const skey = unwrapStakingKey(stakingKeyResp.addr.Hash).to_keyhash()?.to_hex();
        if (skey == null) {
          throw new Error('Cannot get staking key from the wallet!');
        }
        setStakingKeyHex(skey);

        const govApi = new GovernanceApi({
          oldBackendUrl: String(backendService),
          newBackendUrl: String(backendService),
          networkId: networkId,
          wasm: RustModule.CrossCsl.init('global'),
        });

        const governanceStatus = await govApi.getAccountState(skey, skey);
        console.log('governanceStatus', governanceStatus);

        return null;
      })
      .catch(err => {
        console.error(`unexpected erorr: failed to get wallet staking key: ${err}`);
      });
  }, []);

  const actions = React.useRef({
    governanceVoteChanged: (vote: any) => {
      dispatch({
        type: GovernanceActionType.GovernanceVoteChanged,
        governanceVote: vote,
      });
    },
    dRepIdChanged: (dRepId: any) => {
      dispatch({ type: GovernanceActionType.DRepIdChanged, dRepId });
    },
  }).current;
  console.log('stakingKeyHash', stakingKeyHash);
  console.log('stakingKeyHex', stakingKeyHex);
  const context: any = {
    ...state,
    ...actions,
    governanceManager: governanceManager,
    stakePoolKeyHash: currentPool?.hash ?? '',
    walletId: currentWallet.walletId,
    stakingKeyHash,
    stakingKeyHex,
  };

  return <GovernanceContext.Provider value={context}>{children}</GovernanceContext.Provider>;
};

export const useGovernance = () =>
  React.useContext(GovernanceContext) ?? console.log('useGovernance: needs to be wrapped in a GovernanceManagerProvider');
