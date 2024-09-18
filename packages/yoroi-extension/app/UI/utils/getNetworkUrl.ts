export const getNetworkUrl = (networkId: number | undefined): string => {
  if (networkId) {
    return isTestnet(networkId) ? 'https://testnet.cardanoscan.io/token' : 'https://cardanoscan.io/token';
  }
  return '';
};

export const isTestnet = (networkId: number): boolean => {
  return networkId !== 0;
};
