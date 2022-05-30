// @flow

import type { Node } from 'react';
import BigNumber from 'bignumber.js';
import { boolean, select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withScreenshot } from 'storycap';
import {
  globalKnobs,
  genUnitOfAccount,
} from '../../../../stories/helpers/StoryWrapper';
import {
  genJormungandrSigningWalletWithCache,
  genJormungandrUndelegateTx,
  genTentativeJormungandrTx,
} from '../../../../stories/helpers/jormungandr/JormungandrMocks';
import {
  genShelleyCIP1852SigningWalletWithCache,
  genWithdrawalTx,
} from '../../../../stories/helpers/cardano/ShelleyCip1852Mocks';
import {
  walletLookup
} from '../../../../stories/helpers/WalletCache';
import type {
  PossibleCacheTypes
} from '../../../../stories/helpers/WalletCache';
import CachedRequest from '../../../stores/lib/LocalizedCachedRequest';
import type { GetBalanceFunc } from '../../../api/common/types';
import StakingDashboardPage from './StakingDashboardPage';
import { mockWalletProps } from '../Wallet.mock';
import { defaultToSelectedExplorer } from '../../../domain/SelectedExplorer';
import { buildRoute } from '../../../utils/routing';
import { ROUTES } from '../../../routes-config';
import { THEMES } from '../../../styles/utils';
import { wrapWallet } from '../../../Routes';
import type {
  GetDelegatedBalanceFunc,
  CertificateForEpoch,
  GetCurrentDelegationFunc,
  RewardHistoryFunc,
} from '../../../api/common/lib/storage/bridge/delegationUtils';
import type {
  GetRegistrationHistoryFunc,
} from '../../../api/ada/lib/storage/bridge/delegationUtils';
import type {
  DelegationRequests,
  PoolMeta,
} from '../../../stores/toplevel/DelegationStore';
import type {
  AdaDelegationRequests,
} from '../../../stores/ada/AdaDelegationStore';
import { RewardAddressEmptyError, GenericApiError, GetAccountStateApiError, GetPoolInfoApiError } from '../../../api/common/errors';
import LessThanExpectedDialog from '../../../components/wallet/staking/dashboard/LessThanExpectedDialog';
import UnmangleTxDialogContainer from '../../transfer/UnmangleTxDialogContainer';
import PoolWarningDialog from '../../../components/wallet/staking/dashboard/PoolWarningDialog';
import UndelegateDialog from '../../../components/wallet/staking/dashboard/UndelegateDialog';
import { GROUP_MANGLED, allAddressSubgroups } from '../../../stores/stateless/addressStores';
import type { MangledAmountFunc } from '../../../stores/stateless/mangledAddresses';
import type { StandardAddress } from '../../../types/AddressFilterTypes';
import {
  TransactionType,
} from '../../../api/ada/lib/storage/database/primitives/tables';
import type {
  JormungandrTransactionInsert, NetworkRow,
} from '../../../api/ada/lib/storage/database/primitives/tables';
import type { IAddressTypeStore, IAddressTypeUiSubset, } from '../../../stores/stateless/addressStores';
import {
  CoreAddressTypes,
} from '../../../api/ada/lib/storage/database/primitives/enums';
import { ComplexityLevels } from '../../../types/complexityLevelType';
import DeregisterDialogContainer from '../../transfer/DeregisterDialogContainer';
import WithdrawalTxDialogContainer from '../../transfer/WithdrawalTxDialogContainer';
import { defaultAssets } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import { mockFromDefaults, getDefaultEntryTokenInfo, } from '../../../stores/toplevel/TokenInfoStore';

export default {
  title: `${__filename.split('.')[0]}`,
  component: StakingDashboardPage,
  decorators: [withScreenshot],
};

const genDefaultGroupMap: (
  void => Map<Class<IAddressTypeStore>, IAddressTypeUiSubset>
) = () => {
  return new Map(
    allAddressSubgroups.map(type => [
      type.class,
      {
        all: [],
        wasExecuted: true,
      },
    ])
  );
};

const getRoute = (id) => buildRoute(
  ROUTES.WALLETS.DELEGATION_DASHBOARD,
  { id, }
);

const genBaseProps: {|
  wallet: PossibleCacheTypes,
  lookup: *,
  transactionBuilderStore?: *,
  openDialog?: *,
  sendMoneyRequest?: *,
  delegationTransaction?: *,
  allowToggleHidden?: *,
  mangledInfo?: {|
    addresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  |},
  getLocalPoolInfo: *,
  forceRegistration?: (void | boolean),
  withdrawalTxProps?: *,
  getParam?: <T>(number | string) => T,
|} => * = (request) => {
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
      explorers: {
        selectedExplorer: defaultToSelectedExplorer(),
      },
      profile: {
        isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
        currentTheme: globalKnobs.currentTheme(),
        shouldHideBalance: request.allowToggleHidden
          ? boolean('hideBalance', false)
          : false,
        unitOfAccount: genUnitOfAccount(),
      },
      wallets: {
        sendMoneyRequest: request.sendMoneyRequest || {
          error: undefined,
          isExecuting: false,
        },
        selected: request.wallet.publicDeriver,
      },
      coinPriceStore: {
        getCurrentPrice: (_from, _to) => 5,
      },
      uiDialogs: {
        isOpen: (dialog) => dialog === request.openDialog,
        getParam: request.getParam || (() => (null: any)),
      },
      uiNotifications: {
        isOpen: () => false, // TODO
        getTooltipActiveNotification: () => null, // TODO
      },
      transactions: {
        hasAnyPending: request.openDialog == null
          ? boolean('hasAnyPending', false)
          : false,
        getTxRequests: request.lookup.getTransactions,
      },
      delegation: {
        selectedPage: 0,
        getLocalPoolInfo: request.getLocalPoolInfo,
        getDelegationRequests: request.lookup.getDelegation,
      },
      time: {
        getTimeCalcRequests: request.lookup.getTimeCalcRequests,
        getCurrentTimeRequests: request.lookup.getCurrentTimeRequests,
      },
      tokenInfoStore: {
        tokenInfo: mockFromDefaults(defaultAssets),
        getDefaultTokenInfo: networkId => getDefaultEntryTokenInfo(
          networkId,
          mockFromDefaults(defaultAssets)
        ),
      },
      substores: {
        ada: {
          delegation: {
            getDelegationRequests: request.lookup.getAdaDelegation,
          },
        },
        jormungandr: {
          delegationTransaction: request.delegationTransaction || {
            isStale: false,
            createDelegationTx: {
              isExecuting: false,
              error: undefined,
              result: undefined,
            },
          },
        },
      },
    },
    actions: {
      delegation: {
        setSelectedPage: {
          trigger: action('setSelectedPage'),
        },
      },
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
          createWithdrawalTxForWallet: {
            trigger: async (req) => action('createWithdrawalTxForWallet')(req),
          },
        },
      },
      jormungandr: {
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
    WithdrawalTxDialogContainerProps: request.withdrawalTxProps ?? (null: any),
    DeregisterDialogContainerProps: {
      generated: {
        stores: {
          profile: {
            selectedComplexityLevel: select(
              'complexityLevel',
              ComplexityLevels,
              ComplexityLevels.Advanced
            ),
          },
        },
        actions: {
          ada: {
            delegationTransaction: {
              setShouldDeregister: {
                trigger: action('setShouldDeregister'),
              },
            },
          },
          dialogs: {
            closeActiveDialog: { trigger: action('closeActiveDialog') },
          },
        },
      },
    },
    UnmangleTxDialogContainerProps: {
      generated: {
        TransferSendProps: {
          generated: {
            actions: {
              wallets: {
                sendMoney: {
                  trigger: async (req) => action('sendMoney')(req),
                },
              },
              ada: {
                trezorSend: {
                  sendUsingTrezor: {
                    trigger: async (req) => action('sendUsingTrezor')(req),
                  },
                },
                ledgerSend: {
                  sendUsingLedgerWallet: {
                    trigger: async (req) => action('sendUsingLedgerWallet')(req),
                  },
                },
              },
            },
            stores: {
              addresses: {
                addressSubgroupMap: genDefaultGroupMap(),
              },
              coinPriceStore: {
                getCurrentPrice: (_from, _to) => 5,
              },
              tokenInfoStore: {
                tokenInfo: mockFromDefaults(defaultAssets),
              },
              wallets: {
                selected: request.wallet.publicDeriver,
                sendMoneyRequest: (
                  request.transactionBuilderStore == null
                  || request.transactionBuilderStore.tentativeTx == null
                )
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
              explorers: {
                selectedExplorer: defaultToSelectedExplorer(),
              },
              profile: {
                isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
                unitOfAccount: genUnitOfAccount(),
              },
            },
          },
        },
        stores: {
          wallets: {
            selected: request.wallet.publicDeriver,
          },
          addresses: {
            addressSubgroupMap: new Map([[
              GROUP_MANGLED.class,
              {
                all: request.mangledInfo?.addresses ?? [],
                wasExecuted: true,
              },
            ]]),
          },
          transactionBuilderStore: request.transactionBuilderStore || (null: any),
        },
        actions: {
          txBuilderActions: {
            initialize: {
              trigger: async (req) => action('initialize')(req),
            },
            reset: {
              trigger: action('reset'),
            },
          },
        },
      },
    }
  };
};

const delegateCert1 = {
  relatedAddresses: [{
    CertificateAddressId: 10,
    CertificateId: 10,
    AddressId: 81,
    Relation: 0,
  }],
  certificate: {
    Ordinal: 0,
    CertificateId: 10,
    TransactionId: 14,
    Kind: 0,
    Payload: 'a22d0b8709e6bc04d11257dc405410d1ace01f207c391ba4788ea17198ee1a0801f989090208512a2d56aed13b81c98407b10ba04fde3b8d4a3442b8b25368f512',
  },
  transaction: {
    TransactionId: 14,
    ...({
      Type: TransactionType.Jormungandr,
      Digest: -5.739375206419183e+296,
      Hash: 'b5b44d983bfcd2ca9e28a9a00924d0262c9decfbee34dab07af30b6acd23ff97',
      BlockId: 14,
      Ordinal: 0,
      LastUpdateTime: 1580812939000,
      Status: 1,
      ErrorMessage: null,
      Extra: null,
    }: JormungandrTransactionInsert)
  },
  block: {
    BlockId: 14,
    SlotNum: 2274261,
    Height: 162845,
    Digest: -1.2145313276131e-206,
    Hash: '741b3112b3922c9b41b0c8bd77840473c4960dbefab1f212af675eefa4a343a9',
    BlockTime: new Date(1578179355000),
  },
  pools: [[
    'f989090208512a2d56aed13b81c98407b10ba04fde3b8d4a3442b8b25368f512', 1
  ]],
};

const undelegateCert = {
  ...delegateCert1,
  certificate: {
    ...delegateCert1.certificate,
    Payload: 'a22d0b8709e6bc04d11257dc405410d1ace01f207c391ba4788ea17198ee1a0800',
  },
  pools: [],
};

const changeDelegationCert = {
  ...delegateCert1,
  certificate: {
    ...delegateCert1.certificate,
    Payload: 'a22d0b8709e6bc04d11257dc405410d1ace01f207c391ba4788ea17198ee1a08017186b11017e877329798ac925480585208516c4e5c30b69e38f0b997e7b72a83',
  },
  pools: [['7186b11017e877329798ac925480585208516c4e5c30b69e38f0b997e7b72a83', 1]],
};

const emurgo2Pool = {
  poolId: '2',
  info: {
    ticker: '2EMUR',
    name: 'EMURGO’ STAKEPOOL',
    description: 'EMURGO’s official Stake Pool.',
    homepage: 'https://emurgo.io',
  },
  history: [{
    epoch: 13,
    slot: 24962,
    tx_ordinal: 1,
    cert_ordinal: 0,
    payload: {
      payloadKind: 'PoolRegistration',
      payloadKindId: 2,
      payloadHex: '0000000000000000000000000000000000000000000000000000000000000001da464571fc561c09439d040aa15b22f6094c7e824ceb9ac0fbfc6dcb7f79b1187df6bb3603be1a3f7cf44240469ea1b4dea93ed6a113dc1e3a0a33329433c2a701a6a920e3dee3dfec6b3cf9f104a432259e1988ab9eb4fe1dfe20789c368426bd000000000000000000000000000000003700000000000003e8000000000000000001d73444201a6785e43bcf83a0ee58632d130ea0242f33ae1322117b3cd87bcac5',
    },
  }],
  reputation: Object.freeze({}),
};

const privatePoolInfo = {
  info: undefined,
  poolId: '3',
  history: [
    {
      epoch: 13,
      slot: 24846,
      tx_ordinal: 1,
      cert_ordinal: 0,
      payload: {
        payloadKind: 'PoolRegistration',
        payloadKindId: 2,
        payloadHex: '000000000000000000000000000000000000000000000000000000000000000118a82e10174a78a740427d859badd95c77c02595834139c73eed40f5ef61e062fbcdc1ecde79767feccdc9e5e127a8300f33ecfe6bd274cb831f8b64ec626c7701829465349415b2e908fd7dc32fa433f9f0dcfcc92a3a4d336349ab0ddbd5a8fc000000000000000000000000000000003700000000000003e80000000000000000010f8b0b5d174773f09befa27390faf5d7b6ecc62957d5a1f4b8e51c5fa3564391'
      }
    }
  ],
  reputation: Object.freeze({}),
};
const emurgo1Pool = {
  info: {
    ticker: '1EMUR',
    name: 'EMURGO’ STAKEPOOL',
    description: 'EMURGO’s official Stake Pool. EMURGO is one of three organizations that contribute to the development of Cardano. Let’s make this Testnet successful by delegation to multiple stakepools.',
    homepage: 'https://emurgo.io'
  },
  reputation: Object.freeze({}),
  ...privatePoolInfo,
  poolId: '1',
};

function mockGetPoolInfo(networkId: $ReadOnly<NetworkRow>, poolId: string): void | PoolMeta {
  if (poolId === '7186b11017e877329798ac925480585208516c4e5c30b69e38f0b997e7b72a83') {
    return emurgo1Pool;
  }
  if (poolId === 'f989090208512a2d56aed13b81c98407b10ba04fde3b8d4a3442b8b25368f512') {
    return emurgo2Pool;
  }
}

function getChainInfo(full: CertificateForEpoch) {
  const { relatedAddresses, certificate, transaction, block } = full;
  return { relatedAddresses, certificate, transaction, block };
}

const multiToken = (defaultToken, amount) => {
  return new MultiToken(
    [{
      amount,
      networkId: defaultToken.defaultNetworkId,
      identifier: defaultToken.defaultIdentifier,
    }],
    defaultToken
  );
};

const stakingKeyCases = {
  NeverDelegated: 1,
  JustDelegated: 2,
  LongAgoDelegation: 3,
  ManuallyUndelegate: 4,
  ChangePools: 5,
};
function getStakingInfo(
  publicDeriver: *,
  stakingCase: $Values<typeof stakingKeyCases>,
  canUnmangleAmount: MultiToken,
): DelegationRequests {
  const getDelegatedBalance: CachedRequest<GetDelegatedBalanceFunc> = new CachedRequest(
    _request => Promise.resolve({
      utxoPart: stakingCase === stakingKeyCases.NeverDelegated
        ? multiToken(publicDeriver.getParent().getDefaultToken(), new BigNumber(0))
        : multiToken(publicDeriver.getParent().getDefaultToken(), new BigNumber(4_000_000)),
      accountPart: stakingCase === stakingKeyCases.NeverDelegated
        ? multiToken(publicDeriver.getParent().getDefaultToken(), new BigNumber(0))
        : multiToken(publicDeriver.getParent().getDefaultToken(), new BigNumber(3_000_000)),
    })
  );
  const currEpochCert = (() => {
    if (stakingCase === stakingKeyCases.NeverDelegated) {
      return undefined;
    }
    if (stakingCase === stakingKeyCases.ManuallyUndelegate) {
      return undelegateCert;
    }
    if (stakingCase === stakingKeyCases.ChangePools) {
      return changeDelegationCert;
    }
    return delegateCert1;
  })();
  const prevEpochCert = (() => {
    if (stakingCase === stakingKeyCases.NeverDelegated) {
      return undefined;
    }
    if (stakingCase === stakingKeyCases.JustDelegated) {
      return undefined;
    }
    return delegateCert1;
  })();
  const prevPrevEpochCert = (() => {
    if (stakingCase === stakingKeyCases.NeverDelegated) {
      return undefined;
    }
    if (stakingCase === stakingKeyCases.JustDelegated) {
      return undefined;
    }
    return delegateCert1;
  })();
  const prevPrevPrevEpochCert = (() => {
    if (stakingCase === stakingKeyCases.NeverDelegated) {
      return undefined;
    }
    if (stakingCase === stakingKeyCases.JustDelegated) {
      return undefined;
    }
    return delegateCert1;
  })();
  const getCurrentDelegation: CachedRequest<GetCurrentDelegationFunc> = new CachedRequest(
    _request => Promise.resolve({
      currEpoch: currEpochCert,
      prevEpoch: prevEpochCert,
      prevPrevEpoch: prevPrevEpochCert,
      prevPrevPrevEpoch: prevPrevPrevEpochCert,
      fullHistory: [
        ...(currEpochCert == null ? [] : [getChainInfo(currEpochCert)]),
        ...(prevEpochCert == null ? [] : [getChainInfo(prevEpochCert)]),
        ...(prevPrevEpochCert == null ? [] : [getChainInfo(prevPrevEpochCert)]),
      ],
      allPoolIds: Array.from(new Set(
        ...(currEpochCert == null ? [] : currEpochCert.pools.map(pool => pool[0])),
        ...(prevEpochCert == null ? [] : prevEpochCert.pools.map(pool => pool[0])),
        ...(prevPrevEpochCert == null ? [] : prevPrevEpochCert.pools.map(pool => pool[0])),
      )),
    })
  );
  const rewardHistory: CachedRequest<RewardHistoryFunc> = new CachedRequest(
    _request => (
      stakingCase === stakingKeyCases.LongAgoDelegation ||
      stakingCase === stakingKeyCases.ManuallyUndelegate ||
      stakingCase === stakingKeyCases.ChangePools
        ? Promise.resolve([
          [
            99,
            multiToken(publicDeriver.getParent().getDefaultToken(), new BigNumber(1000_000_000)),
            'My Pool 1',
          ],
          [
            100,
            multiToken(publicDeriver.getParent().getDefaultToken(), new BigNumber(500_000_000)),
            'My Pool 2',
          ]
        ])
        : Promise.resolve([])
    )
  );
  getDelegatedBalance.execute((null: any));
  getCurrentDelegation.execute((null: any));
  rewardHistory.execute((null: any));

  const defaultToken = publicDeriver.getParent().getDefaultToken();

  const mangledAmounts: CachedRequest<MangledAmountFunc> = new CachedRequest(
    _request => Promise.resolve({
      canUnmangle: canUnmangleAmount,
      cannotUnmangle: getDelegatedBalance.result?.utxoPart
        .joinSubtractCopy(canUnmangleAmount)
        ?? new MultiToken([], defaultToken),
    })
  );
  mangledAmounts.execute((null: any));
  return {
    publicDeriver,
    mangledAmounts,
    getDelegatedBalance,
    getCurrentDelegation,
    rewardHistory,
    error: undefined,
  };
}

function getAdaStakingInfo(
  publicDeriver: *,
  delegationRequests: void | DelegationRequests,
): AdaDelegationRequests {
  const getRegistrationHistory: CachedRequest<GetRegistrationHistoryFunc> = new CachedRequest(
    async _request => {
      const result = {
        current: false,
        fullHistory: [],
      };
      if (delegationRequests == null) return result;
      await delegationRequests.getCurrentDelegation;
      if (delegationRequests.getCurrentDelegation.result == null) return result;
      const currDeleg = delegationRequests.getCurrentDelegation.result;

      const hasPools = (certForEpoch) => {
        if (certForEpoch == null) return false;
        return certForEpoch.pools.length > 0;
      };
      if (hasPools(currDeleg.currEpoch)) {
        result.current = true;
      }
      return result;
    }
  );
  getRegistrationHistory.execute((null: any));
  return {
    publicDeriver,
    getRegistrationHistory,
  };
}

export const Loading = (): Node => {
  const genWallet = () => {
    const wallet = genJormungandrSigningWalletWithCache();

    const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

    const getDelegatedBalance: CachedRequest<GetDelegatedBalanceFunc> = new CachedRequest(
      _request => Promise.resolve({
        utxoPart: new MultiToken([], defaultToken),
        accountPart: new MultiToken([], defaultToken),
      })
    );
    const mangledAmounts: CachedRequest<MangledAmountFunc> = new CachedRequest(
      _request => Promise.resolve({
        canUnmangle: new MultiToken([], defaultToken),
        cannotUnmangle: new MultiToken([], defaultToken),
      })
    );
    const getCurrentDelegation: CachedRequest<GetCurrentDelegationFunc> = new CachedRequest(
      _request => Promise.resolve({
        currEpoch: undefined,
        prevEpoch: undefined,
        prevPrevEpoch: undefined,
        prevPrevPrevEpoch: undefined,
        fullHistory: [],
        allPoolIds: [],
      })
    );
    const rewardHistory: CachedRequest<RewardHistoryFunc> = new CachedRequest(
      _request => Promise.resolve([
      ])
    );
    const balance: CachedRequest<GetBalanceFunc> = new CachedRequest(_request => Promise.resolve(
      multiToken(wallet.publicDeriver.getParent().getDefaultToken(), new BigNumber(4_000_000)),
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
      const requests = wallet.getTimeCalcRequests(wallet.publicDeriver).requests;
      Object.keys(requests).map(key => requests[key]).forEach(request => request.execute());
      wallet.getTimeCalcRequests = (_req) => ({
        publicDeriver: wallet.publicDeriver,
        requests
      });
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
      mangledAmounts,
      getDelegatedBalance,
      getCurrentDelegation,
      rewardHistory,
      error: undefined,
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
        getLocalPoolInfo: mockGetPoolInfo,
      })}
    />)
  );
};

export const JormungandrDelegationCases = (): Node => {
  const genWallet = () => {
    const wallet = genJormungandrSigningWalletWithCache();
    const getStakingKeyValue = () => select(
      'stakingKeyCases',
      stakingKeyCases,
      stakingKeyCases.NeverDelegated
    );

    const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

    {
      const requests = wallet.getTimeCalcRequests(wallet.publicDeriver).requests;
      Object.keys(requests).map(key => requests[key]).forEach(request => request.execute());
      wallet.getTimeCalcRequests = (_req) => ({
        publicDeriver: wallet.publicDeriver,
        requests
      });
    }
    const computedDelegation = getStakingInfo(
      wallet.publicDeriver,
      getStakingKeyValue(),
      new MultiToken([], defaultToken),
    );
    wallet.getDelegation = (_publicDeriver) => computedDelegation;
    const balance: CachedRequest<GetBalanceFunc> = new CachedRequest(_request => Promise.resolve(
      multiToken(wallet.publicDeriver.getParent().getDefaultToken(), new BigNumber(4_000_000)),
    ));
    balance.execute((null: any));
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
        allowToggleHidden: true,
        getLocalPoolInfo: mockGetPoolInfo,
      })}
    />)
  );
};

export const AdaDelegationCases = (): Node => {
  const genWallet = () => {
    const wallet = genShelleyCIP1852SigningWalletWithCache();
    const getStakingKeyValue = () => select(
      'stakingKeyCases',
      stakingKeyCases,
      stakingKeyCases.NeverDelegated
    );

    const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

    {
      const requests = wallet.getTimeCalcRequests(wallet.publicDeriver).requests;
      Object.keys(requests).map(key => requests[key]).forEach(request => request.execute());
      wallet.getTimeCalcRequests = (_req) => ({
        publicDeriver: wallet.publicDeriver,
        requests
      });
    }
    const computedDelegation = getStakingInfo(
      wallet.publicDeriver,
      getStakingKeyValue(),
      new MultiToken([], defaultToken),
    );
    wallet.getDelegation = (_publicDeriver) => computedDelegation;
    const balance: CachedRequest<GetBalanceFunc> = new CachedRequest(_request => Promise.resolve(
      multiToken(wallet.publicDeriver.getParent().getDefaultToken(), new BigNumber(4_000_000)),
    ));
    balance.execute((null: any));
    const oldResults = wallet.getTransactions(wallet.publicDeriver);
    wallet.getTransactions = (_req) => ({
      ...oldResults,
      requests: {
        ...oldResults.requests,
        getBalanceRequest: balance,
      },
    });
    const computedAdaDelegation = getAdaStakingInfo(
      wallet.publicDeriver,
      computedDelegation
    );
    wallet.getAdaDelegation = (_publicDeriver) => computedAdaDelegation;

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
        allowToggleHidden: true,
        getLocalPoolInfo: mockGetPoolInfo,
      })}
    />)
  );
};

export const AdaDeregistrationDialog = (): Node => {
  const wallet = genBaseAdaWallet();
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
        openDialog: DeregisterDialogContainer,
        allowToggleHidden: true,
        getLocalPoolInfo: mockGetPoolInfo,
      })}
    />)
  );
};

export const AdaWithdrawDialog = (): Node => {
  const wallet = genBaseAdaWallet();
  const lookup = walletLookup([wallet]);

  const errorCases = {
    None: 0,
    NoInput: 1,
  };
  const error = select(
    'withdrawalError',
    errorCases,
    errorCases.None
  );
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
        openDialog: WithdrawalTxDialogContainer,
        allowToggleHidden: true,
        getLocalPoolInfo: mockGetPoolInfo,
        withdrawalTxProps: {
          generated: {
            TransferSendProps: {
              generated: {
                stores: {
                  addresses: {
                    addressSubgroupMap: genDefaultGroupMap(),
                  },
                  explorers: {
                    selectedExplorer: defaultToSelectedExplorer(),
                  },
                  profile: {
                    isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
                    unitOfAccount: genUnitOfAccount(),
                  },
                  wallets: {
                    selected: wallet.publicDeriver,
                    sendMoneyRequest: {
                      isExecuting: boolean('isExecuting', false),
                      error: undefined,
                      reset: action('sendMoneyRequest reset'),
                    },
                  },
                  coinPriceStore: {
                    getCurrentPrice: (_from, _to) => 5,
                  },
                  tokenInfoStore: {
                    tokenInfo: mockFromDefaults(defaultAssets),
                  },
                },
                actions: {
                  wallets: {
                    sendMoney: {
                      trigger: async (req) => action('sendMoney')(req),
                    },
                  },
                  ada: {
                    trezorSend: {
                      sendUsingTrezor: {
                        trigger: async (req) => action('sendUsingTrezor')(req),
                      },
                    },
                    ledgerSend: {
                      sendUsingLedgerWallet: {
                        trigger: async (req) => action('sendUsingLedgerWallet')(req),
                      },
                    },
                  },
                },
              },
            },
            actions: Object.freeze({}),
            stores: {
              profile: {
                selectedNetwork: wallet.publicDeriver.getParent().getNetworkInfo()
              },
              tokenInfoStore: {
                getDefaultTokenInfo: networkId => getDefaultEntryTokenInfo(
                  networkId,
                  mockFromDefaults(defaultAssets)
                ),
              },
              substores: {
                ada: {
                  delegationTransaction: {
                    createWithdrawalTx: {
                      error: error === errorCases.NoInput
                        ? new RewardAddressEmptyError()
                        : undefined,
                      result: genWithdrawalTx(
                        wallet.publicDeriver,
                        boolean('deregister', true)
                      ),
                      reset: action('createWithdrawalTx reset'),
                    },
                  },
                },
              },
            },
          },
        }
      })}
    />)
  );
};

export const Errors = (): Node => {
  const genWallet = () => {
    const wallet = genJormungandrSigningWalletWithCache();
    const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

    {
      const requests = wallet.getTimeCalcRequests(wallet.publicDeriver).requests;
      Object.keys(requests).map(key => requests[key]).forEach(request => request.execute());
      wallet.getTimeCalcRequests = (_req) => ({
        publicDeriver: wallet.publicDeriver,
        requests
      });
    }
    const computedDelegation = getStakingInfo(
      wallet.publicDeriver,
      stakingKeyCases.LongAgoDelegation,
      new MultiToken([], defaultToken),
    );

    const errorCases = {
      StakingKey: 0,
      PoolInfo: 1,
      Both: 2,
    };
    const error = select(
      'fetchError',
      errorCases,
      errorCases.Both
    );
    if (error === errorCases.PoolInfo || error === errorCases.Both) {
      const rewardHistory: CachedRequest<RewardHistoryFunc> = new CachedRequest(
        async _request => { throw new GetPoolInfoApiError(); }
      );
      rewardHistory.execute((null: any));
      computedDelegation.rewardHistory = rewardHistory;
    }
    wallet.getDelegation = (_publicDeriver) => ({
      ...computedDelegation,
      error: error === errorCases.StakingKey || error === errorCases.Both
        ? new GetAccountStateApiError()
        : undefined,
    });
    const balance: CachedRequest<GetBalanceFunc> = new CachedRequest(_request => Promise.resolve(
      multiToken(wallet.publicDeriver.getParent().getDefaultToken(), new BigNumber(4_000_000)),
    ));
    balance.execute((null: any));
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
        getLocalPoolInfo: mockGetPoolInfo,
      })}
    />)
  );
};

// wallet we can reuse for multiple tests
const genBaseJormungandrWallet = (
  canUnmangleAdaAmount: BigNumber,
) => {
  const wallet = genJormungandrSigningWalletWithCache();
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

  const canUnmangleAmount = new MultiToken(
    [{
      amount: canUnmangleAdaAmount,
      identifier: defaultAssets.filter(
        asset => asset.NetworkId === wallet.publicDeriver.getParent().getNetworkInfo().NetworkId
      )[0].Identifier,
      networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
    }],
    defaultToken
  )
  {
    const requests = wallet.getTimeCalcRequests(wallet.publicDeriver).requests;
    Object.keys(requests).map(key => requests[key]).forEach(request => request.execute());
    wallet.getTimeCalcRequests = (_req) => ({
      publicDeriver: wallet.publicDeriver,
      requests
    });
  }
  const computedDelegation = getStakingInfo(
    wallet.publicDeriver,
    stakingKeyCases.LongAgoDelegation,
    canUnmangleAmount,
  );
  wallet.getDelegation = (_publicDeriver) => computedDelegation;
  const balance: CachedRequest<GetBalanceFunc> = new CachedRequest(_request => Promise.resolve(
    multiToken(wallet.publicDeriver.getParent().getDefaultToken(), new BigNumber(4_000_000)),
  ));
  balance.execute((null: any));
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
const genBaseAdaWallet = () => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

  {
    const requests = wallet.getTimeCalcRequests(wallet.publicDeriver).requests;
    Object.keys(requests).map(key => requests[key]).forEach(request => request.execute());
    wallet.getTimeCalcRequests = (_req) => ({
      publicDeriver: wallet.publicDeriver,
      requests
    });
  }
  const computedDelegation = getStakingInfo(
    wallet.publicDeriver,
    stakingKeyCases.LongAgoDelegation,
    new MultiToken([], defaultToken),
  );
  wallet.getDelegation = (_publicDeriver) => computedDelegation;
  const computedAdaDelegation = getAdaStakingInfo(
    wallet.publicDeriver,
    computedDelegation
  );
  wallet.getAdaDelegation = (_publicDeriver) => computedAdaDelegation;
  const balance: CachedRequest<GetBalanceFunc> = new CachedRequest(_request => Promise.resolve(
    multiToken(wallet.publicDeriver.getParent().getDefaultToken(), new BigNumber(4_000_000)),
  ));
  balance.execute((null: any));
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

export const LessThanExpected = (): Node => {
  const wallet = genBaseJormungandrWallet(new BigNumber(0));
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
        openDialog: LessThanExpectedDialog,
        getLocalPoolInfo: mockGetPoolInfo,
      })}
    />)
  );
};

export const UnknownPool = (): Node => {
  const wallet = genBaseJormungandrWallet(new BigNumber(0));

  // setup a map that doesn't have the metadata for a pool (a private pool)
  const newMockPoolInfo = (network, poolId) => {
    if (poolId === 'f989090208512a2d56aed13b81c98407b10ba04fde3b8d4a3442b8b25368f512') {
      return privatePoolInfo;
    }
    return mockGetPoolInfo(network, poolId);
  };

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
        openDialog: undefined,
        getLocalPoolInfo: newMockPoolInfo,
      })}
    />)
  );
};

export const UndelegateExecuting = (): Node => {
  const wallet = genBaseJormungandrWallet(new BigNumber(0));
  const lookup = walletLookup([wallet]);
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

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
        getLocalPoolInfo: mockGetPoolInfo,
        openDialog: UndelegateDialog,
        sendMoneyRequest: {
          error: undefined,
          isExecuting: false,
        },
        delegationTransaction: {
          isStale: false,
          createDelegationTx: {
            isExecuting: true,
            error: undefined,
            result: {
              signTxRequest: genJormungandrUndelegateTx(wallet.publicDeriver),
              totalAmountToDelegate: new MultiToken([], defaultToken),
            },
          },
        },
      })}
    />)
  );
};

export const UndelegateError = (): Node => {
  const wallet = genBaseJormungandrWallet(new BigNumber(0));
  const lookup = walletLookup([wallet]);
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

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
        getLocalPoolInfo: mockGetPoolInfo,
        openDialog: UndelegateDialog,
        sendMoneyRequest: {
          error: undefined,
          isExecuting: false,
        },
        delegationTransaction: {
          isStale: false,
          createDelegationTx: {
            isExecuting: true,
            error: new GenericApiError(),
            result: {
              signTxRequest: genJormungandrUndelegateTx(wallet.publicDeriver),
              totalAmountToDelegate: new MultiToken([], defaultToken),
            },
          },
        },
      })}
    />)
  );
};

export const UndelegateDialogShown = (): Node => {
  const wallet = genBaseJormungandrWallet(new BigNumber(0));
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

  const lookup = walletLookup([wallet]);
  const errorCases = {
    NoError: 0,
    HasError: 1,
  };
  const getError = () => select(
    'fetchError',
    errorCases,
    errorCases.NoError
  );
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
        getLocalPoolInfo: mockGetPoolInfo,
        openDialog: UndelegateDialog,
        sendMoneyRequest: {
          error: getError() === errorCases.NoError
            ? undefined
            : new GenericApiError(),
          isExecuting: boolean('isExecuting', false),
        },
        delegationTransaction: {
          isStale: boolean('isStale', false),
          createDelegationTx: {
            isExecuting: false,
            error: undefined,
            result: {
              signTxRequest: genJormungandrUndelegateTx(wallet.publicDeriver),
              totalAmountToDelegate: new MultiToken([], defaultToken),
            },
          },
        },
      })}
    />)
  );
};

export const Reputation = (): Node => {
  const wallet = genBaseJormungandrWallet(new BigNumber(0));
  const lookup = walletLookup([wallet]);
  const flagCases = {
    Forks: 1,
    Censoring: 2,
    Unknown: 1 << 31,
  };
  const getFlag = () => select(
    'nodeFlag',
    flagCases,
    flagCases.Forks
  );
  const dialogCases = {
    DialogClosed: 0,
    DialogOpen: 1,
  };
  const getDialog = () => select(
    'dialogCases',
    dialogCases,
    dialogCases.DialogOpen
  );

  const newMockPoolInfo = (network, poolId) => {
    if (poolId === 'f989090208512a2d56aed13b81c98407b10ba04fde3b8d4a3442b8b25368f512') {
      return {
        ...emurgo2Pool,
        reputation: {
          node_flags: getFlag(),
        },
      };
    }
    return mockGetPoolInfo(network, poolId);
  };
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
        getLocalPoolInfo: newMockPoolInfo,
        openDialog: getDialog() === dialogCases.DialogClosed ? undefined : PoolWarningDialog,
        getParam: <T>(param) => { // eslint-disable-line no-unused-vars
          if (param === 'reputation') {
            return {
              node_flags: getFlag(),
            };
          }
        },
      })}
    />)
  );
};

export const MangledDashboardWarning = (): Node => {
  const mangledCases = {
    CannotUnmangle: 0,
    CanUnmangleSome: 1,
    CanUnmangleAll: 2,
  };
  const mangledValue = select(
    'mangledCases',
    mangledCases,
    mangledCases.CanUnmangleAll
  );

  const mangleValues = {
    canUnmangle: new BigNumber(1_000_000),
    cannotUnmangle: new BigNumber(1),
  };

  const wallet = genBaseJormungandrWallet(
    mangledValue === mangledCases.CanUnmangleSome || mangledValue === mangledCases.CanUnmangleAll
      ? mangleValues.canUnmangle
      : new BigNumber(0)
  );

  const primaryAssetConstant = defaultAssets.filter(
    asset => asset.NetworkId === wallet.publicDeriver.getParent().getNetworkInfo().NetworkId
  )[0];
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

  const addresses = (() => {
    if (mangledValue === mangledCases.CannotUnmangle) {
      return [{
        address: 'addr1sj045dheysyptfekdyqa508nuzdzmh82vkda9hcwqwysrja6d8d66f0cfsfk50hhuqjymr08drnm2kdf0r2337l6kl7mtm0z44vv4jexkqhz5w',
        values: new MultiToken(
          [{
            identifier: primaryAssetConstant.Identifier,
            amount: mangleValues.cannotUnmangle,
            networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
          }],
          defaultToken
        ),
        type: CoreAddressTypes.JORMUNGANDR_GROUP,
      }];
    }
    if (mangledValue === mangledCases.CanUnmangleSome) {
      return [{
        address: 'addr1sj045dheysyptfekdyqa508nuzdzmh82vkda9hcwqwysrja6d8d66f0cfsfk50hhuqjymr08drnm2kdf0r2337l6kl7mtm0z44vv4jexkqhz5w',
        values: new MultiToken(
          [{
            identifier: primaryAssetConstant.Identifier,
            amount: mangleValues.cannotUnmangle,
            networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
          }],
          defaultToken
        ),
        type: CoreAddressTypes.JORMUNGANDR_GROUP,
      }, {
        address: 'addr1sj045dheysyptfekdyqa508nuzdzmh82vkda9hcwqwysrja6d8d66f0cfsfk50hhuqjymr08drnm2kdf0r2337l6kl7mtm0z44vv4jexkqhz5w',
        values: new MultiToken(
          [{
            identifier: primaryAssetConstant.Identifier,
            amount: mangleValues.canUnmangle,
            networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
          }],
          defaultToken
        ),
        type: CoreAddressTypes.JORMUNGANDR_GROUP,
      }];
    }
    if (mangledValue === mangledCases.CanUnmangleAll) {
      return [{
        address: 'addr1sj045dheysyptfekdyqa508nuzdzmh82vkda9hcwqwysrja6d8d66f0cfsfk50hhuqjymr08drnm2kdf0r2337l6kl7mtm0z44vv4jexkqhz5w',
        values: new MultiToken(
          [{
            identifier: primaryAssetConstant.Identifier,
            amount: mangleValues.canUnmangle,
            networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
          }],
          defaultToken
        ),
        type: CoreAddressTypes.JORMUNGANDR_GROUP,
      }];
    }
    throw new Error(`Unhandled mangled case ${mangledValue}`);
  })();
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
        getLocalPoolInfo: mockGetPoolInfo,
        mangledInfo: {
          addresses,
        },
      })}
    />)
  );
};

export const UnmangleDialogLoading = (): Node => {
  const wallet = genBaseJormungandrWallet(new BigNumber(1_000_000));
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
        getLocalPoolInfo: mockGetPoolInfo,
        mangledInfo: {
          addresses: [],
        },
        openDialog: UnmangleTxDialogContainer,
        transactionBuilderStore: {
          tentativeTx: null,
          setupSelfTx: {
            error: undefined,
          },
        }
      })}
    />)
  );
};

export const UnmangleDialogError = (): Node => {
  const wallet = genBaseJormungandrWallet(new BigNumber(1_000_000));
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
        getLocalPoolInfo: mockGetPoolInfo,
        mangledInfo: {
          addresses: [],
        },
        openDialog: UnmangleTxDialogContainer,
        transactionBuilderStore: {
          tentativeTx: null,
          setupSelfTx: {
            error: new GenericApiError(),
          },
        }
      })}
    />)
  );
};

export const UnmangleDialogConfirm = (): Node => {
  const wallet = genBaseJormungandrWallet(new BigNumber(1_000_000));
  const lookup = walletLookup([wallet]);
  const { tentativeTx } = genTentativeJormungandrTx(
    wallet.publicDeriver
  );
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
        getLocalPoolInfo: mockGetPoolInfo,
        mangledInfo: {
          addresses: [],
        },
        openDialog: UnmangleTxDialogContainer,
        transactionBuilderStore: {
          tentativeTx,
          setupSelfTx: {
            error: undefined,
          },
        }
      })}
    />)
  );
};
