// @flow

import { select, } from '@storybook/addon-knobs';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { action } from '@storybook/addon-actions';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import WalletSettingsStore from '../../stores/toplevel/WalletSettingsStore';
import TransactionsStore from '../../stores/toplevel/TransactionsStore';
import DelegationStore from '../../stores/toplevel/DelegationStore';
import WalletStore from '../../stores/toplevel/WalletStore';
import type { GeneratedData } from './Settings';
import { mockFromDefaults, getDefaultEntryTokenInfo, } from '../../stores/toplevel/TokenInfoStore';
import { defaultAssets, } from '../../api/ada/lib/storage/database/prepackaged/networks';

export const mockSettingsProps: {
  selected: null | PublicDeriver<>,
  publicDerivers: Array<PublicDeriver<>>,
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
  // $FlowFixMe[prop-missing]: Some props are quite different for revamp components
  generated: {
    stores: {
      router: {
        location: {
          pathname: request.location,
        },
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
          app: { currentRoute: request.location },
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
            selected: null,
          },
        },
        actions: Object.freeze({}),
      },
    },
  },
});
