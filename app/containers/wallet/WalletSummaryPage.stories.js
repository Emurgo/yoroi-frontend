// @flow

import type { Node } from 'react';
import React from 'react';
import BigNumber from 'bignumber.js';
import { boolean, select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withScreenshot } from 'storycap';
import {
  walletLookup,
  globalKnobs,
  genSigningWalletWithCache,
  genUnitOfAccount,
} from '../../../stories/helpers/StoryWrapper';
import type {
  CacheValue,
} from '../../../stories/helpers/StoryWrapper';
import LocalizableError from '../../i18n/LocalizableError';
import { GenericApiError, } from '../../api/common';
import WalletSummaryPage from './WalletSummaryPage';
import { getDefaultExplorer } from '../../domain/Explorer';
import { THEMES } from '../../themes';
import { mockWalletProps } from './Wallet.mock';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import AddMemoDialog from '../../components/wallet/memos/AddMemoDialog';
import EditMemoDialog from '../../components/wallet/memos/EditMemoDialog';
import DeleteMemoDialog from '../../components/wallet/memos/DeleteMemoDialog';
import { wrapWallet } from '../../Routes';
import {
  INITIAL_SEARCH_LIMIT,
  SEARCH_SKIP,
} from '../../stores/base/TransactionsStore';
import {
  calculateUnconfirmedAmount,
} from '../../stores/ada/AdaTransactionsStore';
import ExportTransactionDialog from '../../components/wallet/export/ExportTransactionDialog';
import WalletTransaction from '../../domain/WalletTransaction';
import { transactionTypes } from '../../api/ada/transactions/types';
import type { LastSyncInfoRow, } from '../../api/ada/lib/storage/database/walletTypes/core/tables';
import { TxStatusCodes } from '../../api/ada/lib/storage/database/primitives/enums';
import { assuranceModes, } from '../../config/transactionAssuranceConfig';
import WalletSettingsStore from '../../stores/base/WalletSettingsStore';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { getPriceKey } from '../../api/ada/lib/storage/bridge/prices';
import { createDebugWalletDialog } from './dialogs/DebugWalletDialogContainer';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetPublicKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';

export default {
  title: `${__filename.split('.')[0]}`,
  component: WalletSummaryPage,
  decorators: [withScreenshot],
};

const getRoute = (id) => buildRoute(
  ROUTES.WALLETS.TRANSACTIONS,
  { id, }
);

const actions = {
  profile: {
    updateHideBalance: { trigger: async (req) => action('updateHideBalance')(req) },
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
    open: { trigger: action('open') },
  },
  ada: {
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
  },
};

export const Loading = (): Node => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();
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
    (<WalletSummaryPage
      generated={{
        stores: {
          profile: {
            selectedExplorer: getDefaultExplorer(),
            shouldHideBalance: false,
            isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
            unitOfAccount: genUnitOfAccount(),
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
          },
          wallets: {
            selected: wallet.publicDeriver,
          },
          coinPriceStore: {
            priceMap: new Map(),
          },
          substores: {
            ada: {
              walletSettings: {
                getPublicDeriverSettingsCache: lookup.getPublicDeriverSettingsCache,
              },
              transactions: {
                hasAny: false,
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
                  total: new BigNumber(0),
                  incoming: new BigNumber(0),
                  outgoing: new BigNumber(0),
                  incomingInSelectedCurrency: new BigNumber(0),
                  outgoingInSelectedCurrency: new BigNumber(0),
                },
                isExporting: false,
                exportError: undefined,
              },
            },
          },
        },
        actions,
      }}
    />)
  );
};

const genPropsForTransactions: {|
  wallet: CacheValue,
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
|} => * = (request) => ({
  profile: {
    selectedExplorer: getDefaultExplorer(),
    shouldHideBalance: request.txExport == null ? boolean('shouldHideBalance', false) : false,
    isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
    unitOfAccount: genUnitOfAccount(),
  },
  uiDialogs: {
    isOpen: (dialog) => dialog === request.dialog,
    getParam: () => (undefined: any)
  },
  uiNotifications: {
    mostRecentActiveNotification: undefined, // TODO
  },
  wallets: {
    selected: request.wallet.publicDeriver,
  },
  coinPriceStore: {
    priceMap: (() => {
      const priceMap = new Map();
      // populate the map to match the mock txs we create
      for (let i = 0; i < 20; i++) {
        const time = (24 * 60 * 60 * 1000) * i;
        priceMap.set(getPriceKey('ADA', 'USD', new Date(time)), {
          From: 'ADA',
          To: 'USD',
          Time: new Date(time),
          Price: 5,
        });
      }
      return priceMap;
    })(),
  },
  memos: request.memo || {
    hasSetSelectedExternalStorageProvider: false,
    selectedTransaction: undefined,
    error: undefined,
    getIdForWallet: () => '',
    txMemoMap: new Map(),
  },
  substores: {
    ada: {
      walletSettings: {
        getPublicDeriverSettingsCache: request.getPublicDeriverSettingsCache,
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
        unconfirmedAmount: calculateUnconfirmedAmount(
          request.transactions,
          request.lastSyncInfo.Height,
          assuranceModes.NORMAL,
          (timestamp) => ({
            From: 'ADA',
            To: 'USD',
            Price: 5,
            Time: timestamp,
          }),
        ),
        isExporting: request.txExport != null ? request.txExport.isExporting : false,
        exportError: request.txExport?.exportError,
      },
    },
  },
});

export const Transaction = (): Node => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

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
  const certificate = certificateSelect === certificateCases.None
    ? undefined
    : {
      relatedAddresses: [],
      certificate: {
        CertificateId: 0,
        TransactionId: 0,
        Kind: certificateSelect,
        Payload: ''
      },
    };
  const walletTransaction = new WalletTransaction({
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
    amount: new BigNumber(1000),
    fee: new BigNumber(5),
    date: new Date(0),
    addresses: {
      from: ['Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf'],
      to: ['Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM'],
    },
    certificate,
    state,
    errorMsg: null,
  });
  const transactions = [walletTransaction];

  const numConfirmations = state === TxStatusCodes.IN_BLOCK
    ? select(
      'confirmations',
      confirmationCases,
      confirmationCases.Low
    )
    : confirmationCases.Low;
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
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
        }),
        actions,
      }}
    />)
  );
};

export const TransactionWithMemo = (): Node => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const walletTransaction = new WalletTransaction({
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
    amount: new BigNumber(1000),
    fee: new BigNumber(5),
    date: new Date(0),
    addresses: {
      from: ['Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf'],
      to: ['Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM'],
    },
    certificate: undefined,
    state: TxStatusCodes.IN_BLOCK,
    errorMsg: null,
  });
  const transactions = [walletTransaction];
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
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
    const wallet = genSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const walletTransaction = new WalletTransaction({
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
    amount: new BigNumber(1000),
    fee: new BigNumber(5),
    date: new Date(0),
    addresses: {
      from: ['Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf'],
      to: ['Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM'],
    },
    certificate: undefined,
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
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
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
    const wallet = genSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const transactions = [];
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
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
    const wallet = genSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const transactions = [];
  for (let i = INITIAL_SEARCH_LIMIT; i >= 0; i--) {
    transactions.push(new WalletTransaction({
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
      amount: new BigNumber(1000),
      fee: new BigNumber(5),
      // make groups of 2 transactions each
      date: new Date(Math.floor(i / 2) * (24 * 60 * 60 * 1000)),
      addresses: {
        from: ['Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf'],
        to: ['Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM'],
      },
      certificate: undefined,
      state: TxStatusCodes.IN_BLOCK,
      errorMsg: null,
    }));
  }

  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
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
    const wallet = genSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const transactions = [new WalletTransaction({
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
    amount: new BigNumber(1000),
    fee: new BigNumber(5),
    date: new Date(0),
    addresses: {
      from: ['Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf'],
      to: ['Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM'],
    },
    certificate: undefined,
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
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
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

export const DebugWalletWarning = () => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();
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
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
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
