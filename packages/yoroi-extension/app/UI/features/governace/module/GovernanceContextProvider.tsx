import { GovernanceApi } from '@emurgo/yoroi-lib/dist/governance/emurgo-api';
import * as React from 'react';

import { RustModule } from '../../../../api/ada/lib/cardanoCrypto/rustLoader';
import { dRepNormalize } from '../../../../api/ada/lib/cardanoCrypto/utils';
import { unwrapStakingKey } from '../../../../api/ada/lib/storage/bridge/utils';
import { getPrivateStakingKey } from '../../../../api/thunk';
import { DREP_ALWAYS_ABSTAIN, DREP_ALWAYS_NO_CONFIDENCE } from '../common/constants';
import { getFormattedPairingValue } from '../common/helpers';
import { useGovernanceManagerMaker } from '../common/useGovernanceManagerMaker';
import { GovernanceActionType, GovernanceReducer, defaultGovernanceActions, defaultGovernanceState } from './state';

type drepDelegation = { status: string | null; drep: string | null };
type GetCurrentPrice = (from: string, to: string) => number | Promise<number>;

type GovernanceAnalytics = {
  governanceChooseDrepPageViewed: () => void;
  governanceConfirmTransactionPageViewed: () => void;
  governanceTransactionSuccessPageViewed: () => void;
};

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
  submitedTransactions: [] as Array<{ isDrepDelegation: Boolean }>,
  ampli: null as GovernanceAnalytics | null,
  networkId: null,
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
  getCurrentPrice: GetCurrentPrice;
  ampli: GovernanceAnalytics;
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
  getCurrentPrice,
  ampli,
}: GovernanceProviderProps) => {
  if (!currentWallet?.selectedWallet) throw new Error(`requires a wallet to be selected`);
  const [state, dispatch] = React.useReducer(GovernanceReducer, {
    ...defaultGovernanceState,
  });
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
    isHardwareWallet,
    walletAdaBalance,
    backendServiceZero,
    recentTransactions,
    submitedTransactions,
    stakingAddress,
  } = currentWallet;
  const governanceManager = useGovernanceManagerMaker(walletId, networkId);

  const checkUserPassword = async (password: string): Promise<any> => {
    try {
      await getPrivateStakingKey({ publicDeriverId: walletId, password });
    } catch (error) {
      return error;
    }
  };

  React.useEffect(() => {
    const skey = unwrapStakingKey(stakingAddress).to_keyhash()?.to_hex();
    if (skey == null) {
      throw new Error(`missing staking key functionality`);
    }
    setStakingKeyHex(skey);
  }, [selectedWallet]);

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
    const governanceStatusState: any = await govApi.getAccountState(
      stakingAddress.substring(2) || '',
      stakingAddress.substring(2) || ''
    );
    const { drep, drepKind } = governanceStatusState?.drepDelegation ?? {};

    if (drep === 'abstain') {
      setGovernanceStatus({ status: DREP_ALWAYS_ABSTAIN, drep: null });
    } else if (drep === 'no_confidence') {
      setGovernanceStatus({ status: DREP_ALWAYS_NO_CONFIDENCE, drep: null });
    } else if (drep?.length > 0) {
      const encoded = dRepNormalize(drep, drepKind);
      setGovernanceStatus({ status: 'delegate', drep: encoded || null });
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
    stakingKeyHex,
    networkId,
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
    ampli,
  };

  return <GovernanceContext.Provider value={context}>{children}</GovernanceContext.Provider>;
};

export const useGovernance = () =>
  React.useContext(GovernanceContext) ?? console.log('useGovernance: needs to be wrapped in a GovernanceManagerProvider');
