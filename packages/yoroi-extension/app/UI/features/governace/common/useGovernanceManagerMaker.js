// @flow
import React from 'react';
import { governanceApiMaker, governanceManagerMaker, useStakingKeyState } from '@yoroi/staking';
import { RustModule } from '../../../../api/ada/lib/cardanoCrypto/rustLoader';

export const useGovernanceManagerMaker = (walletId: string, networkId: string): any => {
  // TODO - sancho testnet networkId id 450 - can't use it for now as the network is not working
  // TODO - add proper storage for manager
  return React.useMemo(
    () =>
      governanceManagerMaker({
        walletId,
        networkId,
        api: governanceApiMaker({ networkId }),
        cardano: RustModule.CrossCsl.init('any'),
        storage: 'wallet/${walletId}/staking-governance/',
      }),
    [networkId, walletId]
  );
};
