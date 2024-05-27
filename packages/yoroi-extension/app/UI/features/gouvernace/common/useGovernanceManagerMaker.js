// @flow
import React from 'react';
import { governanceApiMaker, governanceManagerMaker, useStakingKeyState } from '@yoroi/staking';
import { RustModule } from '../../../../api/ada/lib/cardanoCrypto/rustLoader';

export const useGovernanceManagerMaker = (walletId: string, networkId: string): any => {
  //   const storage = useAsyncStorage();
  //   const governanceStorage = storage.join(`wallet/${walletId}/staking-governance/`);

  return React.useMemo(
    () =>
      governanceManagerMaker({
        walletId,
        networkId,
        api: governanceApiMaker({ networkId }),
        cardano: RustModule.CrossCsl.init,
        storage: '',
      }),
    [networkId, walletId]
  );
};
