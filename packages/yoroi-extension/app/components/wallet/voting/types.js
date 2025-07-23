// @flow
import type { MessageDescriptor } from 'react-intl';
import type { ProgressStepEnum } from '../../../stores/ada/VotingStore';

export type WalletType = 'mnemonic' | 'trezorT' | 'ledgerNano';

export type StepsList = Array<{|
  step: ProgressStepEnum,
  message: MessageDescriptor,
|}>
