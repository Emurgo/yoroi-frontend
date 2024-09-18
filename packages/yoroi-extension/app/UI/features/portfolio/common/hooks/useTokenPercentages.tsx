import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

type Token = {
  id: string;
  info: {
    name: string;
    [key: string]: any;
  };
  quantity: BigNumber;
  [key: string]: any;
};

type TokenWithPercentage = Token & {
  percentage: number;
};

export const useTokenPercentages = (tokens: any[]): TokenWithPercentage[] => {
  const tokenPercentages = useMemo(() => {
    if (!tokens || tokens.length === 0) return {};

    const totalQuantity = tokens.reduce((acc, token) => {
      return acc.plus(token.quantity);
    }, new BigNumber(0));

    return tokens.reduce((acc, token) => {
      const percentage = totalQuantity.isZero() ? '0.00' : token.quantity.dividedBy(totalQuantity).multipliedBy(100).toFixed(2);

      return {
        ...acc,
        [token.info.id]: percentage,
      };
    }, {} as any);
  }, [tokens]);

  return tokenPercentages;
};
