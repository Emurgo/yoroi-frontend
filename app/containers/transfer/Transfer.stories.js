// @flow

import React from 'react';
import { boolean, select, } from '@storybook/addon-knobs';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { action } from '@storybook/addon-actions';
import { withScreenshot } from 'storycap';
import {
  globalKnobs,
  walletLookup,
  genDummyWithCache,
} from '../../../stories/helpers/StoryWrapper';
import ByronEraOptionDialogContainer from './options/ByronEraOptionDialogContainer';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import WalletSettingsStore from '../../stores/base/WalletSettingsStore';
import TransactionsStore from '../../stores/base/TransactionsStore';
import DelegationStore from '../../stores/ada/DelegationStore';
import WalletStore from '../../stores/toplevel/WalletStore';
import { ROUTES } from '../../routes-config';
import type { GeneratedData } from './Transfer';
import Transfer from './Transfer';

export default {
  title: `${__filename.split('.')[0]}`,
  component: Transfer,
  decorators: [withScreenshot],
};

const mockTransferProps: {
  selected: null | PublicDeriver<>,
  dialog?: any,
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
      serverConnectionStore: {
        checkAdaServerStatus: select(
          'checkAdaServerStatus',
          ServerStatusErrors,
          ServerStatusErrors.Healthy,
        ),
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
          router: {
            goToRoute: { trigger: action('goToRoute'), },
          },
          dialogs: {
            closeActiveDialog: {
              trigger: action('closeActiveDialog'),
            },
            open: { trigger: action('open'), },
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
      },
    },
  },
});

export const MainPage = () => {
  const wallet = genDummyWithCache();
  const walletCases = {
    NoWallet: 0,
    HasWallet: 1
  };
  const walletValue = () => select(
    'walletCases',
    walletCases,
    walletCases.HasWallet,
  );
  const walletVal = walletValue();
  const lookup = walletLookup(walletVal === walletCases.NoWallet
    ? []
    : [wallet]);
  return (<Transfer
    {...mockTransferProps({
      currentRoute: ROUTES.TRANSFER.YOROI,
      selected: walletVal === walletCases.NoWallet ? null : wallet.publicDeriver,
      ...lookup,
    })}
  />);
};


export const ByronDialog = () => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (<Transfer
    {...mockTransferProps({
      currentRoute: ROUTES.TRANSFER.YOROI,
      dialog: ByronEraOptionDialogContainer,
      selected: wallet.publicDeriver,
      ...lookup,
    })}
  />);
};
