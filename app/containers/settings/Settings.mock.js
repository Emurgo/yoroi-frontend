// @flow

import { globalKnobs, walletLookup } from '../../../stories/helpers/StoryWrapper';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { action } from '@storybook/addon-actions';
import type { GeneratedData } from './Settings';

export const mockSettingsProps: {|
  cacheKey: symbol,
  location: string,
|} => {| generated: GeneratedData |} = (request) => ({
  generated: {
    stores: {
      profile: {
        currentLocale: globalKnobs.locale(),
        currentTheme: globalKnobs.currentTheme(),
      },
      router: {
        location: {
          pathname: request.location,
        },
      },
      wallets: {
        hasActiveWallet: walletLookup(request.cacheKey)().selected != null,
        selected: walletLookup(request.cacheKey)().selected,
      },
      serverConnectionStore: {
        checkAdaServerStatus: ServerStatusErrors.Healthy, // TODO: make this a global knob?
      }
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
            toggleSidebar: { trigger: async () => action('toggleSidebar')() },
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
          walletSettings: {
            getConceptualWalletSettingsCache:
              walletLookup(request.cacheKey)().getConceptualWalletSettingsCache,
          },
          wallets: {
            selected: walletLookup(request.cacheKey)().selected,
            publicDerivers: walletLookup(request.cacheKey)().publicDerivers,
            getPublicKeyCache: walletLookup(request.cacheKey)().getPublicKeyCache,
          },
          profile: {
            shouldHideBalance: false,
          },
          delegation: {
            getDelegationRequests: walletLookup(request.cacheKey)().getDelegation,
          },
          transactions: {
            getTxRequests: walletLookup(request.cacheKey)().getTransactions,
          },
        },
        actions: {
          profile: {
            updateHideBalance: { trigger: async () => action('updateHideBalance')() },
          },
          router: {
            goToRoute: { trigger: action('goToRoute') },
          },
        },
      }
    },
  },
});
