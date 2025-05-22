import type { StoresMap } from '../../../../stores';
import * as React from 'react';
import { observer } from 'mobx-react';
import { CatalystRegistrationContextType, StepAction, StepStateType } from '../common/types';
import { ProgressStep } from '../../../../stores/ada/VotingStore';
// import { getPrivateStakingKey } from '../../../../api/thunk';
import { StepState } from '../../../../components/widgets/ProgressSteps';

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
  // @ts-ignore
  dispatch: (action: StepAction) => {},
};

const defaultCatalystRegistrationActions = {
  generatePin: async () => {},
  // @ts-ignore
  createTransaction: async (password: string) => {},
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

type CatalystRegistrationState = {
  pin: number[];
  encryptedKey: string;
  catalystPrivateKey: string;
  isStale: boolean;
  error: string | null;
};

const defaultCatalystState: CatalystRegistrationState = {
  pin: [],
  encryptedKey: '',
  catalystPrivateKey: '',
  error: null,
  isStale: false,
};

export const CatalystRegistrationContextProvider = observer(({ children, stores }: CatalystRegistrationProviderProps) => {
  const { wallets, delegation, substores } = stores;
  const { votingStore: voting } = substores.ada;

  const selectedWallet = wallets.selected;
  const isDelegating = delegation.isCurrentlyDelegating(selectedWallet?.publicDeriverId);

  const [catalystState, setCatalystState] = React.useState<CatalystRegistrationState>(defaultCatalystState);

  const [stepState, dispatch] = React.useReducer(stepReducer, initialStepState);

  const contextState = {
    selectedWallet,
    isDelegating,
    voting,
    stepState,
    dispatch,
    registrationState: catalystState,
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
      createTransaction: async (password: string) => {
        if (!voting) throw new Error('Voting store not initialized');
        await voting.createTransaction(password);
      },
      checkUserPassword: async (password: string): Promise<void | any> => {
        try {
          console.log('checkUserPassword', password);
          // await getPrivateStakingKey({ publicDeriverId: selectedWallet?.publicDeriverId, password });
        } catch (error) {
          return error;
        }
      },
    }),
    [voting]
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
