// @flow

import type { Node } from 'react';
import React from 'react';
import BigNumber from 'bignumber.js';

import { boolean, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import WalletReceivePage from './WalletReceivePage';
import { THEMES } from '../../themes';
import { withScreenshot } from 'storycap';
import {
  globalKnobs,
  ledgerErrorCases,
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
  genJormungandrSigningWalletWithCache,
} from '../../../stories/helpers/jormungandr/JormungandrMocks';
import {
  genByronSigningWalletWithCache,
} from '../../../stories/helpers/cardano/ByronMocks';
import { GenericApiError, } from '../../api/common/errors';
import type { PossibleCacheTypes } from '../../../stories/helpers/WalletCache';
import { wrapReceive, wrapWallet } from '../../Routes';
import { mockWalletProps } from './Wallet.mock';
import { mockReceiveProps } from './Receive.mock';
import { defaultToSelectedExplorer } from '../../domain/SelectedExplorer';
import type { AddressFilterKind, } from '../../types/AddressFilterTypes';
import URIGenerateDialog from '../../components/uri/URIGenerateDialog';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import URIDisplayDialog from '../../components/uri/URIDisplayDialog';
import UnmangleTxDialogContainer from '../transfer/UnmangleTxDialogContainer';
import VerifyAddressDialog from '../../components/wallet/receive/VerifyAddressDialog';
import { AddressFilter } from '../../types/AddressFilterTypes';
import {
  allAddressSubgroups,
  routeForStore,
  ADDRESS_BOOK,
  BYRON_EXTERNAL,
  GROUP_EXTERNAL,
  BASE_EXTERNAL,
  BASE_INTERNAL,
  BASE_MANGLED,
  REWARD_ADDRESS,
} from '../../stores/stateless/addressStores';
import type { IAddressTypeStore, IAddressTypeUiSubset } from '../../stores/stateless/addressStores';

export default {
  title: `${__filename.split('.')[0]}`,
  component: WalletReceivePage,
  decorators: [withScreenshot],
};


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

const genBaseProps: {|
  location: string,
  addressBook?: boolean,
  wallet: PossibleCacheTypes,
  dialog?: any,
  addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
  addressFilter: AddressFilterKind,
  getParam?: (number | string) => any,
  transactionBuilderStore?: *,
  verifyError?: *,
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
      app: {
        currentRoute: request.location,
      },
      uiNotifications: {
        isOpen: () => false,
        getTooltipActiveNotification: () => null,
      },
      uiDialogs: {
        isOpen: (dialog) => request.dialog === dialog,
        getParam: request.getParam || (() => (undefined: any)),
      },
      explorers: {
        selectedExplorer: defaultToSelectedExplorer(),
      },
      profile: {
        isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
        shouldHideBalance: false,
        unitOfAccount: genUnitOfAccount()
      },
      wallets: {
        selected: request.wallet.publicDeriver,
      },
      addresses: {
        addressFilter: request.addressFilter,
        addressSubgroupMap: request.addressSubgroupMap,
        createAddressRequest: {
          isExecuting: false,
        },
        error: undefined,
      },
      substores: {
        ada: {
          hwVerifyAddress: request.dialog === VerifyAddressDialog
            ? {
              selectedAddress: (() => {
                const activeStore = allAddressSubgroups.find(
                  type => request.location.startsWith(routeForStore(type.name))
                );
                if (activeStore == null) throw new Error('Should never happen');
                const storeRequest = request.addressSubgroupMap.get(activeStore.class);
                const firstAddress = storeRequest?.all[0];
                if (firstAddress?.addressing == null) {
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
        TransferSendProps: {
          generated: {
            actions: {
              wallets: {
                sendMoney: {
                  trigger: async (req) => action('sendMoney')(req),
                },
              },
            },
            stores: {
              addresses: {
                addressSubgroupMap: request.addressSubgroupMap,
              },
              coinPriceStore: {
                getCurrentPrice: (_from, _to) => 5,
              },
              explorers: {
                selectedExplorer: defaultToSelectedExplorer(),
              },
              profile: {
                isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
                unitOfAccount: genUnitOfAccount(),
              },
              wallets: {
                selected: request.wallet.publicDeriver,
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
            },
          },
        },
        stores: {
          wallets: {
            selected: request.wallet.publicDeriver,
          },
          addresses: {
            addressSubgroupMap: request.addressSubgroupMap,
          },
          transactionBuilderStore: request.transactionBuilderStore || (null: any),
        },
        actions: {
          txBuilderActions: {
            initialize: { trigger: async (req) => action('initialize')(req), },
            reset: {
              trigger: action('reset'),
            },
          },
        },
      },
    }
  };
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

export const Loading = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const location = routeForStore(BASE_EXTERNAL.name);
  const addressFilter = AddressFilter.None;
  const addressSubgroupMap = genDefaultGroupMap(false);

  return wrapWallet(
    mockWalletProps({
      location,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    wrapReceive(
      mockReceiveProps({
        selected: wallet.publicDeriver,
        addressSubgroupMap,
        addressFilter,
        location,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          addressFilter,
          addressSubgroupMap,
        })}
      />)
    )
  );
};

export const NoMatchFilter = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const location = routeForStore(BASE_EXTERNAL.name);
  const addressFilter = AddressFilter.Used;
  const addressSubgroupMap = genDefaultGroupMap(true);

  addressSubgroupMap.set(BASE_EXTERNAL.class, {
    all: [
      unusedProps('addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'),
    ],
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          addressFilter,
          addressSubgroupMap,
        })}
      />)
    )
  );
};

export const JormungandrExternalTab = (): Node => {
  const wallet = genJormungandrSigningWalletWithCache();
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
  const location = routeForStore(GROUP_EXTERNAL.name);

  const addressSubgroupMap = genDefaultGroupMap(true);
  addressSubgroupMap.set(GROUP_EXTERNAL.class, {
    all: [
      unusedProps('addr1ssuvzjs82mshgvyp4r4lmwgknvgjswnm7mpcq3wycjj7v2nk393e6qwqr79etp5e4emf5frwj7zakknsuq3ewl4yhptdlt8j8s3ngm9078ssez'),
      noUtxoProps('addr1ssruckcp4drq2cj8nul8lhmc9vgkxmz2rdepcxdec9sfh3ekpdgcuqwqr79etp5e4emf5frwj7zakknsuq3ewl4yhptdlt8j8s3ngm90lfrsm9'),
      withUtxo('addr1sjruv2a8v7g38w57ff2ffhwgk6jg93erv7txdvgnyjnl2ncnfakqvqwqr79etp5e4emf5frwj7zakknsuq3ewl4yhptdlt8j8s3ngm90dlxwna'),
    ],
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          dialog: getAddressGenerationValue() === addressCases.Yes
            ? LoadingSpinner
            : undefined,
          addressFilter,
          addressSubgroupMap,
        })}
      />)
    )
  );
};

export const ByronExternalTab = (): Node => {
  const wallet = genByronSigningWalletWithCache();
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
  const location = routeForStore(BYRON_EXTERNAL.name);

  const addressSubgroupMap = genDefaultGroupMap(true);
  addressSubgroupMap.set(BYRON_EXTERNAL.class, {
    all: [
      unusedProps('Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf'),
      noUtxoProps('Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf'),
      withUtxo('Ae2tdPwUPEZ8gpDazyi8VtcGMnMrkpKxts6ppCT45mdT6WMZEwHXs7pP8Tg'),
    ],
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          dialog: getAddressGenerationValue() === addressCases.Yes
            ? LoadingSpinner
            : undefined,
          addressFilter,
          addressSubgroupMap,
        })}
      />)
    )
  );
};

export const ExternalTab = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
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
  const location = routeForStore(BASE_EXTERNAL.name);

  const addressSubgroupMap = genDefaultGroupMap(true);
  addressSubgroupMap.set(BASE_EXTERNAL.class, {
    all: [
      unusedProps('addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'),
      noUtxoProps('addr1q99u7t32p2sf9tx87t35pmjyd82qh3877fuha28jddpcus9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxra3as'),
      withUtxo('addr1qxacxugp8h6snaap4w9j430zpsgyve50ypmn8pz0cz9v484v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqamgwnn'),
    ],
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          dialog: getAddressGenerationValue() === addressCases.Yes
            ? LoadingSpinner
            : undefined,
          addressFilter,
          addressSubgroupMap,
        })}
      />)
    )
  );
};


export const InternalTab = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const addressFilter = select('AddressFilter', AddressFilter, AddressFilter.None);
  const location = routeForStore(BASE_INTERNAL.name);

  const addressSubgroupMap = genDefaultGroupMap(true);
  addressSubgroupMap.set(BASE_INTERNAL.class, {
    all: [
      unusedProps('addr1q8xly58xcq3qrv5cc8wukme7thyv22ewaj0p5mkumuuvz9dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqamuuv5'),
      noUtxoProps('addr1q9m4edmwq9lzy3vys9guq7ca9mpcd44xyfu85kc3hjzdlkav4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqay5kcc'),
      withUtxo('addr1qyavcydjctjl5z8dss56zuqzw6gv42cu96pmh9hfmyz425dv4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqlzgdcc'),
    ],
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          addressFilter,
          addressSubgroupMap,
        })}
      />)
    )
  );
};

export const MangledTab = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const addressFilter = select('AddressFilter', AddressFilter, AddressFilter.None);
  const location = routeForStore(BASE_MANGLED.name);

  const mangledCases = {
    NoMangled: 0,
    HasMangled: 1000000,
  };
  const getMangledValue = () => select(
    'hasMangled',
    mangledCases,
    mangledCases.NoMangled
  );

  const addressSubgroupMap = genDefaultGroupMap(true);
  addressSubgroupMap.set(BASE_MANGLED.class, {
    all: [
      unusedProps('addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'),
      noUtxoProps('addr1q99u7t32p2sf9tx87t35pmjyd82qh3877fuha28jddpcus9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxra3as'),
      withUtxo('addr1qxacxugp8h6snaap4w9j430zpsgyve50ypmn8pz0cz9v484v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqamgwnn'),
    ].map(addr => ({
      ...addr,
      value: new BigNumber(getMangledValue()),
    })),
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          addressFilter,
          addressSubgroupMap,
        })}
      />)
    )
  );
};

export const RewardTab = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const addressFilter = select('AddressFilter', AddressFilter, AddressFilter.None);
  const location = routeForStore(REWARD_ADDRESS.name);

  const addressSubgroupMap = genDefaultGroupMap(true);
  addressSubgroupMap.set(REWARD_ADDRESS.class, {
    all: [
      unusedProps('addr1uxk2kljf8m8yc8n2ucn7l86l0jd3qcl9n8j24y0c0ux43tsxdwp4w')
    ],
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          addressFilter,
          addressSubgroupMap,
        })}
      />)
    )
  );
};


export const AddressBookTab = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const addressFilter = AddressFilter.None;
  const location = routeForStore(ADDRESS_BOOK.name);

  const addressSubgroupMap = genDefaultGroupMap(true);
  addressSubgroupMap.set(ADDRESS_BOOK.class, {
    all: [
      unusedProps('addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'),
      noUtxoProps('addr1q99u7t32p2sf9tx87t35pmjyd82qh3877fuha28jddpcus9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxra3as'),
      withUtxo('addr1qxacxugp8h6snaap4w9j430zpsgyve50ypmn8pz0cz9v484v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqamgwnn'),
    ],
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location,
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          addressFilter,
          addressSubgroupMap,
        })}
      />)
    )
  );
};

export const UnmangleDialogLoading = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const addressFilter = AddressFilter.None;
  const location = routeForStore(BASE_MANGLED.name);

  const addressSubgroupMap = genDefaultGroupMap(true);
  addressSubgroupMap.set(BASE_MANGLED.class, {
    all: [
      unusedProps('addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'),
      noUtxoProps('addr1q99u7t32p2sf9tx87t35pmjyd82qh3877fuha28jddpcus9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxra3as'),
      withUtxo('addr1qxacxugp8h6snaap4w9j430zpsgyve50ypmn8pz0cz9v484v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqamgwnn'),
    ].map(addr => ({
      ...addr,
      value: new BigNumber(1000000),
    })),
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          dialog: UnmangleTxDialogContainer,
          addressFilter,
          addressSubgroupMap,
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
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const addressFilter = AddressFilter.None;
  const location = routeForStore(BASE_MANGLED.name);

  const addressSubgroupMap = genDefaultGroupMap(true);
  addressSubgroupMap.set(BASE_MANGLED.class, {
    all: [
      unusedProps('addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'),
      noUtxoProps('addr1q99u7t32p2sf9tx87t35pmjyd82qh3877fuha28jddpcus9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxra3as'),
      withUtxo('addr1qxacxugp8h6snaap4w9j430zpsgyve50ypmn8pz0cz9v484v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqamgwnn'),
    ].map(addr => ({
      ...addr,
      value: new BigNumber(1000000),
    })),
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          dialog: UnmangleTxDialogContainer,
          addressFilter,
          addressSubgroupMap,
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
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  // TODO: wrong transaction type
  const { tentativeTx } = genTentativeShelleyTx(wallet.publicDeriver);

  const addressFilter = AddressFilter.None;
  const location = routeForStore(BASE_MANGLED.name);

  const addressSubgroupMap = genDefaultGroupMap(true);
  addressSubgroupMap.set(BASE_MANGLED.class, {
    all: [
      unusedProps('addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'),
      noUtxoProps('addr1q99u7t32p2sf9tx87t35pmjyd82qh3877fuha28jddpcus9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxra3as'),
      withUtxo('addr1qxacxugp8h6snaap4w9j430zpsgyve50ypmn8pz0cz9v484v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqamgwnn'),
    ].map(addr => ({
      ...addr,
      value: new BigNumber(1000000),
    })),
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          dialog: UnmangleTxDialogContainer,
          addressFilter,
          addressSubgroupMap,
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
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const addressFilter = AddressFilter.None;
  const location = routeForStore(BASE_EXTERNAL.name);

  const addressSubgroupMap = genDefaultGroupMap(true);
  const addresses = [
    unusedProps('addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'),
    noUtxoProps('addr1q99u7t32p2sf9tx87t35pmjyd82qh3877fuha28jddpcus9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxra3as'),
    withUtxo('addr1qxacxugp8h6snaap4w9j430zpsgyve50ypmn8pz0cz9v484v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqamgwnn'),
  ];
  addressSubgroupMap.set(BASE_EXTERNAL.class, {
    all: addresses,
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          dialog: URIGenerateDialog,
          addressFilter,
          getParam: (param) => {
            if (param === 'address') {
              return addresses[0].address;
            }
          },
          addressSubgroupMap,
        })}
      />)
    )
  );
};

export const UriDisplayDialog = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const addressFilter = AddressFilter.None;
  const location = routeForStore(BASE_EXTERNAL.name);

  const addresses = [
    unusedProps('addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'),
    noUtxoProps('addr1q99u7t32p2sf9tx87t35pmjyd82qh3877fuha28jddpcus9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxra3as'),
    withUtxo('addr1qxacxugp8h6snaap4w9j430zpsgyve50ypmn8pz0cz9v484v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqamgwnn'),
  ];
  const addressSubgroupMap = genDefaultGroupMap(true);
  addressSubgroupMap.set(BASE_EXTERNAL.class, {
    all: addresses,
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          dialog: URIDisplayDialog,
          addressFilter,
          getParam: (param) => {
            if (param === 'address') {
              return addresses[0].address;
            }
            if (param === 'amount') {
              return new BigNumber(5);
            }
          },
          addressSubgroupMap,
        })}
      />)
    )
  );
};

export const VerifyRegularAddress = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  const addressFilter = AddressFilter.None;
  const location = routeForStore(BASE_EXTERNAL.name);

  const addressSubgroupMap = genDefaultGroupMap(true);
  addressSubgroupMap.set(BASE_EXTERNAL.class, {
    all: [
      unusedProps('addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'),
      noUtxoProps('addr1q99u7t32p2sf9tx87t35pmjyd82qh3877fuha28jddpcus9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxra3as'),
      withUtxo('addr1qxacxugp8h6snaap4w9j430zpsgyve50ypmn8pz0cz9v484v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqamgwnn'),
    ],
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          dialog: VerifyAddressDialog,
          addressFilter,
          addressSubgroupMap,
        })}
      />)
    )
  );
};

export const VerifyLedgerAddress = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache(ConceptualWalletId => ({
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
  const location = routeForStore(BASE_EXTERNAL.name);

  const addressSubgroupMap = genDefaultGroupMap(true);
  addressSubgroupMap.set(BASE_EXTERNAL.class, {
    all: [
      unusedProps('addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y'),
      noUtxoProps('addr1q99u7t32p2sf9tx87t35pmjyd82qh3877fuha28jddpcus9v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqxra3as'),
      withUtxo('addr1qxacxugp8h6snaap4w9j430zpsgyve50ypmn8pz0cz9v484v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqamgwnn'),
    ],
    wasExecuted: true,
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
        addressSubgroupMap,
        addressFilter,
        location
      }),
      (<WalletReceivePage
        generated={genBaseProps({
          location,
          wallet,
          dialog: VerifyAddressDialog,
          addressFilter,
          verifyError: getErrorValue(),
          addressSubgroupMap,
        })}
      />)
    )
  );
};
