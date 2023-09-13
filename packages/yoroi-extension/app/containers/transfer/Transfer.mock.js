// fixme broken flow
// eslint-disable-next-line flowtype/require-valid-file-annotation
import { select, } from '@storybook/addon-knobs';
import type { Node } from 'react';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { action } from '@storybook/addon-actions';
import { withScreenshot } from 'storycap';
import type { GeneratedData as YoroiTransferPageData } from './YoroiTransferPage';
import type { GeneratedData as DaedalusTransferPageData } from './DaedalusTransferPage';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import WalletSettingsStore from '../../stores/toplevel/WalletSettingsStore';
import TransactionsStore from '../../stores/toplevel/TransactionsStore';
import DelegationStore from '../../stores/toplevel/DelegationStore';
import WalletStore from '../../stores/toplevel/WalletStore';
import type { GeneratedData } from './Transfer';
import Transfer from './Transfer';
import { ComplexityLevels } from '../../types/complexityLevelType';
import { mockFromDefaults, getDefaultEntryTokenInfo, } from '../../stores/toplevel/TokenInfoStore';
import { defaultAssets, } from '../../api/ada/lib/storage/database/prepackaged/networks';

export default {
  title: `${__filename.split('.')[0]}`,
  component: Transfer,
  decorators: [withScreenshot],
};

export const mockTransferProps: {
  selected: null | PublicDeriver<>,
  dialog?: any,
  YoroiTransferPageProps?: YoroiTransferPageData,
  DaedalusTransferPageProps?: DaedalusTransferPageData,
  publicDerivers: Array<PublicDeriver<>>,
  shelleyRewardDisclaimer?: void,
  getConceptualWalletSettingsCache:
    typeof WalletSettingsStore.prototype.getConceptualWalletSettingsCache,
  getPublicKeyCache:
    typeof WalletStore.prototype.getPublicKeyCache,
  getTransactions:
    typeof TransactionsStore.prototype.getTxRequests,
  getDelegation:
    typeof DelegationStore.prototype.getDelegationRequests,
  currentRoute: string,
  ...
} => {| generated: GeneratedData |} = (request) => ({
  // $FlowFixMe[prop-missing]: Some props are quite different for revamp components
  generated: {
    // $FlowFixMe[prop-missing]: Some props are quite different for revamp components
    stores: {
      app: {
        currentRoute: request.currentRoute,
      },
      wallets: {
        selected: request.selected,
      },
    },
    actions: {
      router: {
        goToRoute: { trigger: action('goToRoute') },
      },
    },
    SidebarContainerProps: {
      generated: {
        stores: {
          profile: {
            isSidebarExpanded: false,
          },
          wallets: {
            hasAnyWallets: request.publicDerivers.length > 0,
            selected: request.selected,
          },
          app: { currentRoute: request.currentRoute },
          delegation: {
            getDelegationRequests: () => undefined,
          },
        },
        actions: {
          profile: {
            toggleSidebar: { trigger: async (req) => action('toggleSidebar')(req) },
          },
          router: {
            goToRoute: { trigger: action('goToRoute') },
          },
        },
      },
    },
    NavBarContainerProps: {
      generated: {
        stores: {
          app: {
            currentRoute: request.currentRoute,
          },
          walletSettings: {
            getConceptualWalletSettingsCache:
              request.getConceptualWalletSettingsCache,
          },
          wallets: {
            selected: request.selected,
            publicDerivers: request.publicDerivers,
            getPublicKeyCache: request.getPublicKeyCache,
          },
          tokenInfoStore: {
            tokenInfo: mockFromDefaults(defaultAssets),
            getDefaultTokenInfo: networkId => getDefaultEntryTokenInfo(
              networkId,
              mockFromDefaults(defaultAssets)
            ),
          },
          profile: {
            shouldHideBalance: false,
            unitOfAccount: { enabled: false, currency: null },
          },
          delegation: {
            getDelegationRequests: request.getDelegation,
          },
          transactions: {
            getTxRequests: request.getTransactions,
          },
          coinPriceStore: {
            getCurrentPrice: (_from, _to) => null,
          },
        },
        actions: {
          dialogs: {
            open: { trigger: action('open') },
          },
          wallets: {
            setActiveWallet: { trigger: action('setActiveWallet') },
          },
          profile: {
            updateHideBalance: { trigger: async (req) => action('updateHideBalance')(req) },
          },
          router: {
            goToRoute: { trigger: action('goToRoute') },
          },
        },
      }
    },
    WalletTransferPageProps: {
      generated: {
        stores: {
          uiDialogs: {
            isOpen: (dialog) => dialog === request.dialog,
            getParam: () => (null: any),
          },
          tokenInfoStore: {
            tokenInfo: mockFromDefaults(defaultAssets),
          },
        },
        actions: {
          dialogs: {
            closeActiveDialog: {
              trigger: action('closeActiveDialog'),
            },
            open: { trigger: action('open'), },
          },
          yoroiTransfer: {
            startTransferFunds: { trigger: action('startTransferFunds') },
          },
        },
        ByronEraOptionDialogContainerProps: {
          generated: {
            stores: {
              profile: {
                selectedComplexityLevel: select(
                  'complexityLevel',
                  ComplexityLevels,
                  ComplexityLevels.Advanced
                ),
              },
            },
            actions: {
              daedalusTransfer: {
                startTransferFunds: { trigger: action('startTransferFunds') },
                startTransferPaperFunds: { trigger: action('startTransferPaperFunds') },
                startTransferMasterKey: { trigger: action('startTransferMasterKey') },
              },
              yoroiTransfer: {
                startTransferFunds: { trigger: action('startTransferFunds') },
              },
            },
          },
        },
        ShelleyEraOptionDialogContainerProps: {
          generated: {
            stores: {
              wallets: {
                selected: request.selected,
              },
              uiDialogs: {
                getActiveData: (key) => ({
                  disclaimer: request.shelleyRewardDisclaimer,
                  continuation: () => {},
                }[key]),
              },
            },
            actions: {
              ada: {
                delegationTransaction: {
                  setShouldDeregister: {
                    trigger: action('setShouldDeregister'),
                  },
                },
              },
              yoroiTransfer: {
                startTransferFunds: { trigger: action('startTransferFunds') },
              },
              dialogs: {
                updateDataForActiveDialog: { trigger: action('updateDataForActiveDialog') },
              },
            },
            DeregisterDialogContainerProps: {
              generated: {
                stores: {
                  profile: {
                    selectedComplexityLevel: select(
                      'complexityLevel',
                      ComplexityLevels,
                      ComplexityLevels.Advanced
                    ),
                  },
                },
                actions: {
                  ada: {
                    delegationTransaction: {
                      setShouldDeregister: {
                        trigger: action('setShouldDeregister'),
                      },
                    },
                  },
                  dialogs: {
                    closeActiveDialog: { trigger: action('closeActiveDialog') },
                  },
                },
              },
            },
          },
        },
        YoroiTransferPageProps: request.YoroiTransferPageProps
          ? { generated: request.YoroiTransferPageProps }
          : null,
        DaedalusTransferPageProps: request.DaedalusTransferPageProps
          ? { generated: request.DaedalusTransferPageProps }
          : null,
      },
    },
    BannerContainerProps: {
      generated: {
        stores: {
          serverConnectionStore: {
            checkAdaServerStatus: select(
              'checkAdaServerStatus',
              ServerStatusErrors,
              ServerStatusErrors.Healthy,
            ),
            serverTime: undefined,
          },
          tokenInfoStore: {
            tokenInfo: mockFromDefaults(defaultAssets),
          },
          wallets: {
            selected: request.selected,
          },
        },
        actions: Object.freeze({}),
      },
    },
  },
});

export function wrapTransfer(
  transferProps: InjectedOrGenerated<GeneratedData>,
): Node {
  return (<Transfer {...transferProps} />);
}
