import type { StoresMap } from '../../../../stores';
import * as React from 'react';
import { observer } from 'mobx-react';
import { CatalystRegistrationContextType, StepAction, StepStateType, CatalystState } from '../common/types';
import { ProgressStep } from '../../../../stores/ada/VotingStore';
import { getTokenName, genFormatTokenAmount, genLookupOrFail } from '../../../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../../../utils/formatters';
import { StepState } from '../../../../components/widgets/ProgressSteps';
import { ROUTES } from '../../../../routes-config';
import { CATALYST_MIN_AMOUNT } from '../../../../config/numbersConfig';
import { BigNumber } from 'bignumber.js';

const initialStepState: StepState = {
  currentStep: -1,
  stepState: StepState.LOAD,
  error: null,
};

function stepReducer(state: StepStateType, action: StepAction): StepStateType {
  switch (action.type) {
    case 'START_REGISTRATION':
      return {
        ...state,
        currentStep: ProgressStep.GENERATE,
        stepState: StepState.LOAD,
        error: null,
      };
    case 'NEXT_STEP':
      if (state.currentStep === -1) return state;

      const nextStep = state.currentStep + 1;
      if (nextStep > ProgressStep.QR_CODE) return state;

      return {
        ...state,
        currentStep: nextStep,
        stepState: StepState.LOAD,
        error: null,
      };
    case 'PREVIOUS_STEP':
      if (state.currentStep <= ProgressStep.GENERATE) return state;

      return {
        ...state,
        currentStep: state.currentStep - 1,
        stepState: StepState.LOAD,
        error: null,
      };
    case 'RESET':
      return initialStepState;
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        stepState: StepState.ERROR,
      };
    case 'SET_STEP_STATE':
      return {
        ...state,
        stepState: action.stepState,
      };
    default:
      return state;
  }
}

const defaultCatalystRegistrationValues = {
  selectedWallet: null,
  voting: null,
  isDelegating: false,
  stepState: initialStepState,
  registrationState: null,
  shouldHideBalance: false,
  tokenDecimals: 0,
  tokenName: '',
  balanceAmount: new BigNumber(0),
  votingMinAmount: new BigNumber(0),
  votingRegTx: {},
  // @ts-ignore
  dispatch: (action: StepAction) => {},
};

const defaultCatalystRegistrationActions = {
  generatePin: async () => {},
  resetRegistration: () => {},
  // @ts-ignore
  createTransaction: async (password: string | null) => {},
  // @ts-ignore
  signTransaction: async (password: string | null) => {},
  // @ts-ignore
  setError: (error: string | null) => {},
};

const defaultCatalystRegistrationState = {
  ...defaultCatalystRegistrationValues,
  ...defaultCatalystRegistrationActions,
};

export const CatalystRegistrationContext = React.createContext<CatalystRegistrationContextType>(defaultCatalystRegistrationState);

type CatalystRegistrationProviderProps = {
  children: React.ReactNode;
  stores: StoresMap;
};

const defaultCatalystState: CatalystState = {
  pin: [],
  encryptedKey: '',
  catalystPrivateKey: '',
  error: null,
  isStale: false,
};

// currentBalance={balance
//   .getDefaultEntry()
//   .amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals)}
// requiredBalance={CATALYST_MIN_AMOUNT.shiftedBy(
//   -tokenInfo.Metadata.numberOfDecimals
// )}
// tokenName={getTokenName(tokenInfo)}

export const CatalystRegistrationContextProvider = observer(({ children, stores }: CatalystRegistrationProviderProps) => {
  const { wallets, delegation, substores, tokenInfoStore, app, profile, transactions } = stores;
  const { votingStore: voting } = substores.ada;

  const balance = transactions.balance.getDefaultEntry();

  const getTokenInfo = genLookupOrFail(tokenInfoStore.tokenInfo);
  const selectedWallet = wallets.selected;
  const isDelegating = delegation.isCurrentlyDelegating(selectedWallet?.publicDeriverId);
  const defaultTokenInfo = getTokenInfo({
    identifier: selectedWallet?.defaultTokenId,
    networkId: selectedWallet?.networkId,
  });
  const tokenName = getTokenName(defaultTokenInfo);

  // voting tx info
  const createVotingRegTx = voting.createVotingRegTx.result;
  const isExecuting = voting.createVotingRegTx.isExecuting;

  let votingRegTx = {};
  if (createVotingRegTx) {
    const tokenInfo = getTokenInfo(createVotingRegTx?.fee().getDefaultEntry());
    const decimalPlaces = tokenInfo.Metadata.numberOfDecimals;
    const currency = truncateToken(getTokenName(tokenInfo));
    const formatValue = genFormatTokenAmount(getTokenInfo);
    const fees = formatValue(createVotingRegTx?.fee().getDefaultEntry());

    votingRegTx = {
      decimalPlaces,
      currency,
      fees,
      isExecuting,
    };
  }

  const [catalystState, setCatalystState] = React.useState<CatalystState>(defaultCatalystState);

  const [stepState, dispatch] = React.useReducer(stepReducer, initialStepState);

  const contextState = {
    selectedWallet,
    isDelegating,
    voting,
    stepState,
    balanceAmount: balance.amount,
    votingMinAmount: CATALYST_MIN_AMOUNT,
    shouldHideBalance: profile.shouldHideBalance,
    tokenDecimals: defaultTokenInfo.Metadata.numberOfDecimals,
    tokenName,
    dispatch,
    registrationState: catalystState,
    votingRegTx,
  };

  const state = React.useMemo(
    () => ({
      ...defaultCatalystRegistrationValues,
      ...contextState,
    }),
    [contextState]
  );

  const actions = React.useMemo(
    () => ({
      generatePin: async () => {
        if (!voting) throw new Error('Voting store not initialized');
        await voting.generateCatalystKey();
        setCatalystState({ ...catalystState, pin: voting.pin });
      },
      // @ts-ignore
      createTransaction: async (password: string | null) => {
        if (!voting) throw new Error('Voting store not initialized');
        await voting.createTransaction(password);
      },
      signTransaction: async (password: string | null) => {
        await voting.signTransaction({ password, wallet: selectedWallet });
      },
      setError: (error: string | null) => {
        setCatalystState({ ...catalystState, error });
      },
      resetRegistration: () => {
        app.goToRoute({ route: ROUTES.WALLETS.TRANSACTIONS });
        voting?.reset({ justTransaction: false });
      },
    }),
    [voting, catalystState]
  );

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions]
  );

  return <CatalystRegistrationContext.Provider value={context}>{children}</CatalystRegistrationContext.Provider>;
});

export const useCatalystRegistration = () =>
  React.useContext<CatalystRegistrationContextType>(CatalystRegistrationContext) ??
  console.log('useCatalystRegistration: needs to be wrapped in a CatalystRegistrationContextProvider');
