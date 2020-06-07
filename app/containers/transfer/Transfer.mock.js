// @flow

import { select, } from '@storybook/addon-knobs';
import type { Node } from 'react';
import React from 'react';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { action } from '@storybook/addon-actions';
import { withScreenshot } from 'storycap';
import type { GeneratedData as YoroiTransferPageData } from './YoroiTransferPage';
import type { GeneratedData as DaedalusTransferPageData } from './DaedalusTransferPage';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import WalletSettingsStore from '../../stores/toplevel/WalletSettingsStore';
import TransactionsStore from '../../stores/toplevel/TransactionsStore';
import DelegationStore from '../../stores/ada/DelegationStore';
import WalletStore from '../../stores/toplevel/WalletStore';
import type { GeneratedData } from './Transfer';
import Transfer from './Transfer';

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
  generated: {
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
    WalletTransferPageProps: {
      generated: {
        stores: {
          uiDialogs: {
            isOpen: (dialog) => dialog === request.dialog,
            getParam: () => (null: any),
          },
        },
        actions: {
          dialogs: {
            closeActiveDialog: {
              trigger: action('closeActiveDialog'),
            },
            open: { trigger: action('open'), },
          },
          ada: {
            yoroiTransfer: {
              startTransferFunds: { trigger: action('startTransferFunds') },
            },
          },
        },
        ByronEraOptionDialogContainerProps: {
          generated: {
            actions: {
              ada: {
                daedalusTransfer: {
                  startTransferFunds: { trigger: action('startTransferFunds') },
                  startTransferPaperFunds: { trigger: action('startTransferPaperFunds') },
                  startTransferMasterKey: { trigger: action('startTransferMasterKey') },
                },
                yoroiTransfer: {
                  startTransferLegacyHardwareFunds: {
                    trigger: action('startTransferLegacyHardwareFunds')
                  },
                  startTransferPaperFunds: { trigger: action('startTransferPaperFunds') },
                  startTransferFunds: { trigger: action('startTransferFunds') },
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
