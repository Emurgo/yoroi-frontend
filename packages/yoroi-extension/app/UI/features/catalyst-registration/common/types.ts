import type { PublicDeriver } from '../../../../api/ada/lib/storage/models/PublicDeriver';
import type { VotingStore } from '../../../../stores/ada/VotingStore';
import { StepState } from '../../../../components/widgets/ProgressSteps';

export type StepAction =
  | { type: 'START_REGISTRATION' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'RESET' }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_STEP_STATE'; stepState: typeof StepState[keyof typeof StepState] };

export type StepStateType = {
  currentStep: number;
  stepState: typeof StepState[keyof typeof StepState];
  error: string | null;
};

type CatalystRegistrationState = {
  selectedWallet: PublicDeriver | null;
  voting: VotingStore | null;
  isDelegating: boolean;
  stepState: StepStateType;
  registrationState: any;
  dispatch: (action: StepAction) => void;
};

type CatalystRegistrationActions = {
  generatePin: () => Promise<void>;
  createTransaction: (password: string) => Promise<void>;
};

export type CatalystRegistrationContextType = CatalystRegistrationState & CatalystRegistrationActions;

export type WalletTypes = 'mnemonic' | 'ledger' | 'trezor';
