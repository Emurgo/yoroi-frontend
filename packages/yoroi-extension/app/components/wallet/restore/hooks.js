import { useState } from 'react';
import { isDialogShownBefore, markDialogAsShown } from '../dialogs/utils';
import { TIPS_DIALOGS } from '../dialogs/constants';

export function useRestoreWallet() {
  const [restoreWallet, setRestoreWallet] = useState({
    recoveryPhrase: '',
    walletName: '',
    walletPassword: '',
    plates: [],
    isDuplicated: false,
  });

  const setRestoreWalletData = data => {
    setRestoreWallet(prev => ({ ...prev, ...data }));
  };

  return {
    ...restoreWallet,
    setRestoreWalletData,
  };
}

export function useDialogs() {
  const [dialogs, setDialogs] = useState({
    [TIPS_DIALOGS.LEARN_ABOUT_RECOVERY_PHRASE]: !isDialogShownBefore(
      TIPS_DIALOGS.LEARN_ABOUT_RECOVERY_PHRASE
    ),
    [TIPS_DIALOGS.SAVE_RECOVERY_PHRASE]: !isDialogShownBefore(TIPS_DIALOGS.SAVE_RECOVERY_PHRASE),
  });

  function showDialog(dialogId: string): void {
    setDialogs(prev => ({ ...prev, [dialogId]: true }));
  }

  function hideDialog(dialogId: string): void {
    markDialogAsShown(dialogId);
    setDialogs(prev => ({ ...prev, [dialogId]: false }));
  }
}
