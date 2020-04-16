// @flow

import React from 'react';
import BigNumber from 'bignumber.js';

import { boolean, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import WalletReceivePage from './WalletReceivePage';
import { THEMES } from '../../themes';
import environment from '../../environment';
import { withScreenshot } from 'storycap';
import {
  globalKnobs,
  walletLookup,
  genSigningWalletWithCache,
  ledgerErrorCases,
  mockLedgerMeta,
  genTentativeTx,
  genUnitOfAccount,
} from '../../../stories/helpers/StoryWrapper';
import { GenericApiError, } from '../../api/common';
import LocalizedRequest from '../../stores/lib/LocalizedRequest';
import type { CacheValue } from '../../../stories/helpers/StoryWrapper';
import { wrapReceive, wrapWallet } from '../../Routes';
import { mockWalletProps } from './Wallet.mock';
import { mockReceiveProps } from './Receive.mock';
import { getDefaultExplorer } from '../../domain/Explorer';
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';
import { isValidAmountInLovelaces } from '../../utils/validations';
import type { StandardAddress } from '../../stores/base/AddressesStore';
import type { SetupSelfTxFunc } from '../../stores/ada/AdaTransactionBuilderStore';
import URIGenerateDialog from '../../components/uri/URIGenerateDialog';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import URIDisplayDialog from '../../components/uri/URIDisplayDialog';
import UnmangleTxDialogContainer from '../transfer/UnmangleTxDialogContainer';
import VerifyAddressDialog from '../../components/wallet/receive/VerifyAddressDialog';

export default {
  title: `${__filename.split('.')[0]}`,
  component: WalletReceivePage,
  decorators: [withScreenshot],
};

const getExternalRoute = (id) => buildRoute(
  ROUTES.WALLETS.RECEIVE.EXTERNAL,
  { id, }
);
const getInternalRoute = (id) => buildRoute(
  ROUTES.WALLETS.RECEIVE.INTERNAL,
  { id, }
);

const genAddresses = () => {
  const unusedProps = (address) => ({
    address,
    value: undefined,
    addressing: {
      path: [2147483692, 2147485463, 2147483648, 13, 0, 0],
      startLevel: 0,
    },
    isUsed: false,
  });
  const noUtxoProps = (address) => ({
    address,
    value: undefined,
    addressing: {
      path: [],
      startLevel: 0,
    },
    isUsed: true,
  });
  const withUtxo = (address) => ({
    address,
    value: new BigNumber(100),
    addressing: {
      path: [],
      startLevel: 0,
    },
    isUsed: true,
  });
  if (environment.isShelley()) {
    return [
      unusedProps('addr1ssuvzjs82mshgvyp4r4lmwgknvgjswnm7mpcq3wycjj7v2nk393e6qwqr79etp5e4emf5frwj7zakknsuq3ewl4yhptdlt8j8s3ngm9078ssez'),
      noUtxoProps('addr1ssruckcp4drq2cj8nul8lhmc9vgkxmz2rdepcxdec9sfh3ekpdgcuqwqr79etp5e4emf5frwj7zakknsuq3ewl4yhptdlt8j8s3ngm90lfrsm9'),
      withUtxo('addr1sjruv2a8v7g38w57ff2ffhwgk6jg93erv7txdvgnyjnl2ncnfakqvqwqr79etp5e4emf5frwj7zakknsuq3ewl4yhptdlt8j8s3ngm90dlxwna'),
    ];
  }
  return [
    unusedProps('Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf'),
    noUtxoProps('Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf'),
    withUtxo('Ae2tdPwUPEZ8gpDazyi8VtcGMnMrkpKxts6ppCT45mdT6WMZEwHXs7pP8Tg'),
  ];
};

const setupSelfTxRequest: LocalizedRequest<SetupSelfTxFunc>
  = new LocalizedRequest(async (_foo) => undefined);

const genBaseProps: {|
  wallet: CacheValue,
  dialog?: any,
  tab: 'mangled' | 'external' | 'internal',
  getParam?: (number | string) => any,
  transactionBuilderStore?: *,
  addresses: Array<StandardAddress>,
  verifyError?: *,
|} => * = (request) => {
  const addressDisplay = {
    all: request.addresses,
    hasAny: request.addresses.length > 0,
    last: request.addresses.length > 0
      ? request.addresses[request.addresses.length - 1]
      : undefined,
    totalAvailable: request.addresses.length,
    wasExecuted: true,
  };
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
      uiNotifications: {
        isOpen: () => false,
        getTooltipActiveNotification: () => null,
      },
      uiDialogs: {
        isOpen: (dialog) => request.dialog === dialog,
        getParam: request.getParam || (() => (undefined: any)),
      },
      profile: {
        isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
        selectedExplorer: getDefaultExplorer(),
      },
      wallets: {
        selected: request.wallet.publicDeriver,
      },
      substores: {
        ada: {
          addresses: {
            getUnmangleAmounts: () => ({
              canUnmangle: request.tab === 'mangled' && request.dialog == null
                ? getMangledValue()
                : [],
              cannotUnmangle: [],
            }),
            isActiveTab: (tab) => tab === request.tab,
            createAddressRequest: {
              isExecuting: false,
            },
            error: undefined,
            externalForDisplay: () => addressDisplay,
            internalForDisplay: () => addressDisplay,
            mangledAddressesForDisplay: () => addressDisplay,
          },
          hwVerifyAddress: request.dialog === VerifyAddressDialog
            ? {
              selectedAddress: {
                address: addressDisplay.all[0].address,
                path: addressDisplay.all[0].addressing.path
              },
              isActionProcessing: request.verifyError == null ? false : boolean('isActionProcessing', false),
              error: request.verifyError,
            }
            : {
              selectedAddress: undefined,
              isActionProcessing: false,
              error: undefined,
            },
          transactions: {
            validateAmount: amount => Promise.resolve(isValidAmountInLovelaces(amount)),
          },
        },
      },
    },
    actions: {
      dialogs: {
        open: { trigger: action('open') },
        closeActiveDialog: { trigger: action('closeActiveDialog'), },
      },
      notifications: {
        closeActiveNotification: {
          trigger: action('closeActiveNotification'),
        },
        open: {
          trigger: action('open'),
        },
      },
      ada: {
        hwVerifyAddress: {
          selectAddress: { trigger: async (req) => action('selectAddress')(req), },
          verifyAddress: { trigger: async (req) => action('verifyAddress')(req), },
          closeAddressDetailDialog: {
            trigger: action('closeAddressDetailDialog'),
          },
        },
        addresses: {
          resetErrors: {
            trigger: action('resetErrors'),
          },
          createAddress: {
            trigger: async (req) => action('createAddress')(req),
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
            unitOfAccount: genUnitOfAccount(),
          },
          wallets: {
            selected: request.wallet.publicDeriver,
          },
          coinPriceStore: {
            getCurrentPrice: (_from, _to) => 5,
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
                  all: request.tab === 'mangled'
                    ? addressDisplay.all
                    : [],
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

export const ExternalTab = () => {
  const selectedTab = 'external';
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  const addressCases = {
    No: 0,
    Yes: 1,
  };
  const getAddressGenerationValue = () => select(
    'generatingAddress',
    addressCases,
    addressCases.No,
  );
  return wrapWallet(
    mockWalletProps({
      location: getExternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        activeTab: selectedTab,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: getAddressGenerationValue() === addressCases.Yes
            ? LoadingSpinner
            : undefined,
          tab: selectedTab,
          addresses: genAddresses(),
        })}
      />)
    )
  );
};


export const InternalTab = () => {
  const selectedTab = 'internal';
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getInternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        activeTab: selectedTab,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          tab: selectedTab,
          addresses: genAddresses(),
        })}
      />)
    )
  );
};

export const MangledTab = () => {
  const selectedTab = 'mangled';
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getInternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        activeTab: selectedTab,
        hasMangled: true,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          tab: selectedTab,
          addresses: genAddresses(),
        })}
      />)
    )
  );
};

export const UnmangleDialogLoading = () => {
  const selectedTab = 'mangled';
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getInternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        activeTab: selectedTab,
        hasMangled: true,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: UnmangleTxDialogContainer,
          tab: selectedTab,
          addresses: genAddresses(),
          transactionBuilderStore: {
            tentativeTx: null,
            setupSelfTx: {
              execute: setupSelfTxRequest.execute.bind(setupSelfTxRequest),
              error: undefined,
            },
          }
        })}
      />)
    )
  );
};

export const UnmangleDialogError = () => {
  const selectedTab = 'mangled';
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getInternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        activeTab: selectedTab,
        hasMangled: true,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: UnmangleTxDialogContainer,
          tab: selectedTab,
          addresses: genAddresses(),
          transactionBuilderStore: {
            tentativeTx: null,
            setupSelfTx: {
              execute: setupSelfTxRequest.execute.bind(setupSelfTxRequest),
              error: new GenericApiError(),
            },
          }
        })}
      />)
    )
  );
};

export const UnmangleDialogConfirm = () => {
  const selectedTab = 'mangled';
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  const { tentativeTx } = genTentativeTx();
  return wrapWallet(
    mockWalletProps({
      location: getInternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        activeTab: selectedTab,
        hasMangled: true,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: UnmangleTxDialogContainer,
          tab: selectedTab,
          addresses: genAddresses(),
          transactionBuilderStore: {
            tentativeTx,
            setupSelfTx: {
              execute: setupSelfTxRequest.execute.bind(setupSelfTxRequest),
              error: undefined,
            },
          }
        })}
      />)
    )
  );
};

export const UriGenerateDialog = () => {
  const selectedTab = 'external';
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getExternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        activeTab: selectedTab,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: URIGenerateDialog,
          getParam: (param) => {
            if (param === 'address') {
              return genAddresses()[0].address;
            }
          },
          tab: selectedTab,
          addresses: genAddresses(),
        })}
      />)
    )
  );
};

export const UriDisplayDialog = () => {
  const selectedTab = 'external';
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getExternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        activeTab: selectedTab,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: URIDisplayDialog,
          getParam: (param) => {
            if (param === 'address') {
              return genAddresses()[0].address;
            }
            if (param === 'amount') {
              return new BigNumber(5);
            }
          },
          tab: selectedTab,
          addresses: genAddresses(),
        })}
      />)
    )
  );
};

export const VerifyRegularAddress = () => {
  const selectedTab = 'external';
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getExternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        activeTab: selectedTab,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: VerifyAddressDialog,
          tab: selectedTab,
          addresses: genAddresses(),
        })}
      />)
    )
  );
};

export const VerifyLedgerAddress = () => {
  const selectedTab = 'external';
  const wallet = genSigningWalletWithCache(ConceptualWalletId => ({
    ConceptualWalletId,
    ...mockLedgerMeta
  }));
  const getErrorValue = () => select(
    'errorCases',
    ledgerErrorCases,
    ledgerErrorCases.None
  );
  const lookup = walletLookup([wallet]);
  return wrapWallet(
    mockWalletProps({
      location: getExternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        activeTab: selectedTab,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: VerifyAddressDialog,
          tab: selectedTab,
          verifyError: getErrorValue(),
          addresses: genAddresses(),
        })}
      />)
    )
  );
};
