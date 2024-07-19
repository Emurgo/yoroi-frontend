import React from 'react';
import { governanceApiMaker, governanceManagerMaker } from '@yoroi/staking';
// @ts-ignore
import { RustModule } from '../../../../api/ada/lib/cardanoCrypto/rustLoader';

export const useGovernanceManagerMaker = (walletId: string, networkId: string): any => {
  // TODO - sancho testnet networkId id 450 - can't use it for now as the network is not working
  // TODO - add proper storage for manager
  return React.useMemo(
    () =>
      governanceManagerMaker({
        walletId,
        networkId: Number(networkId),
        api: governanceApiMaker({ networkId: Number(networkId) }),
        cardano: RustModule.CrossCsl.init('any'),
        // @ts-ignore
        storage: 'wallet/${walletId}/staking-governance/',
      }),
    [networkId, walletId]
  );
};
