export const mapStakingKeyStateToGovernanceAction = (state: any) => {
  if (!state.drepDelegation) return null;
  const vote = state.drepDelegation;
  return vote.action === 'abstain'
    ? { kind: 'abstain' }
    : vote.action === 'no-confidence'
    ? { kind: 'no-confidence' }
    : { kind: 'delegate', drepID: vote.drepID };
};

const getStakePoolMeta = (stores: any) => {
  const publicDeriver = stores.wallets.selected;
  const delegationStore = stores.delegation;
  const currentPool = delegationStore.getDelegatedPoolId(publicDeriver);
  if (currentPool == null) return null;
  const networkInfo = publicDeriver.getParent().getNetworkInfo();
  const poolMeta = delegationStore.getLocalPoolInfo(networkInfo, currentPool);
  const poolInfo = delegationStore.getLocalRemotePoolInfo(networkInfo, currentPool) ?? {};
  if (poolMeta == null) {
    // server hasn't returned information about the stake pool yet
    return null;
  }
  const name = poolMeta.info?.name ?? 'unknown';
  const delegatedPool = {
    id: String(currentPool),
    name,
    websiteUrl: poolMeta.info?.homepage,
    ticker: poolMeta.info?.ticker,
    ...poolInfo,
  };

  return {
    ...delegatedPool,
    ...poolMeta,
  };
};

export const createCurrrentWalletInfo = (stores: any) => {
  const { wallets } = stores;
  const walletCurrentPoolInfo = getStakePoolMeta(stores);

  const selectedWallet = wallets.selected;
  if (selectedWallet == null) {
    throw new Error(`no selected Wallet. Should never happen`);
  }

  const currentWalletId = selectedWallet.getPublicDeriverId();
  const networkInfo = selectedWallet.getParent().getNetworkInfo();
  const networkId = networkInfo.NetworkId;
  const backendService = selectedWallet.getParent().getNetworkInfo().Backend.BackendService;
  return {
    currentPool: walletCurrentPoolInfo,
    networkId,
    walletId: currentWalletId,
    selectedWallet: selectedWallet,
    backendService,
  };
};
