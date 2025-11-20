import { useEffect, useRef } from 'react';
import { SwapActionType, useSwapRevamp } from '../../module/SwapContextProvider';

type UseWalletSwitchResetOptions = {
  /**
   * Optional callback to execute when wallet is switched.
   * Called after the form is reset.
   */
  onWalletSwitch?: () => void;
  /**
   * Optional wallet ID to use instead of getting it from stores.
   * Useful when you have direct access to the wallet object.
   */
  walletId?: number | null;
};

/**
 * Hook to automatically reset the swap form when the wallet is switched.
 * 
 * @param options - Configuration options for the hook
 * @returns void
 * 
 * @example
 * // Basic usage - resets form on wallet switch
 * useWalletSwitchReset();
 * 
 * @example
 * // With navigation callback
 * const navigateTo = useNavigateTo();
 * useWalletSwitchReset({
 *   onWalletSwitch: () => navigateTo.swapAssets()
 * });
 */
export const useWalletSwitchReset = (options: UseWalletSwitchResetOptions = {}) => {
  const { swapForm, stores } = useSwapRevamp();
  const { onWalletSwitch, walletId } = options;
  const previousWalletIdRef = useRef<number | null>(null);

  useEffect(() => {
    const currentWalletId = walletId ?? stores?.wallets?.selected?.publicDeriverId ?? null;
    
    if (previousWalletIdRef.current !== null && previousWalletIdRef.current !== currentWalletId) {
      swapForm.action({ type: SwapActionType.ResetForm });
      onWalletSwitch?.();
    }
    
    previousWalletIdRef.current = currentWalletId;
  }, [walletId, stores?.wallets?.selected?.publicDeriverId, swapForm.action, onWalletSwitch]);
};

