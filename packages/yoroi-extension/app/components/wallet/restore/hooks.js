// @flow
import { useState } from 'react';
import type { WalletState } from '../../../../chrome/extension/background/types';


type RestoreWalletDataReturnValue = {|
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
  duplicatedWallet: null | WalletState,
  plates: Array<any>,
  setRestoreWalletData(data: any): void,
  resetRestoreWalletData(): void,
|};

const initialRestoreWalletData = {
  recoveryPhrase: '',
  walletName: '',
  walletPassword: '',
  plates: [],
  duplicatedWallet: null,
};

export function useRestoreWallet(): RestoreWalletDataReturnValue {
  const [restoreWallet, setRestoreWallet] = useState(initialRestoreWalletData);

  const setRestoreWalletData = data => {
    setRestoreWallet(prev => ({ ...prev, ...data }));
  };

  const resetRestoreWalletData = () => setRestoreWallet(initialRestoreWalletData);

  return {
    ...restoreWallet,
    setRestoreWalletData,
    resetRestoreWalletData,
  };
}
