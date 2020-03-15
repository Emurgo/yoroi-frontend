// @flow

import React from 'react';
import BigNumber from 'bignumber.js';
import { boolean, select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withScreenshot } from 'storycap';
import {
  globalKnobs,
  walletLookup,
  genSigningWalletWithCache,
} from '../../../../stories/helpers/StoryWrapper';
import type {
  CacheValue
} from '../../../../stories/helpers/StoryWrapper';
import CachedRequest from '../../../stores/lib/LocalizedCachedRequest';
import type { GetBalanceFunc } from '../../../api/ada/index';
import StakingDashboardPage from './StakingDashboardPage';
import { ServerStatusErrors } from '../../../types/serverStatusErrorType';
import { mockWalletProps } from '../Wallet.mock';
import { getVarsForTheme } from '../../../stores/toplevel/ProfileStore';
import { getDefaultExplorer } from '../../../domain/Explorer';
import { buildRoute } from '../../../utils/routing';
import { ROUTES } from '../../../routes-config';
import { THEMES } from '../../../themes';
import { GenericApiError, } from '../../../api/common';
import { wrapWallet } from '../../../Routes';
import type {
  GetDelegatedBalanceFunc,
  GetCurrentDelegationFunc,
} from '../../../api/ada/lib/storage/bridge/delegationUtils';
import type {
  RewardHistoryForWallet
} from '../../../stores/ada/DelegationStore';

export default {
  title: `${module.id.split('.')[1]}`,
  component: StakingDashboardPage,
  decorators: [withScreenshot],
};

const getRoute = (id) => buildRoute(
  ROUTES.WALLETS.DELEGATION_DASHBOARD,
  { id, }
);

const genBaseProps: {|
  wallet: CacheValue,
  lookup: *,
  transactionBuilderStore?: *,
|} => * = (request) => {
  const mangledCases = {
    NoMangled: [],
    HasMangled: [new BigNumber(0)],
  };
  const getMangledValue = () => select(
    'hasManged',
    mangledCases,
    mangledCases.NoMangled
  );
  const sendErrorCases = {
    None: undefined,
    Error: new GenericApiError(),
  };
  const sendErrorValue = () => select(
    'sendError',
    sendErrorCases,
    sendErrorCases.None
  );
  return {
    stores: {
      profile: {
        isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
        selectedExplorer: getDefaultExplorer(),
        shouldHideBalance: false, // TODO
        getThemeVars: getVarsForTheme,
      },
      wallets: {
        selected: request.wallet.publicDeriver,
      },
      uiDialogs: {
        isOpen: () => false, // TODO
        getParam: () => (undefined: any), // TODO
      },
      uiNotifications: {
        isOpen: () => false, // TODO
        getTooltipActiveNotification: () => null, // TODO
      },
      substores: {
        ada: {
          addresses: {
            getUnmangleAmounts: () => ({
              canUnmangle: true // TODO
                ? []
                : [],
              cannotUnmangle: [],
            }),
          },
          time: {
            getTimeCalcRequests: request.lookup.getTimeCalcRequests,
            getCurrentTimeRequests: request.lookup.getCurrentTimeRequests,
          },
          delegation: {
            getDelegationRequests: request.lookup.getDelegation,
            poolReputation: {
              result: { // TODO
                a: {
                  node_flags: 0, // TODO
                }
              },
            },
          },
          transactions: {
            hasAnyPending: false, // TODO
            getTxRequests: request.lookup.getTransactions,
          },
          delegationTransaction: {
            isStale: false, // TODO
            createDelegationTx: {
              isExecuting: false, // TODO
              error: undefined, // TODO
              result: undefined, // TODO
            },
            signAndBroadcastDelegationTx: {
              error: undefined, // TODO
              isExecuting: false, // TODO
            },
          },
        },
      },
    },
    actions: {
      dialogs: {
        closeActiveDialog: {
          trigger: action('closeActiveDialog'),
        },
        open: {
          trigger: action('closeActiveDialog'),
        },
      },
      notifications: {
        open: {
          trigger: action('closeActiveDialog'),
        },
      },
      ada: {
        delegationTransaction: {
          reset: {
            trigger: action('closeActiveDialog'),
          },
          signTransaction: {
            trigger: async (req) => action('closeActiveDialog')(req),
          },
          createTransaction: {
            trigger: async (req) => action('closeActiveDialog')(req),
          },
        },
      },
    },
    EpochProgressContainerProps: {
      generated: {
        stores: {
          substores: {
            ada: {
              time: {
                getTimeCalcRequests: request.lookup.getTimeCalcRequests,
                getCurrentTimeRequests: request.lookup.getCurrentTimeRequests,
              },
            },
          },
        },
      },
    },
    UnmangleTxDialogContainerProps: {
      generated: {
        stores: {
          profile: {
            isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
            selectedExplorer: getDefaultExplorer(),
          },
          wallets: {
            selected: request.wallet.publicDeriver,
          },
          substores: {
            ada: {
              wallets: {
                sendMoneyRequest: request.transactionBuilderStore == null
                  ? {
                    reset: action('reset'),
                    error: undefined,
                    isExecuting: false,
                  }
                  : {
                    reset: action('reset'),
                    error: sendErrorValue() === sendErrorCases.None
                      ? undefined
                      : sendErrorValue(),
                    isExecuting: boolean('isExecuting', false),
                  },
              },
              addresses: {
                mangledAddressesForDisplay: {
                  all: [], // TODO
                },
              },
              transactionBuilderStore: request.transactionBuilderStore || (null: any),
            },
          },
        },
        actions: {
          ada: {
            txBuilderActions: {
              reset: {
                trigger: action('reset'),
              },
            },
            wallets: {
              sendMoney: {
                trigger: async (req) => action('sendMoney')(req),
              },
            },
          },
        },
      },
    }
  };
};

export const Dashboard = () => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();

    const utxoBalance = new BigNumber(3);
    const getDelegatedBalance: CachedRequest<GetDelegatedBalanceFunc> = new CachedRequest(_request => Promise.resolve({
      utxoPart: utxoBalance,
      accountPart: new BigNumber(5),
    }));
    const getCurrentDelegation: CachedRequest<GetCurrentDelegationFunc> = new CachedRequest(_request => Promise.resolve({
      currEpoch: undefined,
      prevEpoch: undefined,
      prevPrevEpoch: undefined,
      fullHistory: [],
    }));
    const rewardHistory: CachedRequest<RewardHistoryForWallet> = new CachedRequest(_request => Promise.resolve([
    ]));
    const balance: CachedRequest<GetBalanceFunc> = new CachedRequest(_request => Promise.resolve(
      utxoBalance,
    ));
    const calculationCases = {
      Pending: 0,
      Calculated: 1,
    };
    const getTimeValue = () => select(
      'timeCases',
      calculationCases,
      calculationCases.Calculated
    );
    if (getTimeValue() === calculationCases.Calculated) {
      wallet.getTimeCalcRequests(wallet.publicDeriver);
      balance.execute((null: any));
    }
    const getBalanceValue = () => select(
      'balanceCases',
      calculationCases,
      calculationCases.Calculated
    );
    if (getBalanceValue() === calculationCases.Calculated) {
      balance.execute((null: any));
    }
    const delegatedBalanceCases = {
      Pending: 0,
      Calculated: 1,
    };
    const getDelegatedBalanceValue = () => select(
      'delegatedBalanceCases',
      delegatedBalanceCases,
      delegatedBalanceCases.Calculated
    );
    if (getDelegatedBalanceValue() === delegatedBalanceCases.Calculated) {
      getDelegatedBalance.execute((null: any));
    }
    const getCurrentDelegationCases = {
      Pending: 0,
      Calculated: 1,
    };
    const getCurrentDelegationValue = () => select(
      'currentDelegation',
      getCurrentDelegationCases,
      getCurrentDelegationCases.Calculated
    );
    if (getCurrentDelegationValue() === getCurrentDelegationCases.Calculated) {
      getCurrentDelegation.execute((null: any));
    }
    wallet.getDelegation = (publicDeriver) => ({
      publicDeriver,
      getDelegatedBalance,
      getCurrentDelegation,
      rewardHistory,
      error: undefined, // TODO
      stakingKeyState: undefined, // TODO
    });
    const oldResults = wallet.getTransactions(wallet.publicDeriver);
    wallet.getTransactions = (_req) => ({
      ...oldResults,
      requests: {
        ...oldResults.requests,
        getBalanceRequest: balance,
      },
    });
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
    (<StakingDashboardPage
      generated={genBaseProps({
        wallet,
        lookup,
      })}
    />)
  );
};
