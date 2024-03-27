// @flow

// Transaction assurance represents the chance a transaction won’t be canceled by some fork.
// Read more at https://cardanodocs.com/cardano/transaction-assurance/

import type { AssuranceLevel, AssuranceMode, } from '../types/transactionAssurance.types';

type AssuranceModeOption = 'CWANormal' | 'CWAStrict';

export const assuranceModeOptions: {|
  NORMAL: AssuranceModeOption,
  STRICT: AssuranceModeOption,
|} = {
  NORMAL: 'CWANormal', STRICT: 'CWAStrict',
};

export const assuranceModes: {|
  /** Safe against covert adversaries */
  NORMAL: AssuranceMode,
  /** Safe against all adversaries */
  STRICT: AssuranceMode,
|} = {
  NORMAL: {
    low: 3,
    medium: 9,
  },
  STRICT: {
    low: 5,
    medium: 15,
  }
};

export const assuranceLevels: {|
  LOW: AssuranceLevel,
  MEDIUM: AssuranceLevel,
  HIGH: AssuranceLevel,
|} = {
  LOW: 'low', MEDIUM: 'medium', HIGH: 'high',
};
