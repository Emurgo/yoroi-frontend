// @flow

import type { Node } from 'react';
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
import { GenericApiError, } from '../../api/common/errors';
import LocalizedRequest from '../../stores/lib/LocalizedRequest';
import type { CacheValue } from '../../../stories/helpers/StoryWrapper';
import { wrapReceive, wrapWallet } from '../../Routes';
import { mockWalletProps } from './Wallet.mock';
import { mockReceiveProps } from './Receive.mock';
import { getDefaultExplorer } from '../../domain/Explorer';
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';
import { isValidAmountInLovelaces } from '../../utils/validations';
import type { AddressTypeName } from '../../stores/toplevel/AddressesStore';
import type { StandardAddress, AddressFilterKind, AddressStoreKind } from '../../types/AddressFilterTypes';
import type { SetupSelfTxFunc } from '../../stores/ada/AdaTransactionBuilderStore';
import URIGenerateDialog from '../../components/uri/URIGenerateDialog';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import URIDisplayDialog from '../../components/uri/URIDisplayDialog';
import UnmangleTxDialogContainer from '../transfer/UnmangleTxDialogContainer';
import VerifyAddressDialog from '../../components/wallet/receive/VerifyAddressDialog';
import { addressTypes } from '../../i18n/global-messages';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { getApiMeta } from '../../stores/toplevel/ProfileStore';
import { AddressFilter, AddressStoreTypes } from '../../types/AddressFilterTypes';
import { userFilter } from '../../stores/toplevel/AddressesStore';


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
  getStoresForWallet: PublicDeriver<> => Array<{|
    +isActiveStore: boolean,
    +stableName: AddressStoreKind,
    +all: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
    +wasExecuted: boolean,
  |}>,
  addressFilter: AddressFilterKind,
  getParam?: (number | string) => any,
  transactionBuilderStore?: *,
  verifyError?: *,
|} => * = (request) => {
  const mangledCases = {
    NoMangled: [],
    HasMangled: [new BigNumber(0)],
  };
  const getMangledValue = () => select(
    'hasMangled',
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

  const addressesStore = request.getStoresForWallet(request.wallet.publicDeriver);
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
        selectedAPI: getApiMeta('ada'),
        isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
        selectedExplorer: getDefaultExplorer(),
      },
      wallets: {
        selected: request.wallet.publicDeriver,
      },
      transactions: {
        validateAmount: validateAmountRequest => {
          return Promise.resolve(isValidAmountInLovelaces(validateAmountRequest.amount));
        },
      },
      addresses: {
        addressFilter: request.addressFilter,
        getStoresForWallet: args => {
          const addressStores = request.getStoresForWallet(args);
          return addressStores.map(content => ({
            ...content,
            filtered: userFilter({
              addressFilter: request.addressFilter,
              addresses: content.all,
            })
          }));
        },
        createAddressRequest: {
          isExecuting: false,
        },
        error: undefined,
      },
      substores: {
        ada: {
          addresses: {
            getUnmangleAmounts: () => ({
              canUnmangle: addressesStore.some(
                addressStore => addressStore.stableName === AddressStoreTypes.mangled &&
                addressStore.isActiveStore
              ) && request.dialog == null
                ? getMangledValue()
                : [],
              cannotUnmangle: [],
            }),
          },
          hwVerifyAddress: request.dialog === VerifyAddressDialog
            ? {
              selectedAddress: (() => {
                const activeStore = addressesStore.filter(
                  addressStore => addressStore.isActiveStore
                )[0];
                const firstAddress = activeStore.all[0];
                if (firstAddress.addressing == null) {
                  throw new Error('Expected addressing');
                }
                return Object.freeze({
                  address: firstAddress.address,
                  path: firstAddress.addressing.path,
                });
              })(),
              isActionProcessing: request.verifyError == null ? false : boolean('isActionProcessing', false),
              error: request.verifyError,
            }
            : {
              selectedAddress: undefined,
              isActionProcessing: false,
              error: undefined,
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
      addresses: {
        setFilter: { trigger: action('setFilter'), },
        resetFilter: { trigger: action('resetFilter'), },
        resetErrors: {
          trigger: action('resetErrors'),
        },
        createAddress: {
          trigger: async (req) => action('createAddress')(req),
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
                  all: addressesStore.some(
                    addressStore => addressStore.stableName === AddressStoreTypes.mangled &&
                    addressStore.isActiveStore
                  )
                    ? addressesStore.filter(
                      addressStore => addressStore.stableName === AddressStoreTypes.mangled
                    )[0].all
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

const genGetStoresForWallet: {|
  selectedTab: AddressStoreKind,
  addresses: Array<StandardAddress>,
|} => (PublicDeriver<> => Array<{|
  +isActiveStore: boolean,
  +isHidden: boolean,
  +setAsActiveStore: void => void,
  +name: AddressTypeName,
  +all: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  +wasExecuted: boolean,
|}>) = (request) => {
  const tabs = [];

  const push: (AddressTypeName) => void = (tabName) => {
    tabs.push({
      isActiveStore: request.selectedTab === tabName.stable,
      isHidden: false,
      setAsActiveStore: action(`set ${tabName.stable}`),
      name: tabName,
      all: request.addresses,
      wasExecuted: true,
    });
  };
  push({
    stable: AddressStoreTypes.external,
    display: addressTypes.externalTab,
  });
  push({
    stable: AddressStoreTypes.internal,
    display: addressTypes.internalLabel,
  });
  if (request.selectedTab === AddressStoreTypes.mangled) {
    push({
      stable: AddressStoreTypes.mangled,
      display: addressTypes.mangledLabel,
    });
  }

  return (_publicDeriver) => tabs;
};
const wrapForReceive: ReturnType<ReturnType<typeof genGetStoresForWallet>> => Array<{|
  +isActiveStore: boolean,
  +isHidden:boolean,
  +setAsActiveStore: void => void,
  +name: AddressTypeName,
|}> = (result) => {
  return result.map(addressStore => Object.freeze({
    isActiveStore: addressStore.isActiveStore,
    isHidden: addressStore.isHidden,
    setAsActiveStore: addressStore.setAsActiveStore,
    name: addressStore.name,
  }));
};
const wrapForReceivePage: ReturnType<ReturnType<typeof genGetStoresForWallet>> => Array<{|
  +isActiveStore: boolean,
  +stableName: AddressStoreKind,
  +all: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  +wasExecuted: boolean,
|}> = (result) => {
  return result.map(addressStore => ({
    isActiveStore: addressStore.isActiveStore,
    stableName: addressStore.name.stable,
    all: addressStore.all,
    wasExecuted: addressStore.wasExecuted,
  }));
};

export const ExternalTab = (): Node => {
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

  const getStoresForWallet = genGetStoresForWallet({
    selectedTab: AddressStoreTypes.external,
    addresses: genAddresses(),
  });

  return wrapWallet(
    mockWalletProps({
      location: getExternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: getAddressGenerationValue() === addressCases.Yes
            ? LoadingSpinner
            : undefined,
          addressFilter: AddressFilter.None,
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
        })}
      />)
    )
  );
};


export const InternalTab = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const getStoresForWallet = genGetStoresForWallet({
    selectedTab: AddressStoreTypes.internal,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location: getInternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          addressFilter: AddressFilter.None,
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
        })}
      />)
    )
  );
};

export const MangledTab = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const getStoresForWallet = genGetStoresForWallet({
    selectedTab: AddressStoreTypes.mangled,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location: getInternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          addressFilter: AddressFilter.None,
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
        })}
      />)
    )
  );
};

export const UnmangleDialogLoading = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const getStoresForWallet = genGetStoresForWallet({
    selectedTab: AddressStoreTypes.mangled,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location: getInternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: UnmangleTxDialogContainer,
          addressFilter: AddressFilter.None,
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
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

export const UnmangleDialogError = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const getStoresForWallet = genGetStoresForWallet({
    selectedTab: AddressStoreTypes.mangled,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location: getInternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: UnmangleTxDialogContainer,
          addressFilter: AddressFilter.None,
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
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

export const UnmangleDialogConfirm = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  const { tentativeTx } = genTentativeTx();

  const getStoresForWallet = genGetStoresForWallet({ selectedTab: 'mangled', addresses: genAddresses(), });
  return wrapWallet(
    mockWalletProps({
      location: getInternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: UnmangleTxDialogContainer,
          addressFilter: AddressFilter.None,
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
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

export const UriGenerateDialog = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const getStoresForWallet = genGetStoresForWallet({
    selectedTab: AddressStoreTypes.external,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location: getExternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: URIGenerateDialog,
          addressFilter: AddressFilter.None,
          getParam: (param) => {
            if (param === 'address') {
              return genAddresses()[0].address;
            }
          },
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
        })}
      />)
    )
  );
};

export const UriDisplayDialog = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const getStoresForWallet = genGetStoresForWallet({
    selectedTab: AddressStoreTypes.external,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location: getExternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: URIDisplayDialog,
          addressFilter: AddressFilter.None,
          getParam: (param) => {
            if (param === 'address') {
              return genAddresses()[0].address;
            }
            if (param === 'amount') {
              return new BigNumber(5);
            }
          },
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
        })}
      />)
    )
  );
};

export const VerifyRegularAddress = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const getStoresForWallet = genGetStoresForWallet({
    selectedTab: AddressStoreTypes.external,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location: getExternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: VerifyAddressDialog,
          addressFilter: AddressFilter.None,
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
        })}
      />)
    )
  );
};

export const VerifyLedgerAddress = (): Node => {
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

  const getStoresForWallet = genGetStoresForWallet({
    selectedTab: AddressStoreTypes.external,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location: getExternalRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          wallet,
          dialog: VerifyAddressDialog,
          addressFilter: AddressFilter.None,
          verifyError: getErrorValue(),
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
        })}
      />)
    )
  );
};
