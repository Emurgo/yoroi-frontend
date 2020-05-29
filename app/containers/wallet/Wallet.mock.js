// @flow


import { select, } from '@storybook/addon-knobs';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { action } from '@storybook/addon-actions';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import WalletSettingsStore from '../../stores/toplevel/WalletSettingsStore';
import type { WarningList } from '../../stores/toplevel/WalletSettingsStore';
import TransactionsStore from '../../stores/toplevel/TransactionsStore';
import DelegationStore from '../../stores/ada/DelegationStore';
import WalletStore from '../../stores/toplevel/WalletStore';
import type { GeneratedData } from './Wallet';

export const mockWalletProps: {
  selected: null | PublicDeriver<>,
  publicDerivers: Array<PublicDeriver<>>,
  getWalletWarnings?: PublicDeriver<> => WarningList,
  getConceptualWalletSettingsCache:
    typeof WalletSettingsStore.prototype.getConceptualWalletSettingsCache,
  getPublicKeyCache:
    typeof WalletStore.prototype.getPublicKeyCache,
  getTransactions:
    typeof TransactionsStore.prototype.getTxRequests,
  getDelegation:
    typeof DelegationStore.prototype.getDelegationRequests,
  location: string,
  ...
} => {| generated: GeneratedData |} = (request) => ({
  generated: {
    stores: {
      app: {
        currentRoute: request.location,
      },
      wallets: {
        selected: request.selected,
      },
      walletSettings: {
        getWalletWarnings: request.getWalletWarnings ?? ((publicDeriver) => ({
          publicDeriver,
          dialogs: [],
        }))
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
          topbar: {
            isActiveCategory: (_category) => false,
            categories: [],
          },
          profile: {
            isSidebarExpanded: false,
          },
        },
        actions: {
          profile: {
            toggleSidebar: { trigger: async (req) => action('toggleSidebar')(req) },
          },
          topbar: {
            activateTopbarCategory: { trigger: action('activateTopbarCategory') },
          },
        },
      },
    },
    NavBarContainerProps: {
      generated: {
        stores: {
          app: {
            currentRoute: request.location,
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
          profile: {
            shouldHideBalance: false,
          },
          delegation: {
            getDelegationRequests: request.getDelegation,
          },
          transactions: {
            getTxRequests: request.getTransactions,
          },
        },
        actions: {
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
    BannerContainerProps: {
      generated: {
        stores: {
          serverConnectionStore: {
            checkAdaServerStatus: select(
              'checkAdaServerStatus',
              ServerStatusErrors,
              ServerStatusErrors.Healthy,
            ),
          },
        },
        actions: {},
      },
    },
  },
});
