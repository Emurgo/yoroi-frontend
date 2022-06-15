// @flow

import type { Node } from 'react';
import BigNumber from 'bignumber.js';
import { boolean, select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withScreenshot } from 'storycap';
import {
  globalKnobs,
  genUnitOfAccount,
} from '../../../stories/helpers/StoryWrapper';
import {
  walletLookup,
} from '../../../stories/helpers/WalletCache';
import {
  genByronSigningWalletWithCache,
} from '../../../stories/helpers/cardano/ByronMocks';
import type {
  PossibleCacheTypes,
} from '../../../stories/helpers/WalletCache';
import LocalizableError from '../../i18n/LocalizableError';
import { GenericApiError, } from '../../api/common/errors';
import WalletSummaryPage from './WalletSummaryPage';
import { defaultToSelectedExplorer } from '../../domain/SelectedExplorer';
import { THEMES } from '../../styles/utils';
import { mockWalletProps } from './Wallet.mock';
import { ROUTES } from '../../routes-config';
import AddMemoDialog from '../../components/wallet/memos/AddMemoDialog';
import EditMemoDialog from '../../components/wallet/memos/EditMemoDialog';
import DeleteMemoDialog from '../../components/wallet/memos/DeleteMemoDialog';
import { wrapWallet } from '../../Routes';
import {
  INITIAL_SEARCH_LIMIT,
  SEARCH_SKIP,
} from '../../stores/toplevel/TransactionsStore';
import ExportTransactionDialog from '../../components/wallet/export/ExportTransactionDialog';
import WalletTransaction from '../../domain/WalletTransaction';
import CardanoByronTransaction from '../../domain/CardanoByronTransaction';
import JormungandrTransaction from '../../domain/JormungandrTransaction';
import { transactionTypes } from '../../api/ada/transactions/types';
import type { LastSyncInfoRow, } from '../../api/ada/lib/storage/database/walletTypes/core/tables';
import { TxStatusCodes, CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { assuranceModes, } from '../../config/transactionAssuranceConfig';
import WalletSettingsStore from '../../stores/toplevel/WalletSettingsStore';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { createDebugWalletDialog } from './dialogs/DebugWalletDialogContainer';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetPublicKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  WalletCreationNotifications,
} from '../../stores/toplevel/WalletStore';
import {
  allAddressSubgroups,
  BYRON_EXTERNAL,
  BYRON_INTERNAL,
} from '../../stores/stateless/addressStores';
import type { IAddressTypeStore, IAddressTypeUiSubset } from '../../stores/stateless/addressStores';
import { defaultAssets } from '../../api/ada/lib/storage/database/prepackaged/networks';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';
import {
  mockFromDefaults,
} from '../../stores/toplevel/TokenInfoStore';
import { ComplexityLevels } from '../../types/complexityLevelType';

export default {
  title: `${__filename.split('.')[0]}`,
  component: WalletSummaryPage,
  decorators: [withScreenshot],
};

const actions = {
  notifications: {
    open: {
      trigger: action('open'),
    },
  },
  router: {
    goToRoute: { trigger: action('goToRoute') },
  },
  memos: {
    closeMemoDialog: { trigger: action('closeMemoDialog') },
    saveTxMemo: { trigger: async (req) => action('saveTxMemo')(req) },
    updateTxMemo: { trigger: async (req) => action('updateTxMemo')(req) },
    deleteTxMemo: { trigger: async (req) => action('deleteTxMemo')(req) },
    selectTransaction: { trigger: action('selectTransaction') },
  },
  dialogs: {
    push: { trigger: action('push') },
  },
  transactions: {
    exportTransactionsToFile: {
      trigger: async (req) => action('exportTransactionsToFile')(req)
    },
    closeExportTransactionDialog: {
      trigger: action('closeExportTransactionDialog')
    },
    loadMoreTransactions: {
      trigger: async (req) => action('loadMoreTransactions')(req)
    },
  },
};

export const Loading = (): Node => {
  const genWallet = () => {
    const wallet = genByronSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const primaryAssetConstant = defaultAssets.filter(
    asset => asset.NetworkId === wallet.publicDeriver.getParent().getNetworkInfo().NetworkId
  )[0];
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

  return wrapWallet(
    mockWalletProps({
      location: ROUTES.WALLETS.TRANSACTIONS,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    // $FlowFixMe[incompatible-type]: Revamp props
    (<WalletSummaryPage
      generated={{
        stores: {
          addresses: {
            addressSubgroupMap: new Map(),
          },
          explorers: {
            selectedExplorer: defaultToSelectedExplorer(),
          },
          profile: {
            shouldHideBalance: false,
            isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
            unitOfAccount: genUnitOfAccount(),
            selectedComplexityLevel: select('complexityLevel', ComplexityLevels, ComplexityLevels.Simple),
          },
          uiDialogs: {
            isOpen: () => false,
            getParam: () => (undefined: any),
          },
          memos: {
            hasSetSelectedExternalStorageProvider: false,
            selectedTransaction: undefined,
            error: undefined,
            getIdForWallet: () => '',
            txMemoMap: new Map(),
          },
          uiNotifications: {
            mostRecentActiveNotification: undefined,
            isOpen: () => false,
            getTooltipActiveNotification: () => null,
          },
          wallets: {
            selected: wallet.publicDeriver,
          },
          coinPriceStore: {
            getCurrentPrice: (_from, _to) => '5',
          },
          tokenInfoStore: {
            tokenInfo: mockFromDefaults(defaultAssets),
          },
          transactions: {
            hasAny: false,
            shouldIncludeTxIds: false,
            toggleIncludeTxIds: () => {},
            totalAvailable: 0,
            recent: [],
            searchOptions: {
              limit: INITIAL_SEARCH_LIMIT,
              skip: SEARCH_SKIP
            },
            recentTransactionsRequest: {
              isExecuting: false,
              wasExecuted: false,
            },
            lastSyncInfo: {
              LastSyncInfoId: 1,
              Time: null,
              SlotNum: null,
              BlockHash: null,
              Height: 0,
            },
            unconfirmedAmount: {
              total: new MultiToken(
                [{
                  identifier: primaryAssetConstant.Identifier,
                  amount: new BigNumber(0),
                  networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
                }],
                defaultToken
              ),
              incoming: new MultiToken(
                [{
                  identifier: primaryAssetConstant.Identifier,
                  amount: new BigNumber(0),
                  networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
                }],
                defaultToken
              ),
              outgoing: new MultiToken(
                [{
                  identifier: primaryAssetConstant.Identifier,
                  amount: new BigNumber(0),
                  networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
                }],
                defaultToken
              ),
              incomingInSelectedCurrency: new BigNumber(0),
              outgoingInSelectedCurrency: new BigNumber(0),
            },
            isExporting: false,
            exportError: undefined,
          },
          delegation: {
            getDelegationRequests: lookup.getDelegation,
          },
          walletSettings: {
            getPublicDeriverSettingsCache: lookup.getPublicDeriverSettingsCache,
          },
        },
        actions,
      }}
    />)
  );
};

const genDefaultGroupMap: (
  boolean => Map<Class<IAddressTypeStore>, IAddressTypeUiSubset>
) = (wasExecuted) => {
  return new Map(
    allAddressSubgroups.map(type => [
      type.class,
      {
        all: [],
        wasExecuted,
      },
    ])
  );
};

const genPropsForTransactions: {|
  wallet: PossibleCacheTypes,
  getPublicDeriverSettingsCache:
    typeof WalletSettingsStore.prototype.getPublicDeriverSettingsCache,
  transactions: Array<WalletTransaction>,
  isLoadingTxs?: boolean,
  dialog?: *,
  memo?: *,
  txExport?: {|
    isExporting: boolean,
    exportError: ?LocalizableError
  |},
  lastSyncInfo: LastSyncInfoRow,
  topLevelNotification?: *,
|} => * = (request) => ({
  explorers: {
    selectedExplorer: defaultToSelectedExplorer(),
  },
  profile: {
    shouldHideBalance: request.txExport == null ? boolean('shouldHideBalance', false) : false,
    isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
    unitOfAccount: genUnitOfAccount(),
    selectedComplexityLevel: select('complexityLevel', ComplexityLevels, ComplexityLevels.Simple),
  },
  uiDialogs: {
    isOpen: (dialog) => dialog === request.dialog,
    getParam: () => (undefined: any)
  },
  uiNotifications: {
    mostRecentActiveNotification: request.topLevelNotification,
    isOpen: () => request.topLevelNotification != null,
    getTooltipActiveNotification: () => null,
  },
  wallets: {
    selected: request.wallet.publicDeriver,
  },
  coinPriceStore: {
    getCurrentPrice: (_from, _to) => '5',
  },
  tokenInfoStore: {
    tokenInfo: mockFromDefaults(defaultAssets),
  },
  memos: request.memo || {
    hasSetSelectedExternalStorageProvider: false,
    selectedTransaction: undefined,
    error: undefined,
    getIdForWallet: () => '',
    txMemoMap: new Map(),
  },
  transactions: {
    hasAny: request.transactions.length > 0,
    totalAvailable: request.transactions.length,
    recent: request.transactions,
    searchOptions: {
      limit: INITIAL_SEARCH_LIMIT,
      skip: SEARCH_SKIP
    },
    recentTransactionsRequest: {
      isExecuting: request.isLoadingTxs || false,
      wasExecuted: true,
    },
    lastSyncInfo: request.lastSyncInfo,
    unconfirmedAmount: { incoming: [], outgoing: [], },
    isExporting: request.txExport != null ? request.txExport.isExporting : false,
    exportError: request.txExport?.exportError,
    toggleIncludeTxIds: () => {},
    shouldIncludeTxIds: false,
  },
  addresses: {
    addressSubgroupMap: (() => {
      const defaultMap = genDefaultGroupMap(true);
      defaultMap.set(
        BYRON_EXTERNAL.class,
        {
          all: [
            { address: 'Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf', type: CoreAddressTypes.CARDANO_LEGACY }
          ],
          wasExecuted: true,
        }
      );
      defaultMap.set(
        BYRON_INTERNAL.class,
        {
          all: [{ address: 'Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM', type: CoreAddressTypes.CARDANO_LEGACY }],
          wasExecuted: true,
        }
      );
      return defaultMap;
    })(),
  },
  walletSettings: {
    getPublicDeriverSettingsCache: request.getPublicDeriverSettingsCache,
  },
  delegation: {
    getDelegationRequests: request.wallet.getDelegation
      ? request.wallet.getDelegation
      : () => undefined,
  },
});

export const Transaction = (): Node => {
  const genWallet = () => {
    const wallet = genByronSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const primaryAssetConstant = defaultAssets.filter(
    asset => asset.NetworkId === wallet.publicDeriver.getParent().getNetworkInfo().NetworkId
  )[0];
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

  const state = select(
    'txStatus',
    TxStatusCodes,
    TxStatusCodes.IN_BLOCK
  );
  const confirmationCases = {
    Low: 0,
    Medium: assuranceModes.NORMAL.low,
    High: assuranceModes.NORMAL.medium,
  };
  const certificateCases = {
    None: -1,
    ...RustModule.WalletV3.CertificateKind
  };
  const certificateSelect = select(
    'certificate',
    certificateCases,
    certificateCases.None
  );
  const certificates = certificateSelect === certificateCases.None
    ? []
    : [{
      relatedAddresses: [],
      certificate: {
        CertificateId: 0,
        TransactionId: 0,
        Kind: certificateSelect,
        Ordinal: 0,
        Payload: ''
      },
    }];

  const baseTxProps = {
    txid: '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
    block: {
      BlockId: 1,
      SlotNum: 0,
      Height: 0,
      Digest: 0.0,
      Hash: '111111865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
      BlockTime: new Date(0),
    },
    type: select(
      'txDirection',
      transactionTypes,
      transactionTypes.EXPEND
    ),
    amount: new MultiToken(
      [{
        identifier: primaryAssetConstant.Identifier,
        amount: new BigNumber(1000_000_000),
        networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
      }],
      defaultToken
    ),
    fee: new MultiToken(
      [{
        identifier: primaryAssetConstant.Identifier,
        amount: new BigNumber(5_000_000),
        networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
      }],
      defaultToken
    ),
    date: new Date(0),
    addresses: {
      from: [{
        address: 'Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf',
        value: new MultiToken(
          [{
            identifier: primaryAssetConstant.Identifier,
            amount: new BigNumber(1010_000_000),
            networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
          }],
          defaultToken
        ),
      }],
      to: [
        {
          address: 'Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM',
          value: new MultiToken(
            [{
              identifier: primaryAssetConstant.Identifier,
              amount: new BigNumber(5_000_000),
              networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
            }],
            defaultToken
          ),
        },
        {
          address: 'DdzFFzCqrhseVmPAqenKdENxL5Fp7DW82CF6wk8SnWoCiUDFfVfqD6cHFCFgv1ySmFhpPod3hYqzuRFs48BbT6QR9rk9bYMdgodBXFny',
          value: new MultiToken(
            [{
              identifier: primaryAssetConstant.Identifier,
              amount: new BigNumber(1000_000_000),
              networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
            }],
            defaultToken
          ),
        },
      ],
    },
    state,
    errorMsg: null,
  };
  const walletTransaction = certificates.length === 0
    ? new CardanoByronTransaction(baseTxProps)
    : new JormungandrTransaction({
      ...baseTxProps,
      certificates,
    });
  const transactions = [walletTransaction];

  const numConfirmations = state === TxStatusCodes.IN_BLOCK
    ? select(
      'confirmations',
      confirmationCases,
      confirmationCases.Low
    )
    : confirmationCases.Low;

  const notification = select(
    'notification',
    [
      'None',
      ...Object.keys(WalletCreationNotifications),
    ],
    'None'
  );
  return wrapWallet(
    mockWalletProps({
      location: ROUTES.WALLETS.TRANSACTIONS,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    // $FlowFixMe[incompatible-type]: Revamp props
    (<WalletSummaryPage
      generated={{
        stores: genPropsForTransactions({
          wallet,
          getPublicDeriverSettingsCache: lookup.getPublicDeriverSettingsCache,
          transactions,
          lastSyncInfo: {
            LastSyncInfoId: 1,
            Time: new Date(1),
            SlotNum: numConfirmations,
            BlockHash: walletTransaction.block?.Hash || '',
            Height: numConfirmations,
          },
          topLevelNotification: notification === 'None'
            ? undefined
            : WalletCreationNotifications[notification]
        }),
        actions,
      }}
    />)
  );
};

export const TransactionWithMemo = (): Node => {
  const genWallet = () => {
    const wallet = genByronSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const primaryAssetConstant = defaultAssets.filter(
    asset => asset.NetworkId === wallet.publicDeriver.getParent().getNetworkInfo().NetworkId
  )[0];
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

  const walletTransaction = new CardanoByronTransaction({
    txid: '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
    block: {
      BlockId: 1,
      SlotNum: 0,
      Height: 0,
      Digest: 0.0,
      Hash: '111111865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
      BlockTime: new Date(0),
    },
    type: select(
      'txDirection',
      transactionTypes,
      transactionTypes.EXPEND
    ),
    amount: new MultiToken(
      [{
        identifier: primaryAssetConstant.Identifier,
        amount: new BigNumber(1000_000_000),
        networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
      }],
      defaultToken
    ),
    fee: new MultiToken(
      [{
        identifier: primaryAssetConstant.Identifier,
        amount: new BigNumber(6_000_000),
        networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
      }],
      defaultToken
    ),
    date: new Date(0),
    addresses: {
      from: [{
        address: 'Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf',
        value: new MultiToken(
          [{
            identifier: primaryAssetConstant.Identifier,
            amount: new BigNumber(1005_000_000),
            networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
          }],
          defaultToken
        ),
      }],
      to: [{
        address: 'Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM',
        value: new MultiToken(
          [{
            identifier: primaryAssetConstant.Identifier,
            amount: new BigNumber(1000_000_000),
            networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
          }],
          defaultToken
        )
      }],
    },
    state: TxStatusCodes.IN_BLOCK,
    errorMsg: null,
  });
  const transactions = [walletTransaction];
  return wrapWallet(
    mockWalletProps({
      location: ROUTES.WALLETS.TRANSACTIONS,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    // $FlowFixMe[incompatible-type]: Revamp props
    (<WalletSummaryPage
      generated={{
        stores: genPropsForTransactions({
          wallet,
          getPublicDeriverSettingsCache: lookup.getPublicDeriverSettingsCache,
          transactions,
          lastSyncInfo: {
            LastSyncInfoId: 1,
            Time: new Date(1),
            SlotNum: 1,
            BlockHash: walletTransaction.block?.Hash || '',
            Height: 1,
          },
          memo: {
            hasSetSelectedExternalStorageProvider: false,
            selectedTransaction: walletTransaction,
            error: undefined,
            getIdForWallet: () => 'DNKO-8098',
            txMemoMap: new Map([['DNKO-8098', new Map([[walletTransaction.txid, {
              Digest: 1,
              WalletId: 'DNKO-8098',
              Content: 'foo',
              TransactionHash: walletTransaction.txid,
              LastUpdated: new Date(0),
            }]])]]),
          },
        }),
        actions,
      }}
    />)
  );
};

export const MemoDialog = (): Node => {
  const genWallet = () => {
    const wallet = genByronSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const primaryAssetConstant = defaultAssets.filter(
    asset => asset.NetworkId === wallet.publicDeriver.getParent().getNetworkInfo().NetworkId
  )[0];
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

  const walletTransaction = new CardanoByronTransaction({
    txid: '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
    block: {
      BlockId: 1,
      SlotNum: 0,
      Height: 0,
      Digest: 0.0,
      Hash: '111111865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
      BlockTime: new Date(0),
    },
    type: select(
      'txDirection',
      transactionTypes,
      transactionTypes.EXPEND
    ),
    amount: new MultiToken(
      [{
        identifier: primaryAssetConstant.Identifier,
        amount: new BigNumber(1000_000_000),
        networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
      }],
      defaultToken
    ),
    fee: new MultiToken(
      [{
        identifier: primaryAssetConstant.Identifier,
        amount: new BigNumber(5_000_000),
        networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
      }],
      defaultToken
    ),
    date: new Date(0),
    addresses: {
      from: [{
        address: 'Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf',
        value: new MultiToken(
          [{
            identifier: primaryAssetConstant.Identifier,
            amount: new BigNumber(1005_000_000),
            networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
          }],
          defaultToken
        ),
      }],
      to: [{
        address: 'Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM',
        value: new MultiToken(
          [{
            identifier: primaryAssetConstant.Identifier,
            amount: new BigNumber(1000_000_000),
            networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
          }],
          defaultToken
        ),
      }],
    },
    state: TxStatusCodes.IN_BLOCK,
    errorMsg: null,
  });
  const transactions = [walletTransaction];

  const dialogCases = {
    Add: 0,
    Edit: 1,
    Delete: 2,
  };
  const dialog = (() => {
    const dialogCase = select('dialog', dialogCases, dialogCases.Add);
    if (dialogCase === dialogCases.Add) return AddMemoDialog;
    if (dialogCase === dialogCases.Edit) return EditMemoDialog;
    if (dialogCase === dialogCases.Delete) return DeleteMemoDialog;
    throw new Error(`Unknown dialog case ${dialogCase}`);
  })();
  return wrapWallet(
    mockWalletProps({
      location: ROUTES.WALLETS.TRANSACTIONS,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    // $FlowFixMe[incompatible-type]: Revamp props
    (<WalletSummaryPage
      generated={{
        stores: genPropsForTransactions({
          wallet,
          getPublicDeriverSettingsCache: lookup.getPublicDeriverSettingsCache,
          transactions,
          lastSyncInfo: {
            LastSyncInfoId: 1,
            Time: new Date(1),
            SlotNum: 1,
            BlockHash: walletTransaction.block?.Hash || '',
            Height: 1,
          },
          dialog,
          memo: {
            hasSetSelectedExternalStorageProvider: false,
            selectedTransaction: walletTransaction,
            error: undefined,
            getIdForWallet: () => 'DNKO-8098',
            txMemoMap: new Map([['DNKO-8098', new Map([[walletTransaction.txid, {
              Digest: 1,
              WalletId: 'DNKO-8098',
              Content: 'foo',
              TransactionHash: walletTransaction.txid,
              LastUpdated: new Date(0),
            }]])]]),
          },
        }),
        actions,
      }}
    />)
  );
};

export const NoTransactions = (): Node => {
  const genWallet = () => {
    const wallet = genByronSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const transactions = [];
  return wrapWallet(
    mockWalletProps({
      location: ROUTES.WALLETS.TRANSACTIONS,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    // $FlowFixMe[incompatible-type]: Revamp props
    (<WalletSummaryPage
      generated={{
        stores: genPropsForTransactions({
          wallet,
          getPublicDeriverSettingsCache: lookup.getPublicDeriverSettingsCache,
          transactions,
          lastSyncInfo: {
            LastSyncInfoId: 1,
            Time: null,
            SlotNum: null,
            BlockHash: null,
            Height: 0,
          },
        }),
        actions,
      }}
    />)
  );
};

export const ManyTransactions = (): Node => {
  const genWallet = () => {
    const wallet = genByronSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const primaryAssetConstant = defaultAssets.filter(
    asset => asset.NetworkId === wallet.publicDeriver.getParent().getNetworkInfo().NetworkId
  )[0];
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

  const transactions = [];
  for (let i = INITIAL_SEARCH_LIMIT; i >= 0; i--) {
    transactions.push(new CardanoByronTransaction({
      txid: `915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7${i}`,
      block: {
        BlockId: i + 1,
        SlotNum: i,
        Height: i,
        Digest: i,
        Hash: `111111865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7${i}`,
        BlockTime: new Date(Math.floor(i / 2) * (24 * 60 * 60 * 1000)),
      },
      type: transactionTypes.EXPEND,
      amount: new MultiToken(
        [{
          identifier: primaryAssetConstant.Identifier,
          amount: new BigNumber(1000_000_000),
          networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
        }],
        defaultToken
      ),
    fee: new MultiToken(
      [{
        identifier: primaryAssetConstant.Identifier,
        amount: new BigNumber(5_000_000),
        networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
      }],
      defaultToken
    ),
      // make groups of 2 transactions each
      date: new Date(Math.floor(i / 2) * (24 * 60 * 60 * 1000)),
      addresses: {
        from: [{
          address: 'Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf',
          value: new MultiToken(
            [{
              identifier: primaryAssetConstant.Identifier,
              amount: new BigNumber(1005_000_000),
              networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
            }],
            defaultToken
          ),
        }],
        to: [{
          address: 'Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM',
          value: new MultiToken(
            [{
              identifier: primaryAssetConstant.Identifier,
              amount: new BigNumber(1000_000_000),
              networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
            }],
            defaultToken
          )
        }],
      },
      state: TxStatusCodes.IN_BLOCK,
      errorMsg: null,
    }));
  }

  return wrapWallet(
    mockWalletProps({
      location: ROUTES.WALLETS.TRANSACTIONS,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    // $FlowFixMe[incompatible-type]: Revamp props
    (<WalletSummaryPage
      generated={{
        stores: genPropsForTransactions({
          wallet,
          getPublicDeriverSettingsCache: lookup.getPublicDeriverSettingsCache,
          transactions,
          lastSyncInfo: {
            LastSyncInfoId: 1,
            Time: transactions[0].block?.BlockTime || new Date(0),
            SlotNum: transactions[0].block?.Height || 0,
            BlockHash: transactions[0].block?.Hash || '',
            Height: transactions[0].block?.Height || 0,
          },
          isLoadingTxs: boolean('isLoadingMoreTransactions', false)
        }),
        actions,
      }}
    />)
  );
};

export const TxHistoryExport = (): Node => {
  const genWallet = () => {
    const wallet = genByronSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const primaryAssetConstant = defaultAssets.filter(
    asset => asset.NetworkId === wallet.publicDeriver.getParent().getNetworkInfo().NetworkId
  )[0];
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

  const transactions = [new CardanoByronTransaction({
    txid: '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
    block: {
      BlockId: 1,
      SlotNum: 0,
      Height: 0,
      Digest: 0.0,
      Hash: '111111865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
      BlockTime: new Date(0),
    },
    type: transactionTypes.EXPEND,
    amount: new MultiToken(
      [{
        identifier: primaryAssetConstant.Identifier,
        amount: new BigNumber(1000_000_000),
        networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
      }],
      defaultToken
    ),
    fee: new MultiToken(
      [{
        identifier: primaryAssetConstant.Identifier,
        amount: new BigNumber(6_000_000),
        networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
      }],
      defaultToken
    ),
    date: new Date(0),
    addresses: {
      from: [{
        address: 'Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf',
        value: new MultiToken(
          [{
            identifier: primaryAssetConstant.Identifier,
            amount: new BigNumber(1005_000_000),
            networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
          }],
          defaultToken
        ),
      }],
      to: [{
        address: 'Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM',
        value: new MultiToken(
          [{
            identifier: primaryAssetConstant.Identifier,
            amount: new BigNumber(1000_000_000),
            networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
          }],
          defaultToken
        )
      }],
    },
    state: TxStatusCodes.IN_BLOCK,
    errorMsg: null,
  })];
  const errorCases = {
    None: undefined,
    HasError: new GenericApiError(),
  };
  const getErrorValue = () => select('error', errorCases, errorCases.None);
  return wrapWallet(
    mockWalletProps({
      location: ROUTES.WALLETS.TRANSACTIONS,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    // $FlowFixMe[incompatible-type]: Revamp props
    (<WalletSummaryPage
      generated={{
        stores: genPropsForTransactions({
          wallet,
          getPublicDeriverSettingsCache: lookup.getPublicDeriverSettingsCache,
          transactions,
          lastSyncInfo: {
            LastSyncInfoId: 1,
            Time: new Date(1),
            SlotNum: 1,
            BlockHash: transactions[0].block?.Hash || '',
            Height: 1,
          },
          dialog: ExportTransactionDialog,
          txExport: {
            isExporting: boolean('isExporting', false),
            exportError: getErrorValue() === errorCases.None
              ? undefined
              : getErrorValue(),
          },
        }),
        actions,
      }}
    />)
  );
};

export const DebugWalletWarning = (): Node => {
  const genWallet = () => {
    const wallet = genByronSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const getPlate: PublicDeriver<> => string = (publicDeriver) => {
    const withPubKey = asGetPublicKey(publicDeriver);
    if (withPubKey == null) throw new Error('No checksum found for storybook wallet');
    return lookup.getPublicKeyCache(withPubKey).plate.TextPart;
  };

  const transactions = [];
  return wrapWallet(
    mockWalletProps({
      location: ROUTES.WALLETS.TRANSACTIONS,
      selected: wallet.publicDeriver,
      getWalletWarnings: (publicDeriver) => ({
        publicDeriver,
        dialogs: publicDeriver === wallet.publicDeriver
          ? [createDebugWalletDialog(
            getPlate(wallet.publicDeriver),
            action('close DebugWalletDialog'),
            { generated: Object.freeze({}) },
          )]
          : [],
      }),
      ...lookup,
    }),
    // $FlowFixMe[incompatible-type]: Revamp props
    (<WalletSummaryPage
      generated={{
        stores: genPropsForTransactions({
          wallet,
          getPublicDeriverSettingsCache: lookup.getPublicDeriverSettingsCache,
          transactions,
          lastSyncInfo: {
            LastSyncInfoId: 1,
            Time: null,
            SlotNum: null,
            BlockHash: null,
            Height: 0,
          },
        }),
        actions,
      }}
    />)
  );
};
