import BigNumber from 'bignumber.js';

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
  // const tokenPercentages = useMemo(() => {
  //   if (!tokens || tokens.length === 0) return {};

  //   const totalQuantity = tokens.reduce((acc, token) => {
  //     return acc.plus(token.quantity);
  //   }, new BigNumber(0));

  //   return tokens.reduce((acc, token) => {
  //     const percentage = totalQuantity.isZero() ? '0.00' : token.quantity.dividedBy(totalQuantity).multipliedBy(100).toFixed(2);

  //     return {
  //       ...acc,
  //       [token.info.id]: percentage,
  //     };
  //   }, {} as any);
  // }, [tokens]);

  return {
    // @ts-ignore
    '': '82.37',
    '533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0.494e4459': '1.11',
    '9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77.53554e444145': '9.87',
    '420000029ad9527271b1b1e3c27ee065c18df70a4a4cfc3093a41a44.41584f': '0.54',
    '208a2ca888886921513cb777bb832a8dc685c04de990480151f12150.53484942414441': '0.00',
    '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '2.53',
    'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950': '1.96',
    'f43a62fdc3965df486de8a0d32fe800963589c41b38946602a0dc535.41474958': '1.62',
  };
};
