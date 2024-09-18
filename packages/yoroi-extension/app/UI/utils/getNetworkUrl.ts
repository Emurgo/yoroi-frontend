export const getNetworkUrl = (networkId: number): string => {
  return isTestnet(networkId) ? 'https://testnet.cardanoscan.io/token' : 'https://cardanoscan.io/token';
};

export const isTestnet = (networkId: number): boolean => {
  return networkId !== 0;
};
