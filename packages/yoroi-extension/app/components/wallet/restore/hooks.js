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

type TokenAmountValues = {|
  balance: string,
  unit: string,
  fiatBalance: string,
  fiatUnit: string,
|};

type UseDuplicatedWalletProps = {|
  getTokenInfo: any,
  currency: string,
  getCurrentPrice: any,
|};

export function useDuplicatedWallet({
  getTokenInfo,
  currency,
  getCurrentPrice,
}): UseDuplicatedWalletProps => TokenAmountValues {
  const getMainTokenAmount = () => {
    const { amount, shouldHideBalance } = request;
    if (amount == null) throw new Error('Amount is required to be rendered');

    const defaultEntry = amount.getDefaultEntry();
    const tokenInfo = getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    let balance = shouldHideBalance
      ? hiddenAmount
      : shiftedAmount.decimalPlaces(tokenInfo.Metadata.numberOfDecimals).toString();

    const unit = truncateToken(getTokenName(tokenInfo));

    let fiatUnit = '';
    let fiatBalance = shouldHideBalance ? hiddenAmount : '-';

    if (currency != null && currency.trim().length !== 0) {
      const ticker = tokenInfo.Metadata.ticker;

      if (ticker == null) throw new Error('unexpected main token type');

      const price = getCurrentPrice(ticker, currency);

      if (!shouldHideBalance && price != null) {
        fiatBalance = calculateAndFormatValue(shiftedAmount, price);
      }

      fiatUnit = currency;
    }

    return { balance, unit, fiatBalance, fiatUnit };
  };

  return {
    getMainTokenAmount,
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
