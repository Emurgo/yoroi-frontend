// fixme broken flow
// eslint-disable-next-line flowtype/require-valid-file-annotation
import type { Node } from 'react';

import { boolean, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import WalletSendPage from './WalletSendPage';
import { THEMES } from '../../styles/utils';
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
import {
  genErgoSigningWalletWithCache,
  genTentativeErgoTx,
} from '../../../stories/helpers/ergo/ErgoMocks';
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
import { defaultAssets, isErgo } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { mockFromDefaults, getDefaultEntryTokenInfo, mockDefaultToken } from '../../stores/toplevel/TokenInfoStore';
import { MultiToken } from '../../api/common/lib/MultiToken';
import BigNumber from 'bignumber.js';

export default {
  title: `${__filename.split('.')[0]}`,
  component: WalletSendPage,
  decorators: [withScreenshot],
};

const getRoute = (id) => buildRoute(
  ROUTES.WALLETS.SEND,
  { id, }
);

const genTokenInfoMap = (network) => {
  const map = mockFromDefaults(defaultAssets)

  if (isErgo(network)) {
    map.get(network.NetworkId.toString())
      ?.set(
        'f2b5c4e4883555b882e3a5919967883aade9e0494290f29e0e3069f5ce9eabe4',
        {
          Digest: 1234,
          TokenId: 1234,
          NetworkId: network.NetworkId,
          Identifier: 'f2b5c4e4883555b882e3a5919967883aade9e0494290f29e0e3069f5ce9eabe4',
          IsDefault: false,
          IsNFT: false,
          Metadata: {
            type: 'Ergo',
            height: 0,
            boxId: 'dc18a160f90e139f4813759d86db87b7f80db228de8f6b8c493da954042881ef',
            ticker: null,
            longName: 'Cool Token',
            numberOfDecimals: 3, // units per ERG
            description: null,
          }
        }
      );
  }

  return map;
}

const genBaseProps: {|
  wallet: PossibleCacheTypes,
  dialogInfo?: {|
    sendMoneyRequest: any,
    transactionBuilderStore: any,
  |},
  noExternalStorage?: boolean,
  initialShowMemoState?: boolean,
  hwSend?: *,
  balance: *,
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
      tokenInfo: genTokenInfoMap(
        request.wallet.publicDeriver.getParent().getNetworkInfo()
      ),
      getDefaultTokenInfo: networkId => getDefaultEntryTokenInfo(
        networkId,
        mockFromDefaults(defaultAssets)
      ),
    },
    coinPriceStore: {
      getCurrentPrice: (_from, _to) => '5',
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
        result: request.balance,
      },
    },
    transactionBuilderStore: request.dialogInfo == null
      ? {
        totalInput: undefined,
        maxAssetsAllowed: 10,
        fee: undefined,
        shouldSendAll: boolean('shouldSendAll', false),
        tentativeTx: null,
        txMismatch: false,
        createUnsignedTx: {
          isExecuting: boolean('isExecuting', false),
          error: undefined,
        },
        selectedToken: undefined,
        plannedTxInfoMap: [],
        calculateMinAda: () => '1',
        isDefaultIncluded: false,
        minAda: undefined,
        maxSendableAmount: { isExecuting: false, error: undefined, result: undefined },
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
      addToken: { trigger: action('addToken') },
      removeTokens: { trigger: action('removeTokens') },
      updateSendAllStatus: { trigger: action('updateSendAllStatus') },
      reset: { trigger: action('reset') },
      updateMemo: { trigger: action('updateMemo') },
      deselectToken: { trigger: action('deselectToken') },
      calculateMaxAmount: { trigger: async (req) => action('calculateMaxAmount')(req) },
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
          getCurrentPrice: (_from, _to) => '5',
        },
        tokenInfoStore: {
          tokenInfo: genTokenInfoMap(
            request.wallet.publicDeriver.getParent().getNetworkInfo()
          ),
        },
        wallets: {
          sendMoneyRequest: request.dialogInfo == null
            ? (null: any)
            : request.dialogInfo.sendMoneyRequest,
          selected: request.wallet.publicDeriver,
        },
        ledgerSend: {
          error: null,
        },
        trezorSend: {
          error: null,
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
        ada: {
          ledgerSend: {
            sendUsingLedger: {
              trigger: async (req) => action('sendUsingLedger')(req),
            }
          },
          trezorSend: {
            sendUsingTrezor: {
              trigger: async (req) => action('sendUsingTrezor')(req),
            }
          },
        },
      },
    }
  }
});

export const UserInput = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const defaultToken = mockDefaultToken(
    wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
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
        balance: new MultiToken([], defaultToken),
      })}
    />)
  );
};

export const MultiAsset = (): Node => {
  const wallet = genErgoSigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const defaultToken = mockDefaultToken(
    wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
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
        balance: new MultiToken([{
          identifier: 'f2b5c4e4883555b882e3a5919967883aade9e0494290f29e0e3069f5ce9eabe4',
          networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
          amount: new BigNumber(1000),
        }], defaultToken),
      })}
    />)
  );
};

export const MemoDialog = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const defaultToken = mockDefaultToken(
    wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
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
        noExternalStorage: true,
        balance: new MultiToken([], defaultToken),
      })}
    />)
  );
};

export const MemoExpanded = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const defaultToken = mockDefaultToken(
    wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
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
        initialShowMemoState: true,
        balance: new MultiToken([], defaultToken),
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

  const defaultToken = mockDefaultToken(
    wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
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
        balance: new MultiToken([], defaultToken),
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
            plannedTxInfoMap: [],
            maxAssetsAllowed: 10,
            calculateMinAda: () => '1',
            isDefaultIncluded: false,
            minAda: undefined,
            maxSendableAmount: { isExecuting: false, error: undefined, result: undefined },
          }
        }
      })}
    />)
  );
};

export const MultiAssetConfirmationDialog = (): Node => {
  const wallet = genErgoSigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const { tentativeTx, inputAmount, fee } = genTentativeErgoTx(
    wallet.publicDeriver
  );
  const errorCases = Object.freeze({
    None: undefined,
    InvalidWitness: new InvalidWitnessError(),
  });
  const getErrorValue = () => select(
    'errorCases',
    errorCases,
    errorCases.None
  );

  const defaultToken = mockDefaultToken(
    wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
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
        balance: new MultiToken([], defaultToken),
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
            plannedTxInfoMap: [],
            maxAssetsAllowed: 10,
            calculateMinAda: () => '1',
            isDefaultIncluded: false,
            minAda: undefined,
            maxSendableAmount: { isExecuting: false, error: undefined, result: undefined },
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

  const defaultToken = mockDefaultToken(
    wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
  );
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    <WalletSendPage
      generated={genBaseProps({
        wallet,
        balance: new MultiToken([], defaultToken),
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
            plannedTxInfoMap: [],
            maxAssetsAllowed: 10,
            calculateMinAda: () => '1',
            isDefaultIncluded: false,
            minAda: undefined,
            maxSendableAmount: { isExecuting: false, error: undefined, result: undefined },
          }
        }
      })}
    />
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

  const defaultToken = mockDefaultToken(
    wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
  );
  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    <WalletSendPage
      generated={genBaseProps({
        wallet,
        balance: new MultiToken([], defaultToken),
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
            plannedTxInfoMap: [],
            maxAssetsAllowed: 10,
            calculateMinAda: () => '1',
            isDefaultIncluded: false,
            minAda: undefined,
            maxSendableAmount: { isExecuting: false, error: undefined, result: undefined },
          }
        }
      })}
    />
  );
};
