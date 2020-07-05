// @flow

import type { Node } from 'react';
import React from 'react';
import BigNumber from 'bignumber.js';
import { boolean, select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withScreenshot } from 'storycap';
import {
  globalKnobs,
  walletLookup,
  genSigningWalletWithCache,
  genUndelegateTx,
} from '../../../../stories/helpers/StoryWrapper';
import type {
  CacheValue
} from '../../../../stories/helpers/StoryWrapper';
import CachedRequest from '../../../stores/lib/LocalizedCachedRequest';
import StakingPage from './StakingPage';
import { mockWalletProps } from '../Wallet.mock';
import { defaultToSelectedExplorer } from '../../../domain/SelectedExplorer';
import { buildRoute } from '../../../utils/routing';
import { ROUTES } from '../../../routes-config';
import { THEMES } from '../../../themes';
import { GenericApiError, } from '../../../api/common/errors';
import { wrapWallet } from '../../../Routes';
import type {
  GetDelegatedBalanceFunc,
  GetCurrentDelegationFunc,
} from '../../../api/ada/lib/storage/bridge/delegationUtils';
import type {
  RewardHistoryForWallet,
  DelegationRequests,
} from '../../../stores/ada/DelegationStore';

export default {
  title: `${__filename.split('.')[0]}`,
  component: StakingPage,
  decorators: [withScreenshot],
};

const getRoute = (id) => buildRoute(
  ROUTES.WALLETS.DELEGATION_SIMPLE,
  { id, }
);

const genBaseProps: {|
  wallet: CacheValue,
  lookup: *,
  hasPending?: boolean,
  signAndBroadcastDelegationTx?: *,
  createDelegationTx?: *,
  selectedPools?: *,
|} => * = (request) => {
  return {
    stores: {
      profile: {
        currentLocale: globalKnobs.locale(),
      },
      wallets: {
        selected: request.wallet.publicDeriver,
      },
      transactions: {
        getTxRequests: request.lookup.getTransactions,
        hasAnyPending: request.hasPending || false,
      },
      substores: {
        ada: {
          delegation: {
            getDelegationRequests: request.lookup.getDelegation,
          },
          delegationTransaction: {
            signAndBroadcastDelegationTx: request.signAndBroadcastDelegationTx == null
              ? {
                isExecuting: false,
                wasExecuted: false,
              }
              : {
                isExecuting: request.signAndBroadcastDelegationTx.isExecuting,
                wasExecuted: request.signAndBroadcastDelegationTx.wasExecuted,
              },
          },
        },
      },
    },
    actions: {
      ada: {
        delegationTransaction: {
          reset: { trigger: action('reset'), },
        },
      },
    },
    SeizaFetcherProps: {
      generated: {
        stores: {
          explorers: {
            selectedExplorer: defaultToSelectedExplorer(),
          },
          profile: {
            isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
          },
          wallets: {
            selected: request.wallet.publicDeriver,
          },
          substores: {
            ada: {
              delegationTransaction: {
                selectedPools: request.selectedPools != null ? request.selectedPools : [],
                isStale: request.createDelegationTx == null
                  || request.createDelegationTx.result == null
                  || request.signAndBroadcastDelegationTx?.wasExecuted === true
                  ? false
                  : boolean('isStale', false),
                createDelegationTx: request.createDelegationTx == null
                  ? {
                    result: undefined,
                    error: undefined,
                    isExecuting: false,
                  }
                  : request.createDelegationTx,
                signAndBroadcastDelegationTx: request.signAndBroadcastDelegationTx == null
                  ? {
                    error: undefined,
                    isExecuting: false,
                    wasExecuted: false,
                  }
                  : request.signAndBroadcastDelegationTx,
              }
            },
          },
        },
        actions: {
          ada: {
            delegationTransaction: {
              createTransaction: {
                trigger: async (req) => action('createTransaction')(req),
              },
              signTransaction: {
                trigger: async (req) => action('signTransaction')(req),
              },
              complete: { trigger: action('complete'), },
              reset: { trigger: action('reset'), },
              setPools: { trigger: action('setPools'), },
            },
          },
        },
      },
    },
  };
};

function getStakingInfo(
  publicDeriver: *,
): DelegationRequests {
  const poolInfo = new Map();
  const accountBalance = new BigNumber(4);
  const getDelegatedBalance: CachedRequest<GetDelegatedBalanceFunc> = new CachedRequest(
    _request => Promise.resolve({
      utxoPart: new BigNumber(3),
      accountPart: accountBalance,
    })
  );
  const getCurrentDelegation: CachedRequest<GetCurrentDelegationFunc> = new CachedRequest(
    _request => Promise.resolve({
      currEpoch: undefined,
      prevEpoch: undefined,
      prevPrevEpoch: undefined,
      fullHistory: [],
    })
  );
  const rewardHistory: CachedRequest<RewardHistoryForWallet> = new CachedRequest(
    async _request => []
  );
  getDelegatedBalance.execute((null: any));
  getCurrentDelegation.execute((null: any));
  rewardHistory.execute((null: any));
  return {
    publicDeriver,
    getDelegatedBalance,
    getCurrentDelegation,
    rewardHistory,
    error: undefined,
    stakingKeyState: {
      state: {
        counter: 0,
        delegation: {
          pools: [],
        },
        value: accountBalance.toNumber()
      },
      selectedPool: 0,
      poolInfo,
    },
  };
}

export const Frame = (): Node => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();
    const computedDelegation = getStakingInfo(
      wallet.publicDeriver,
    );
    wallet.getDelegation = (_publicDeriver) => computedDelegation;
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (<StakingPage
      urlTemplate="localhost://no-frame-when-testing"
      generated={genBaseProps({
        wallet,
        lookup,
      })}
    />)
  );
};

export const PendingTransaction = (): Node => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();
    const computedDelegation = getStakingInfo(
      wallet.publicDeriver,
    );
    wallet.getDelegation = (_publicDeriver) => computedDelegation;
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (<StakingPage
      urlTemplate="localhost://no-frame-when-testing"
      generated={genBaseProps({
        wallet,
        lookup,
        hasPending: true,
      })}
    />)
  );
};

export const TransactionIsExecuting = (): Node => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();
    const computedDelegation = getStakingInfo(
      wallet.publicDeriver,
    );
    wallet.getDelegation = (_publicDeriver) => computedDelegation;
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (<StakingPage
      urlTemplate="localhost://no-frame-when-testing"
      generated={genBaseProps({
        wallet,
        lookup,
        createDelegationTx: {
          result: undefined,
          error: undefined,
          isExecuting: true,
        },
      })}
    />)
  );
};

export const TransactionError = (): Node => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();
    const computedDelegation = getStakingInfo(
      wallet.publicDeriver,
    );
    wallet.getDelegation = (_publicDeriver) => computedDelegation;
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (<StakingPage
      urlTemplate="localhost://no-frame-when-testing"
      generated={genBaseProps({
        wallet,
        lookup,
        createDelegationTx: {
          result: undefined,
          error: new GenericApiError(),
          isExecuting: false,
        },
      })}
    />)
  );
};

export const Transaction = (): Node => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();
    const computedDelegation = getStakingInfo(
      wallet.publicDeriver,
    );
    wallet.getDelegation = (_publicDeriver) => computedDelegation;
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const metaCases = {
    HasMeta: 0,
    NoMeta: 1,
  };
  const metaValue = select(
    'poolMeta',
    metaCases,
    metaCases.HasMeta,
  );
  const errorCases = {
    HasError: 0,
    NoError: 1,
  };
  const errorValue = select(
    'errorCases',
    errorCases,
    errorCases.NoError,
  );
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (<StakingPage
      urlTemplate="localhost://no-frame-when-testing"
      generated={genBaseProps({
        wallet,
        lookup,
        signAndBroadcastDelegationTx: {
          error: errorValue === errorCases.NoError
            ? undefined
            : new GenericApiError(),
          isExecuting: boolean('isExecuting', false),
          wasExecuted: false,
        },
        selectedPools: [{
          name: metaValue === metaCases.HasMeta
            ? 'EMURGO’ STAKEPOOL'
            : null,
          poolHash: 'f989090208512a2d56aed13b81c98407b10ba04fde3b8d4a3442b8b25368f512',
        }],
        createDelegationTx: {
          result: {
            unsignedTx: genUndelegateTx(),
            totalAmountToDelegate: new BigNumber(1000000),
          },
          error: undefined,
          isExecuting: false,
        },
      })}
    />)
  );
};

export const DelegationSuccess = (): Node => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();
    const computedDelegation = getStakingInfo(
      wallet.publicDeriver,
    );
    wallet.getDelegation = (_publicDeriver) => computedDelegation;
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (<StakingPage
      urlTemplate="localhost://no-frame-when-testing"
      generated={genBaseProps({
        wallet,
        lookup,
        signAndBroadcastDelegationTx: {
          error: undefined,
          isExecuting: false,
          wasExecuted: true,
        },
        selectedPools: [],
        createDelegationTx: {
          result: {
            unsignedTx: genUndelegateTx(),
            totalAmountToDelegate: new BigNumber(100),
          },
          error: undefined,
          isExecuting: false,
        },
      })}
    />)
  );
};
