export const getNetworkUrl = (networkId: string | undefined): string => {
  if (networkId) {
    return isTestnet(Number(networkId)) ? 'https://testnet.cardanoscan.io/token' : 'https://cardanoscan.io/token';
  }
  return '';
};

export const isTestnet = (networkId: number): boolean => {
  return networkId !== 0;
};
