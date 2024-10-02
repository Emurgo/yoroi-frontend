export const getNetworkUrl = (networkId: number): any => {
  return isTestnet(networkId)
    ? {
        cardanoScan: 'https://testnet.cardanoscan.io/token',
        cexplorer: 'https://cexplorer.io/asset',
      }
    : { cardanoScan: 'https://cardanoscan.io/token', cexplorer: 'https://cexplorer.io/asset' };
};

export const isTestnet = (networkId: number): boolean => {
  return networkId !== 0;
};
