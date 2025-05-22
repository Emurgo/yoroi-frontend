import type { WalletTypes, CatalystRegistrationContextType } from '../types';
import { useCatalystRegistration } from '../../module/CatalystRegistrationContextProvider';
import { ProgressStep } from '../../../../../stores/ada/VotingStore';

export { ProgressStep };

export type VotingHookType = {
  startRegistration: () => void;
  resetRegistration: () => void;
  votingNextStep: () => void;
  votingPrevStep: () => void;
  isDelegating: boolean;
  currentVotingStep: number;
  walletType: WalletTypes;
  registrationPin: string;
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
    dispatch,
  } = context as CatalystRegistrationContextType;

  const votingNextStep = async (value?: string) => {
    if (!registrationState) throw new Error('Registration state not initialized');
    console.log('votingNextStep', value);

    switch (stepState.currentStep) {
      case -1:
      case ProgressStep.QR_CODE:
        dispatch({ type: 'RESET' });
        break;
      case ProgressStep.GENERATE:
      case ProgressStep.CONFIRM:
      case ProgressStep.TRANSACTION:
        dispatch({ type: 'NEXT_STEP' });
        break;
      case ProgressStep.REGISTER:
        await createTransaction(value || '');
        dispatch({ type: 'NEXT_STEP' });
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
    currentVotingStep: stepState.currentStep,
    walletType: (selectedWallet?.type as WalletTypes) ?? 'mnemonic',
    registrationPin: registrationState?.pin.join('') ?? '',
  };
};
