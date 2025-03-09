import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { calculateAndFormatValue } from '../../../../utils/unit-of-account';
import type { TokenRow } from '../types/cardano';
import type { UnitOfAccountSettingType } from '../../../../types/unitOfAccountType';

interface UseFiatConversionProps {
  amount: BigNumber;
  tokenInfo: TokenRow;
  unitOfAccountSetting: UnitOfAccountSettingType;
  getCurrentPrice: (from: string, to: string) => string | null;
}

export const useFiatConversion = ({
  amount,
  tokenInfo,
  unitOfAccountSetting,
  getCurrentPrice,
}: UseFiatConversionProps) => {
  return useMemo(() => {
    if (!unitOfAccountSetting.enabled || !tokenInfo) {
      return { fiatAmount: null, currency: null };
    }

    const price = getCurrentPrice(tokenInfo.Metadata.ticker, unitOfAccountSetting.currency);
    if (!price) {
      return { fiatAmount: null, currency: null };
    }

    const fiatAmount = calculateAndFormatValue(
      amount,
      new BigNumber(price),
      tokenInfo.Metadata.numberOfDecimals
    );

    return {
      fiatAmount,
      currency: unitOfAccountSetting.currency
    };
  }, [amount, tokenInfo, unitOfAccountSetting, getCurrentPrice]);
}; 