import { useState } from 'react';
import { isDialogShownBefore, markDialogAsShown } from '../dialogs/utils';
import { TIPS_DIALOGS } from '../dialogs/constants';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import { getTokenName } from '../../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../../utils/formatters';

const initialRestoreWalletData = {
  recoveryPhrase: '',
  walletName: '',
  walletPassword: '',
  plates: [],
  isDuplicated: false,
};

export function useRestoreWallet() {
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
