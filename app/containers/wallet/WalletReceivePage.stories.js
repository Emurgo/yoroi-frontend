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
import type { CacheValue } from '../../../stories/helpers/StoryWrapper';
import { wrapReceive, wrapWallet } from '../../Routes';
import { mockWalletProps } from './Wallet.mock';
import { mockReceiveProps } from './Receive.mock';
import { getDefaultExplorer } from '../../domain/Explorer';
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';
import type { AddressTypeName, AddressGroupName, StandardAddress, AddressFilterKind, AddressStoreKind } from '../../types/AddressFilterTypes';
import URIGenerateDialog from '../../components/uri/URIGenerateDialog';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import URIDisplayDialog from '../../components/uri/URIDisplayDialog';
import UnmangleTxDialogContainer from '../transfer/UnmangleTxDialogContainer';
import VerifyAddressDialog from '../../components/wallet/receive/VerifyAddressDialog';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { addressTypes, addressGroups, AddressGroupTypes, AddressFilter, AddressStoreTypes } from '../../types/AddressFilterTypes';
import { userFilter } from '../../stores/toplevel/AddressesStore';

export default {
  title: `${__filename.split('.')[0]}`,
  component: WalletReceivePage,
  decorators: [withScreenshot],
};

const getExternalRoute = (id) => buildRoute(
  ROUTES.WALLETS.RECEIVE.ADDRESS_LIST,
  {
    id,
    group: AddressGroupTypes.byron,
    name: AddressStoreTypes.external,
  }
);
const getInternalRoute = (id) => buildRoute(
  ROUTES.WALLETS.RECEIVE.ADDRESS_LIST,
  {
    id,
    group: AddressGroupTypes.byron,
    name: AddressStoreTypes.internal,
  }
);
const getMangledRoute = (id) => buildRoute(
  ROUTES.WALLETS.RECEIVE.ADDRESS_LIST,
  {
    id,
    group: AddressGroupTypes.byron,
    name: AddressStoreTypes.mangled,
  }
);
const getAddressBookRoute = (id) => buildRoute(
  ROUTES.WALLETS.RECEIVE.ADDRESS_LIST,
  {
    id,
    group: AddressGroupTypes.addressBook,
    name: AddressStoreTypes.all,
  }
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

const genBaseProps: {|
  addressBook?: boolean,
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
        isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
        selectedExplorer: getDefaultExplorer(),
        shouldHideBalance: false,
        unitOfAccount: genUnitOfAccount()
      },
      wallets: {
        selected: request.wallet.publicDeriver,
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
              initialize: { trigger: async (req) => action('initialize')(req), },
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
  publicDeriver: PublicDeriver<>,
  location: string,
  addresses: Array<StandardAddress>,
|} => (PublicDeriver<> => Array<{|
  +isActiveStore: boolean,
  +isHidden: boolean,
  +setAsActiveStore: void => void,
  +name: AddressTypeName,
  +groupName: AddressGroupName,
  +all: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  +wasExecuted: boolean,
|}>) = (request) => {
  const tabs = [];

  const push: (AddressGroupName, AddressTypeName) => void = (groupName, tabName) => {
    const routeForTab = buildRoute(
      ROUTES.WALLETS.RECEIVE.ADDRESS_LIST,
      {
        id: request.publicDeriver.getPublicDeriverId(),
        group: groupName.stable,
        name: tabName.stable,
      }
    );
    tabs.push({
      isActiveStore: request.location === routeForTab,
      isHidden: false,
      setAsActiveStore: action(`set ${tabName.stable}`),
      name: tabName,
      groupName,
      all: request.addresses,
      wasExecuted: true,
    });
  };
  push(
    {
      stable: AddressGroupTypes.byron,
      display: addressGroups.byron,
    },
    {
      stable: AddressStoreTypes.external,
      display: addressTypes.external,
    }
  );
  push(
    {
      stable: AddressGroupTypes.byron,
      display: addressGroups.byron,
    },
    {
      stable: AddressStoreTypes.internal,
      display: addressTypes.internal,
    }
  );
  if (request.location.includes(AddressStoreTypes.mangled)) {
    push(
      {
        stable: AddressGroupTypes.byron,
        display: addressGroups.byron,
      },
      {
        stable: AddressStoreTypes.mangled,
        display: addressTypes.mangled,
      }
    );
  }

  return (_publicDeriver) => tabs;
};
const wrapForReceive: ReturnType<ReturnType<typeof genGetStoresForWallet>> => Array<{|
  +isActiveStore: boolean,
  +isHidden:boolean,
  +setAsActiveStore: void => void,
  +name: AddressTypeName,
  +groupName: AddressGroupName,
|}> = (result) => {
  return result.map(addressStore => Object.freeze({
    isActiveStore: addressStore.isActiveStore,
    isHidden: addressStore.isHidden,
    setAsActiveStore: addressStore.setAsActiveStore,
    name: addressStore.name,
    groupName: addressStore.groupName,
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

  const addressFilter = select('AddressFilter', AddressFilter, AddressFilter.None);
  const location = getExternalRoute(wallet.publicDeriver.getPublicDeriverId());
  const getStoresForWallet = genGetStoresForWallet({
    location,
    publicDeriver: wallet.publicDeriver,
    addresses: genAddresses(),
  });

  return wrapWallet(
    mockWalletProps({
      location,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
        addressFilter,
        location,
      }),
      (<WalletReceivePage
        addressBook={false}
        generated={genBaseProps({
          wallet,
          dialog: getAddressGenerationValue() === addressCases.Yes
            ? LoadingSpinner
            : undefined,
          addressFilter,
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
        })}
      />)
    )
  );
};


export const InternalTab = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const addressFilter = select('AddressFilter', AddressFilter, AddressFilter.None);
  const location = getInternalRoute(wallet.publicDeriver.getPublicDeriverId());
  const getStoresForWallet = genGetStoresForWallet({
    location,
    publicDeriver: wallet.publicDeriver,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
        addressFilter,
        location
      }),
      (<WalletReceivePage
        addressBook={false}
        generated={genBaseProps({
          wallet,
          addressFilter,
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
        })}
      />)
    )
  );
};

export const MangledTab = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const addressFilter = select('AddressFilter', AddressFilter, AddressFilter.None);
  const location = getMangledRoute(wallet.publicDeriver.getPublicDeriverId());
  const getStoresForWallet = genGetStoresForWallet({
    location,
    publicDeriver: wallet.publicDeriver,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
        addressFilter,
        location
      }),
      (<WalletReceivePage
        addressBook={false}
        generated={genBaseProps({
          wallet,
          addressFilter,
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
        })}
      />)
    )
  );
};
export const AddressBookTab = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const addressFilter = select('AddressFilter', AddressFilter, AddressFilter.None);
  const location = getAddressBookRoute(wallet.publicDeriver.getPublicDeriverId());
  const getStoresForWallet = genGetStoresForWallet({
    location,
    publicDeriver: wallet.publicDeriver,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
        addressFilter,
        location,
      }),
      (<WalletReceivePage
        addressBook
        generated={genBaseProps({
          wallet,
          addressFilter,
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
        })}
      />)
    )
  );
};

export const UnmangleDialogLoading = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const addressFilter = AddressFilter.None;
  const location = getMangledRoute(wallet.publicDeriver.getPublicDeriverId());
  const getStoresForWallet = genGetStoresForWallet({
    location,
    publicDeriver: wallet.publicDeriver,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
        addressFilter,
        location
      }),
      (<WalletReceivePage
        addressBook={false}
        generated={genBaseProps({
          wallet,
          dialog: UnmangleTxDialogContainer,
          addressFilter,
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
          transactionBuilderStore: {
            tentativeTx: null,
            setupSelfTx: {
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

  const addressFilter = AddressFilter.None;
  const location = getMangledRoute(wallet.publicDeriver.getPublicDeriverId());
  const getStoresForWallet = genGetStoresForWallet({
    location,
    publicDeriver: wallet.publicDeriver,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
        addressFilter,
        location
      }),
      (<WalletReceivePage
        addressBook={false}
        generated={genBaseProps({
          wallet,
          dialog: UnmangleTxDialogContainer,
          addressFilter,
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
          transactionBuilderStore: {
            tentativeTx: null,
            setupSelfTx: {
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

  const addressFilter = AddressFilter.None;
  const location = getMangledRoute(wallet.publicDeriver.getPublicDeriverId());
  const getStoresForWallet = genGetStoresForWallet({
    location,
    publicDeriver: wallet.publicDeriver,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
        addressFilter,
        location
      }),
      (<WalletReceivePage
        addressBook={false}
        generated={genBaseProps({
          wallet,
          dialog: UnmangleTxDialogContainer,
          addressFilter,
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
          transactionBuilderStore: {
            tentativeTx,
            setupSelfTx: {
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

  const addressFilter = AddressFilter.None;
  const location = getExternalRoute(wallet.publicDeriver.getPublicDeriverId());
  const getStoresForWallet = genGetStoresForWallet({
    location,
    publicDeriver: wallet.publicDeriver,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
        addressFilter,
        location
      }),
      (<WalletReceivePage
        addressBook={false}
        generated={genBaseProps({
          wallet,
          dialog: URIGenerateDialog,
          addressFilter,
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

  const addressFilter = AddressFilter.None;
  const location = getExternalRoute(wallet.publicDeriver.getPublicDeriverId());
  const getStoresForWallet = genGetStoresForWallet({
    location,
    publicDeriver: wallet.publicDeriver,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
        addressFilter,
        location
      }),
      (<WalletReceivePage
        addressBook={false}
        generated={genBaseProps({
          wallet,
          dialog: URIDisplayDialog,
          addressFilter,
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

  const addressFilter = AddressFilter.None;
  const location = getExternalRoute(wallet.publicDeriver.getPublicDeriverId());
  const getStoresForWallet = genGetStoresForWallet({
    location,
    publicDeriver: wallet.publicDeriver,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
        addressFilter,
        location
      }),
      (<WalletReceivePage
        addressBook={false}
        generated={genBaseProps({
          wallet,
          dialog: VerifyAddressDialog,
          addressFilter,
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

  const addressFilter = AddressFilter.None;
  const location = getExternalRoute(wallet.publicDeriver.getPublicDeriverId());
  const getStoresForWallet = genGetStoresForWallet({
    location,
    publicDeriver: wallet.publicDeriver,
    addresses: genAddresses(),
  });
  return wrapWallet(
    mockWalletProps({
      location,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        getStoresForWallet: (publicDeriver) => wrapForReceive(getStoresForWallet(publicDeriver)),
        addressFilter,
        location
      }),
      (<WalletReceivePage
        addressBook={false}
        generated={genBaseProps({
          wallet,
          dialog: VerifyAddressDialog,
          addressFilter,
          verifyError: getErrorValue(),
          getStoresForWallet: (pubDeriver) => wrapForReceivePage(getStoresForWallet(pubDeriver)),
        })}
      />)
    )
  );
};
