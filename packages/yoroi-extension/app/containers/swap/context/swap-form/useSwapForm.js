import { useContext, useEffect, useState } from 'react';
import SwapFormContext from './context';

export default function useSwapForm() {
  const context = useContext(SwapFormContext);

  if (context === undefined) {
    throw new Error('useSwapForm must be used within a SwapFormProvider');
  }

  const { state = {}, actions } = context;

  return { ...state, ...actions };
}
