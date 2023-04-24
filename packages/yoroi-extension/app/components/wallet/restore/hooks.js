// @flow
import { useState } from 'react';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';

type RestoreWalletDataReturnValue = {|
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
  duplicatedWallet: null | PublicDeriver<>,
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
