// @flow

import { select, } from '@storybook/addon-knobs';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { action } from '@storybook/addon-actions';
import type { GeneratedData } from './Transfer';

export const mockTransferProps: {|
  currentRoute: string,
|} => {| generated: GeneratedData |} = (request) => ({
  generated: {
    stores: {
      app: {
        currentRoute: request.currentRoute,
      },
      serverConnectionStore: {
        checkAdaServerStatus: select(
          'checkAdaServerStatus',
          ServerStatusErrors,
          ServerStatusErrors.Healthy,
        ),
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
  },
});
