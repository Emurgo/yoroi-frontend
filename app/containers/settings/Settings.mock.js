// @flow

import { globalKnobs } from '../../../stories/helpers/StoryWrapper';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { action } from '@storybook/addon-actions';
import type { GeneratedData } from './Settings';

export const mockSettingsProps: {| generated: GeneratedData |} = {
  generated: {
    stores: {
      profile: {
        currentLocale: globalKnobs.locale(),
        currentTheme: globalKnobs.currentTheme(),
      },
      router: {
        location: {
          pathname: '',
        },
      },
      wallets: {
        hasActiveWallet: false,
        selected: null,
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
          wallets: {
            selected: null,
            publicDerivers: [],
          },
          profile: {
            shouldHideBalance: false,
          },
          delegation: {
            getRequests: (_publicDeriver) => undefined,
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
};
