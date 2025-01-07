import { wrappedCsl } from './wrappedCsl';

export const deriveRewardAddressFromAddress = async (address: string, chainId: number): Promise<string> => {
  const { csl, release } = wrappedCsl();

  try {
    const result = await csl.Address.fromBech32(address)
      .then(address => csl.BaseAddress.fromAddress(address))
      .then(baseAddress => baseAddress?.stakeCred() ?? invalid('invalid base address'))
      .then(stakeCredential => csl.RewardAddress.new(chainId, stakeCredential))
      .then(rewardAddress => rewardAddress.toAddress())
      .then(rewardAddrAsAddress => rewardAddrAsAddress.toBech32(undefined))
      .catch(error => error);

    if (typeof result !== 'string') throw new Error('Its not possible to derive reward address');
    return result;
  } finally {
    release();
  }
};
