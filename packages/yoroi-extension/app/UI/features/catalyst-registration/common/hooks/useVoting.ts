import { useEffect, useState } from 'react';
import { useCatalystRegistration } from '../../module/CatalystRegistrationContextProvider';

type WalletTypes = 'mnemonic' | 'ledger' | 'trezor';

type VotingHookType = {
  loading: boolean;
  walletType: WalletTypes;
  isDelegating: boolean;
};

export const useVoting = (): VotingHookType => {
  const { selectedWallet, isDelegating } = useCatalystRegistration();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedWallet == null) {
      return;
    }

    setLoading(false);
  }, []);

  return {
    loading,
    walletType: (selectedWallet?.type as WalletTypes) ?? 'mnemonic',
    isDelegating,
  };
};
