import { GovernanceApi } from '@emurgo/yoroi-lib/dist/governance/emurgo-api';
import * as React from 'react';

import { RustModule } from '../../../../api/ada/lib/cardanoCrypto/rustLoader';
import { unwrapStakingKey } from '../../../../api/ada/lib/storage/bridge/utils';
import { asGetSigningKey, asGetStakingKey } from '../../../../api/ada/lib/storage/models/PublicDeriver/traits';
import { DREP_ALWAYS_ABSTAIN, DREP_ALWAYS_NO_CONFIDENCE } from '../common/constants';
import { getFormattedPairingValue } from '../common/helpers';
import { useGovernanceManagerMaker } from '../common/useGovernanceManagerMaker';
import { GovernanceActionType, GovernanceReducer, defaultGovernanceActions, defaultGovernanceState } from './state';

type drepDelegation = { status: string | null; drep: string | null };

const initialGovernanceProvider = {
  ...defaultGovernanceState,
  ...defaultGovernanceActions,
  walletId: '',
  governanceManager: null,
  checkUserPassword: (_password: string) => Response,
  txDelegationResult: null,
  txDelegationError: null,
  tokenInfo: null,
  getFormattedPairingAmount: (_amount: string) => Response,
  isHardwareWallet: false,
  createDrepDelegationTransaction: async (_drepCredential: string) => Response,
  signDelegationTransaction: async (_params: any) => Response,
  selectedWallet: null,
  walletAdaBalance: null,
  governanceStatus: { status: null, drep: null },
  triggerBuySellAdaDialog: null,
  recentTransactions: [],
  submitedTransactions: [{ isDrepDelegation: false }],
};

const GovernanceContext = React.createContext(initialGovernanceProvider);

type GovernanceProviderProps = {
  children: React.ReactNode;
  currentWallet: any; // TODO to be defined
  createDrepDelegationTransaction: (drepCredential: String) => Promise<void>;
  txDelegationResult: any;
  txDelegationError: any;
  signDelegationTransaction: (params: any) => Promise<void>;
  tokenInfo: any;
  triggerBuySellAdaDialog: any;
};

export const GovernanceContextProvider = ({
  children,
  currentWallet,
  createDrepDelegationTransaction,
  txDelegationResult,
  txDelegationError,
  signDelegationTransaction,
  tokenInfo,
  triggerBuySellAdaDialog,
}: GovernanceProviderProps) => {
  if (!currentWallet?.selectedWallet) throw new Error(`requires a wallet to be selected`);
  const [state, dispatch] = React.useReducer(GovernanceReducer, {
    ...defaultGovernanceState,
  });
  const [stakingKeyHash, setStakingKeyHash] = React.useState(null);
  const [stakingKeyHex, setStakingKeyHex] = React.useState(null);
  const [governanceStatus, setGovernanceStatus] = React.useState<drepDelegation>({ status: null, drep: null });
  const {
    walletId,
    networkId,
    currentPool,
    selectedWallet,
    backendService,
    defaultTokenInfo,
    unitOfAccount,
    getCurrentPrice,
    isHardwareWallet,
    walletAdaBalance,
    backendServiceZero,
    recentTransactions,
    submitedTransactions,
  } = currentWallet;
  const governanceManager = useGovernanceManagerMaker(walletId, networkId);

  // TODO to me moved in rootStore and use this globbaly whenever we need just a wallet password check
  const checkUserPassword = async (password: string): Promise<any> => {
    try {
      // check the password
      const withSigningKey = asGetSigningKey(selectedWallet);
      if (!withSigningKey) {
        throw new Error(`[sign tx] no signing key`);
      }
      const signingKeyFromStorage = await withSigningKey.getSigningKey();
      // will throw a WrongPasswordError
      await withSigningKey.normalizeKey({
        ...signingKeyFromStorage,
        password,
      });
    } catch (error) {
      return error;
    }
  };

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
      })
      .catch(err => {
        console.error(`unexpected erorr: failed to get wallet staking key: ${err}`);
      });
  }, []);

  React.useEffect(() => {
    if (stakingKeyHex) {
      getGovApiState().catch(err => {
        console.log('ERROR on getGovApiState', err);
      });
    }
  }, [stakingKeyHex]);

  const getGovApiState = async () => {
    const govApi = new GovernanceApi({
      oldBackendUrl: String(backendService),
      newBackendUrl: String(backendServiceZero),
      networkId: networkId,
      wasmFactory: RustModule.CrossCsl.init,
    });

    const governanceStatusState: any = await govApi.getAccountState(stakingKeyHex || '', stakingKeyHex || '');

    if (governanceStatusState && governanceStatusState.drepDelegation?.drep === 'abstain') {
      setGovernanceStatus({ status: DREP_ALWAYS_ABSTAIN, drep: null });
    } else if (governanceStatusState && governanceStatusState.drepDelegation?.drep === 'no_confidence') {
      setGovernanceStatus({ status: DREP_ALWAYS_NO_CONFIDENCE, drep: null });
    } else if (governanceStatusState !== null && governanceStatusState.drepDelegation?.drep.length > 0) {
      setGovernanceStatus({ status: 'delegate', drep: governanceStatusState.drepDelegation?.drep || null });
    } else {
      setGovernanceStatus({ status: 'none', drep: null });
    }
  };

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

  const context: any = {
    ...state,
    ...actions,
    governanceManager: governanceManager,
    stakePoolKeyHash: currentPool?.hash ?? '',
    walletId: currentWallet.walletId,
    stakingKeyHash,
    stakingKeyHex,
    checkUserPassword,
    createDrepDelegationTransaction,
    txDelegationResult,
    txDelegationError,
    signDelegationTransaction,
    governanceStatus,
    selectedWallet: currentWallet.selectedWallet,
    tokenInfo,
    isHardwareWallet,
    walletAdaBalance,
    getFormattedPairingAmount: (amount: string) =>
      getFormattedPairingValue(getCurrentPrice, defaultTokenInfo, unitOfAccount, amount),
    triggerBuySellAdaDialog,
    recentTransactions,
    submitedTransactions,
  };

  return <GovernanceContext.Provider value={context}>{children}</GovernanceContext.Provider>;
};

export const useGovernance = () =>
  React.useContext(GovernanceContext) ?? console.log('useGovernance: needs to be wrapped in a GovernanceManagerProvider');
