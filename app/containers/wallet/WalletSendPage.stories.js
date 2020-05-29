// @flow

import type { Node } from 'react';
import React from 'react';
import BigNumber from 'bignumber.js';

import { boolean, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import WalletSendPage from './WalletSendPage';
import { THEMES } from '../../themes';
import environment from '../../environment';
import { withScreenshot } from 'storycap';
import {
  globalKnobs,
  walletLookup,
  genSigningWalletWithCache,
  ledgerErrorCases,
  trezorErrorCases,
  mockTrezorMeta,
  mockLedgerMeta,
  genTentativeTx,
  genUnitOfAccount,
} from '../../../stories/helpers/StoryWrapper';
import type { CacheValue } from '../../../stories/helpers/StoryWrapper';
import MemoNoExternalStorageDialog from '../../components/wallet/memos/MemoNoExternalStorageDialog';
import { wrapWallet } from '../../Routes';
import { mockWalletProps } from './Wallet.mock';
import { getDefaultExplorer } from '../../domain/Explorer';
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';
import { InvalidWitnessError } from '../../api/ada/errors';
import WalletSendConfirmationDialog from '../../components/wallet/send/WalletSendConfirmationDialog';
import HWSendConfirmationDialog from '../../components/wallet/send/HWSendConfirmationDialog';

export default {
  title: `${__filename.split('.')[0]}`,
  component: WalletSendPage,
  decorators: [withScreenshot],
};

const getRoute = (id) => buildRoute(
  ROUTES.WALLETS.SEND,
  { id, }
);

const genBaseProps: {|
  wallet: CacheValue,
  dialogInfo?: {|
    sendMoneyRequest: *,
    transactionBuilderStore: *,
  |},
  noExternalStorage?: boolean,
  initialShowMemoState?: boolean,
  hwSend?: *,
|} => * = (request) => ({
  initialShowMemoState: request.initialShowMemoState || false,
  stores: {
    profile: {
      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
      selectedExplorer: getDefaultExplorer(),
      unitOfAccount: genUnitOfAccount(),
    },
    wallets: {
      selected: request.wallet.publicDeriver,
    },
    coinPriceStore: {
      getCurrentPrice: (_from, _to) => 5,
    },
    memos: {
      hasSetSelectedExternalStorageProvider: false,
    },
    loading: {
      uriParams: undefined,
      resetUriParams: action('resetUriParams'),
    },
    uiDialogs: {
      getParam: () => (undefined: any),
      isOpen: (clazz) => {
        if (clazz === WalletSendConfirmationDialog) {
          return request.dialogInfo != null && request.hwSend == null;
        }
        if (clazz === HWSendConfirmationDialog) {
          return request.dialogInfo != null && request.hwSend != null;
        }
        if (clazz === MemoNoExternalStorageDialog) {
          return request.noExternalStorage === true;
        }
        return false;
      },
    },
    transactions: {
      hasAnyPending: request.dialogInfo == null
        ? boolean('hasAnyPending', false)
        : false,
    },
    substores: {
      ada: {
        ledgerSend: request.hwSend || {
          isActionProcessing: false,
          error: undefined,
        },
        trezorSend: request.hwSend || {
          isActionProcessing: false,
          error: undefined,
        },
        transactionBuilderStore: request.dialogInfo == null
          ? {
            totalInput: undefined,
            fee: undefined,
            shouldSendAll: boolean('shouldSendAll', false),
            tentativeTx: null,
            txMismatch: false,
            createUnsignedTx: {
              isExecuting: boolean('isExecuting', false),
              error: undefined,
            },
          }
          : request.dialogInfo.transactionBuilderStore,
      },
    },
  },
  actions: {
    dialogs: {
      open: { trigger: action('open') },
      closeActiveDialog: { trigger: action('closeActiveDialog') },
    },
    router: {
      goToRoute: { trigger: action('goToRoute') },
    },
    memos: {
      closeMemoDialog: { trigger: action('closeMemoDialog') },
    },
    ada: {
      ledgerSend: {
        init: { trigger: action('init') },
        cancel: { trigger: action('cancel') },
        sendUsingLedger: { trigger: async (req) => action('sendUsingLedger')(req) },
      },
      trezorSend: {
        cancel: { trigger: action('cancel') },
        sendUsingTrezor: { trigger: async (req) => action('sendUsingTrezor')(req) },
      },
      txBuilderActions: {
        updateTentativeTx: { trigger: action('updateTentativeTx') },
        updateReceiver: { trigger: action('updateReceiver') },
        updateAmount: { trigger: action('updateAmount') },
        toggleSendAll: { trigger: action('toggleSendAll') },
        reset: { trigger: action('reset') },
        updateMemo: { trigger: action('updateMemo') },
      },
    },
  },
  WalletSendConfirmationDialogContainerProps: {
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
              sendMoneyRequest: request.dialogInfo == null
                ? (null: any)
                : request.dialogInfo.sendMoneyRequest,
            },
          },
        },
      },
      actions: {
        dialogs: {
          closeActiveDialog: {
            trigger: action('closeActiveDialog'),
          },
        },
        ada: {
          wallets: {
            sendMoney: {
              trigger: async (req) => action('sendMoney')(req),
            },
          },
        },
      },
    }
  }
});

export const UserInput = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (<WalletSendPage
      generated={genBaseProps({
        wallet,
      })}
    />)
  );
};

export const MemoDialog = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (<WalletSendPage
      generated={genBaseProps({
        wallet,
        noExternalStorage: true,
      })}
    />)
  );
};

export const MemoExpanded = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (<WalletSendPage
      generated={genBaseProps({
        wallet,
        initialShowMemoState: true,
      })}
    />)
  );
};

export const RegularConfirmationDialog = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const { tentativeTx, inputAmount, fee } = genTentativeTx();
  const errorCases = Object.freeze({
    None: undefined,
    InvalidWitness: new InvalidWitnessError(),
  });
  const getErrorValue = () => select(
    'errorCases',
    errorCases,
    errorCases.None
  );
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (<WalletSendPage
      generated={genBaseProps({
        wallet,
        dialogInfo: {
          sendMoneyRequest: {
            isExecuting: boolean('isExecuting', false),
            reset: action('reset'),
            error: getErrorValue(),
          },
          transactionBuilderStore: {
            totalInput: new BigNumber(inputAmount),
            fee,
            shouldSendAll: false,
            tentativeTx,
            txMismatch: boolean('txMismatch', false),
            createUnsignedTx: {
              isExecuting: false,
              error: undefined,
            },
          }
        }
      })}
    />)
  );
};

export const LedgerConfirmationDialog = (): Node => {
  const wallet = genSigningWalletWithCache(ConceptualWalletId => ({
    ConceptualWalletId,
    ...mockLedgerMeta
  }));
  const lookup = walletLookup([wallet]);

  const { tentativeTx, inputAmount, fee } = genTentativeTx();
  const getErrorValue = () => select(
    'errorCases',
    ledgerErrorCases,
    ledgerErrorCases.None
  );
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    !environment.isShelley() && (<WalletSendPage
      generated={genBaseProps({
        wallet,
        hwSend: {
          isActionProcessing: boolean('isActionProcessing', false),
          error: getErrorValue() === ledgerErrorCases.None
            ? undefined
            : getErrorValue(),
        },
        dialogInfo: {
          sendMoneyRequest: {
            isExecuting: false,
            reset: action('reset'),
            error: undefined,
          },
          transactionBuilderStore: {
            totalInput: new BigNumber(inputAmount),
            fee,
            shouldSendAll: false,
            tentativeTx,
            txMismatch: boolean('txMismatch', false),
            createUnsignedTx: {
              isExecuting: false,
              error: undefined,
            },
          }
        }
      })}
    />)
  );
};

export const TrezorConfirmationDialog = (): Node => {
  const wallet = genSigningWalletWithCache(ConceptualWalletId => ({
    ConceptualWalletId,
    ...mockTrezorMeta
  }));
  const lookup = walletLookup([wallet]);

  const { tentativeTx, inputAmount, fee } = genTentativeTx();
  const getErrorValue = () => select(
    'errorCases',
    trezorErrorCases,
    trezorErrorCases.None
  );
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    !environment.isShelley() && (<WalletSendPage
      generated={genBaseProps({
        wallet,
        hwSend: {
          isActionProcessing: boolean('isActionProcessing', false),
          error: getErrorValue() === trezorErrorCases.None
            ? undefined
            : getErrorValue(),
        },
        dialogInfo: {
          sendMoneyRequest: {
            isExecuting: false,
            reset: action('reset'),
            error: undefined,
          },
          transactionBuilderStore: {
            totalInput: new BigNumber(inputAmount),
            fee,
            shouldSendAll: false,
            tentativeTx,
            txMismatch: boolean('txMismatch', false),
            createUnsignedTx: {
              isExecuting: false,
              error: undefined,
            },
          }
        }
      })}
    />)
  );
};
