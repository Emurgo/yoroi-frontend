// @flow

import React from 'react';
import BigNumber from 'bignumber.js';
import { boolean, select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withScreenshot } from 'storycap';
import {
  walletLookup,
  globalKnobs,
  genSigningWalletWithCache,
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
import { TxStatusCodes } from '../../api/ada/lib/storage/database/primitives/enums';
import { assuranceModes, } from '../../config/transactionAssuranceConfig';
import WalletSettingsStore from '../../stores/base/WalletSettingsStore';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

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

export const Loading = () => {
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
                unconfirmedAmount: {
                  total: new BigNumber(0),
                  incoming: new BigNumber(0),
                  outgoing: new BigNumber(0),
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
|} => * = (request) => ({
  profile: {
    selectedExplorer: getDefaultExplorer(),
    shouldHideBalance: request.txExport == null ? boolean('shouldHideBalance', false) : false,
    isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
  },
  uiDialogs: {
    isOpen: (dialog) => {
      console.log(request.dialog);
      return dialog === request.dialog;
    },
    getParam: () => (undefined: any)
  },
  uiNotifications: {
    mostRecentActiveNotification: undefined, // TODO
  },
  wallets: {
    selected: request.wallet.publicDeriver,
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
        unconfirmedAmount: calculateUnconfirmedAmount(
          request.transactions,
          assuranceModes.NORMAL
        ),
        isExporting: request.txExport != null ? request.txExport.isExporting : false,
        exportError: request.txExport?.exportError,
      },
    },
  },
});

export const Transaction = () => {
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
    blockHash: '111111865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
    type: select(
      'txDirection',
      transactionTypes,
      transactionTypes.EXPEND
    ),
    amount: new BigNumber(1000),
    fee: new BigNumber(5),
    date: new Date(0),
    numberOfConfirmations: state === TxStatusCodes.IN_BLOCK
      ? select(
        'confirmations',
        confirmationCases,
        confirmationCases.Low
      )
      : confirmationCases.Low,
    addresses: {
      from: ['Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf'],
      to: ['Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM'],
    },
    certificate,
    state,
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
          transactions
        }),
        actions,
      }}
    />)
  );
};

export const TransactionWithMemo = () => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const walletTransaction = new WalletTransaction({
    txid: '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
    blockHash: '111111865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
    type: select(
      'txDirection',
      transactionTypes,
      transactionTypes.EXPEND
    ),
    amount: new BigNumber(1000),
    fee: new BigNumber(5),
    date: new Date(0),
    numberOfConfirmations: 0,
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
          memo: {
            hasSetSelectedExternalStorageProvider: false,
            selectedTransaction: walletTransaction,
            error: undefined,
            getIdForWallet: () => 'DNKO-8098',
            txMemoMap: new Map([['DNKO-8098', new Map([[walletTransaction.txid, {
              TxMemoId: 0,
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

export const MemoDialog = () => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const walletTransaction = new WalletTransaction({
    txid: '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
    blockHash: '111111865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
    type: select(
      'txDirection',
      transactionTypes,
      transactionTypes.EXPEND
    ),
    amount: new BigNumber(1000),
    fee: new BigNumber(5),
    date: new Date(0),
    numberOfConfirmations: 0,
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
          dialog,
          memo: {
            hasSetSelectedExternalStorageProvider: false,
            selectedTransaction: walletTransaction,
            error: undefined,
            getIdForWallet: () => 'DNKO-8098',
            txMemoMap: new Map([['DNKO-8098', new Map([[walletTransaction.txid, {
              TxMemoId: 0,
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

export const NoTransactions = () => {
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
        }),
        actions,
      }}
    />)
  );
};

export const ManyTransactions = () => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const transactions = [];
  for (let i = 0; i < INITIAL_SEARCH_LIMIT + 1; i++) {
    transactions.push(new WalletTransaction({
      txid: '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
      blockHash: '111111865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
      type: transactionTypes.EXPEND,
      amount: new BigNumber(1000),
      fee: new BigNumber(5),
      // make groups of 2 transactions each
      date: new Date(Math.floor(i / 2) * (24 * 60 * 60 * 1000)),
      numberOfConfirmations: 0,
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
          isLoadingTxs: boolean('isLoadingMoreTransactions', false)
        }),
        actions,
      }}
    />)
  );
};

export const TxHistoryExport = () => {
  const genWallet = () => {
    const wallet = genSigningWalletWithCache();
    return wallet;
  };
  const wallet = genWallet();
  const lookup = walletLookup([wallet]);

  const transactions = [new WalletTransaction({
    txid: '915f2e6865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
    blockHash: '111111865fb31cc93410efb6c0e580ca74862374b3da461e20135c01f312e7c',
    type: transactionTypes.EXPEND,
    amount: new BigNumber(1000),
    fee: new BigNumber(5),
    date: new Date(0),
    numberOfConfirmations: 0,
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
