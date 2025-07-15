import type { WalletTypes, CatalystRegistrationContextType, CatalystState } from '../types';
import { useCatalystRegistration } from '../../module/CatalystRegistrationContextProvider';
import { ProgressStep } from '../../../../../stores/ada/VotingStore';
import { BigNumber } from 'bignumber.js';
import environment from '../../../../../environment';

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
  shouldHideBalance: boolean;
  tokenName: string;
  balanceAmount: BigNumber;
  votingMinAmount: BigNumber;
  cantRegister: boolean;
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
    shouldHideBalance,
    tokenDecimals,
    tokenName,
    balanceAmount,
    votingMinAmount,
    resetRegistration: resetReg,
  } = context as CatalystRegistrationContextType;

  const cantRegister = !environment.isTest() && balanceAmount.lt(votingMinAmount);

  const votingNextStep = async (value: string | null = null) => {
    setError(null);
    try {
      if (stepState.currentStep < 0 || stepState.currentStep === ProgressStep.QR_CODE) {
        dispatch({ type: 'RESET' });
        resetReg();
        return;
      }
      if (stepState.currentStep === ProgressStep.REGISTER) {
        await createTransaction(value);
      } else if (stepState.currentStep === ProgressStep.TRANSACTION) {
        await signTransaction(value);
      }
      dispatch({ type: 'NEXT_STEP' });
    } catch (error) {
      setError(error);
    }
  };

  const votingPrevStep = async () => {
    if (stepState.currentStep === -1) return;
    if (stepState.currentStep === ProgressStep.CONFIRM || stepState.currentStep === ProgressStep.TRANSACTION) {
      dispatch({ type: 'PREVIOUS_STEP' });
    }
  };

  const startRegistration = () => {
    dispatch({ type: 'START_REGISTRATION' });
    generatePin().catch(err => console.error('Catalyst [generatePin] failed', err));
  };

  const resetRegistration = () => {
    dispatch({ type: 'RESET' });
  };

  return {
    startRegistration,
    resetRegistration,
    votingNextStep: value => {
      votingNextStep(value).catch(err => console.error('Catalyst [votingNextStep] failed', err));
    },
    votingPrevStep: () => {
      votingPrevStep().catch(err => console.error('Catalyst [votingPrevStep] failed', err));
    },
    isDelegating,
    registrationState,
    votingRegTx,
    currentVotingStep: stepState.currentStep,
    walletType: (selectedWallet?.type as WalletTypes) ?? 'mnemonic',
    votingKey: voting?.encryptedKey,
    shouldHideBalance,
    tokenName,
    balanceAmount: balanceAmount.shiftedBy(-tokenDecimals),
    votingMinAmount: votingMinAmount.shiftedBy(-tokenDecimals),
    cantRegister,
  };
};

export { ProgressStep };
