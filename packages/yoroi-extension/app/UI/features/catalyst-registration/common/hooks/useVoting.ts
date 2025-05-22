import type { WalletTypes, CatalystRegistrationContextType, CatalystState } from '../types';
import { useCatalystRegistration } from '../../module/CatalystRegistrationContextProvider';
import { ProgressStep } from '../../../../../stores/ada/VotingStore';

export type VotingHookType = {
  startRegistration: () => void;
  resetRegistration: () => void;
  votingNextStep: (value?: string) => void;
  votingPrevStep: () => void;
  isDelegating: boolean;
  currentVotingStep: number;
  walletType: WalletTypes;
  registrationState: CatalystState;
  votingRegTx: any | null;
  votingKey: string | null;
};

export const useVoting = (): VotingHookType => {
  const context = useCatalystRegistration();
  const {
    selectedWallet,
    isDelegating,
    stepState,
    registrationState,
    generatePin,
    createTransaction,
    signTransaction,
    dispatch,
    setError,
    votingRegTx,
    voting,
    resetRegistration: resetReg,
  } = context as CatalystRegistrationContextType;

  const votingNextStep = async (value: string | null = null) => {
    switch (stepState.currentStep) {
      case -1:
      case ProgressStep.QR_CODE:
        dispatch({ type: 'RESET' });
        resetReg();
        break;
      case ProgressStep.GENERATE:
      case ProgressStep.CONFIRM:
        dispatch({ type: 'NEXT_STEP' });
        break;
      case ProgressStep.REGISTER:
        try {
          await createTransaction(value);
          setError(null);
          dispatch({ type: 'NEXT_STEP' });
        } catch (error: any) {
          setError(error);
        }
        break;
      case ProgressStep.TRANSACTION:
        try {
          await signTransaction(value);
          setError(null);
          dispatch({ type: 'NEXT_STEP' });
        } catch (error: any) {
          setError(error);
        }
        break;
    }
  };

  const votingPrevStep = async () => {
    if (stepState.currentStep === -1) return;

    if (stepState.currentStep === ProgressStep.CONFIRM) {
      dispatch({ type: 'PREVIOUS_STEP' });
      return;
    }

    if (stepState.currentStep === ProgressStep.TRANSACTION) {
      dispatch({ type: 'PREVIOUS_STEP' });
      return;
    }
  };

  const startRegistration = async () => {
    dispatch({ type: 'START_REGISTRATION' });
    await generatePin();
  };

  const resetRegistration = async () => {
    dispatch({ type: 'RESET' });
  };

  return {
    startRegistration,
    resetRegistration,
    votingNextStep,
    votingPrevStep,
    isDelegating,
    registrationState,
    votingRegTx,
    currentVotingStep: stepState.currentStep,
    walletType: (selectedWallet?.type as WalletTypes) ?? 'mnemonic',
    votingKey: voting?.encryptedKey,
  };
};

export { ProgressStep };
