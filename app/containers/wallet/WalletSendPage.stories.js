// @flow

import type { Node } from 'react';
import React from 'react';

import { boolean, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import WalletSendPage from './WalletSendPage';
import { THEMES } from '../../themes';
import { withScreenshot } from 'storycap';
import {
  globalKnobs,
  ledgerErrorCases,
  trezorErrorCases,
  mockTrezorMeta,
  mockLedgerMeta,
  genUnitOfAccount,
} from '../../../stories/helpers/StoryWrapper';
import {
  walletLookup,
} from '../../../stories/helpers/WalletCache';
import {
  genShelleyCIP1852SigningWalletWithCache,
  genTentativeShelleyTx,
} from '../../../stories/helpers/cardano/ShelleyCip1852Mocks';
import type { PossibleCacheTypes } from '../../../stories/helpers/WalletCache';
import MemoNoExternalStorageDialog from '../../components/wallet/memos/MemoNoExternalStorageDialog';
import { wrapWallet } from '../../Routes';
import { mockWalletProps } from './Wallet.mock';
import { defaultToSelectedExplorer } from '../../domain/SelectedExplorer';
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';
import { InvalidWitnessError } from '../../api/common/errors';
import WalletSendConfirmationDialog from '../../components/wallet/send/WalletSendConfirmationDialog';
import HWSendConfirmationDialog from '../../components/wallet/send/HWSendConfirmationDialog';
import { defaultAssets, isJormungandr } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { mockFromDefaults, getDefaultEntryTokenInfo } from '../../stores/toplevel/TokenInfoStore';

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
  wallet: PossibleCacheTypes,
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
    explorers: {
      selectedExplorer: defaultToSelectedExplorer(),
    },
    profile: {
      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
      unitOfAccount: genUnitOfAccount(),
    },
    wallets: {
      selected: request.wallet.publicDeriver,
    },
    tokenInfoStore: {
      tokenInfo: mockFromDefaults(defaultAssets),
      getDefaultTokenInfo: networkId => getDefaultEntryTokenInfo(
        networkId,
        mockFromDefaults(defaultAssets)
      ),
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
      getBalanceRequest: {
        result: undefined,
      },
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
        selectedToken: undefined,
      }
      : request.dialogInfo.transactionBuilderStore,
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
      },
    },
  },
  actions: {
    dialogs: {
      push: { trigger: action('push') },
      closeActiveDialog: { trigger: action('closeActiveDialog') },
    },
    router: {
      goToRoute: { trigger: action('goToRoute') },
    },
    memos: {
      closeMemoDialog: { trigger: action('closeMemoDialog') },
    },
    txBuilderActions: {
      updateTentativeTx: { trigger: action('updateTentativeTx') },
      updateReceiver: { trigger: action('updateReceiver') },
      updateAmount: { trigger: action('updateAmount') },
      updateToken: { trigger: action('updateToken') },
      toggleSendAll: { trigger: action('toggleSendAll') },
      reset: { trigger: action('reset') },
      updateMemo: { trigger: action('updateMemo') },
    },
    ada: {
      ledgerSend: {
        init: { trigger: action('init') },
        cancel: { trigger: action('cancel') },
        sendUsingLedgerWallet: { trigger: async (req) => action('sendUsingLedgerWallet')(req) },
      },
      trezorSend: {
        cancel: { trigger: action('cancel') },
        sendUsingTrezor: { trigger: async (req) => action('sendUsingTrezor')(req) },
      },
    },
  },
  WalletSendConfirmationDialogContainerProps: {
    generated: {
      stores: {
        explorers: {
          selectedExplorer: defaultToSelectedExplorer(),
        },
        profile: {
          isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
        },
        coinPriceStore: {
          getCurrentPrice: (_from, _to) => 5,
        },
        tokenInfoStore: {
          tokenInfo: mockFromDefaults(defaultAssets),
        },
        wallets: {
          sendMoneyRequest: request.dialogInfo == null
            ? (null: any)
            : request.dialogInfo.sendMoneyRequest,
          selected: request.wallet.publicDeriver,
        },
      },
      actions: {
        dialogs: {
          closeActiveDialog: {
            trigger: action('closeActiveDialog'),
          },
        },
        wallets: {
          sendMoney: {
            trigger: async (req) => action('sendMoney')(req),
          },
        },
      },
    }
  }
});

export const UserInput = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
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
  const wallet = genShelleyCIP1852SigningWalletWithCache();
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
  const wallet = genShelleyCIP1852SigningWalletWithCache();
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
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const { tentativeTx, inputAmount, fee } = genTentativeShelleyTx(wallet.publicDeriver);
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
            totalInput: inputAmount,
            fee,
            shouldSendAll: false,
            tentativeTx,
            txMismatch: boolean('txMismatch', false),
            createUnsignedTx: {
              isExecuting: false,
              error: undefined,
            },
            selectedToken: undefined,
          }
        }
      })}
    />)
  );
};

export const LedgerConfirmationDialog = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache(ConceptualWalletId => ({
    ConceptualWalletId,
    ...mockLedgerMeta
  }));
  const lookup = walletLookup([wallet]);

  const { tentativeTx, inputAmount, fee } = genTentativeShelleyTx(wallet.publicDeriver);
  const getErrorValue = () => select(
    'errorCases',
    ledgerErrorCases,
    ledgerErrorCases.None
  );
  const network = wallet.publicDeriver.getParent().getNetworkInfo();
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    !isJormungandr(network) && (<WalletSendPage
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
            totalInput: inputAmount,
            fee,
            shouldSendAll: false,
            tentativeTx,
            txMismatch: boolean('txMismatch', false),
            createUnsignedTx: {
              isExecuting: false,
              error: undefined,
            },
            selectedToken: undefined,
          }
        }
      })}
    />)
  );
};

export const TrezorConfirmationDialog = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache(ConceptualWalletId => ({
    ConceptualWalletId,
    ...mockTrezorMeta
  }));
  const lookup = walletLookup([wallet]);

  const { tentativeTx, inputAmount, fee } = genTentativeShelleyTx(wallet.publicDeriver);
  const getErrorValue = () => select(
    'errorCases',
    trezorErrorCases,
    trezorErrorCases.None
  );
  const network = wallet.publicDeriver.getParent().getNetworkInfo();
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    !isJormungandr(network) && (<WalletSendPage
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
            totalInput: inputAmount,
            fee,
            shouldSendAll: false,
            tentativeTx,
            txMismatch: boolean('txMismatch', false),
            createUnsignedTx: {
              isExecuting: false,
              error: undefined,
            },
            selectedToken: undefined,
          }
        }
      })}
    />)
  );
};
