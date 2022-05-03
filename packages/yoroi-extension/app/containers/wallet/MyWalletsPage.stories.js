// @flow

import type { Node } from 'react';
import BigNumber from 'bignumber.js';
import { select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withScreenshot } from 'storycap';
import {
  genShelleyCIP1852SigningWalletWithCache,
} from '../../../stories/helpers/cardano/ShelleyCip1852Mocks';
import {
  walletLookup,
} from '../../../stories/helpers/WalletCache';
import CachedRequest from '../../stores/lib/LocalizedCachedRequest';
import type { GetBalanceFunc } from '../../api/common/types';
import MyWalletsPage from './MyWalletsPage';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { ROUTES } from '../../routes-config';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';
import { defaultAssets, } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { mockFromDefaults, getDefaultEntryTokenInfo, } from '../../stores/toplevel/TokenInfoStore';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import BuySellDialog from '../../components/buySell/BuySellDialog';
import { CoreAddressTypes, } from '../../api/ada/lib/storage/database/primitives/enums';

export default {
  title: `${__filename.split('.')[0]}`,
  component: MyWalletsPage,
  decorators: [withScreenshot],
};

const genWallet = () => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();

  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

  const balance: CachedRequest<GetBalanceFunc> = new CachedRequest(_request => Promise.resolve(
    new MultiToken(
      [{
        amount: new BigNumber(3_000_000),
        networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
        identifier: defaultAssets.filter(
          asset => asset.NetworkId === wallet.publicDeriver.getParent().getNetworkInfo().NetworkId
        )[0].Identifier,
      }],
      defaultToken
    ),
  ));
  const calculationCases = {
    Pending: 0,
    Calculated: 1,
  };
  const getBalanceCase = () => select(
    'balanceCases',
    calculationCases,
    calculationCases.Calculated
  );
  const syncCases = {
    Never: 0,
    Recent: 1,
  };
  const getSyncCases = () => select(
    'syncCases',
    syncCases,
    syncCases.Recent
  );
  if (getBalanceCase() === calculationCases.Calculated) {
    balance.execute((null: any));
  }
  const oldResults = wallet.getTransactions(wallet.publicDeriver);
  wallet.getTransactions = (_req) => ({
    ...oldResults,
    lastSyncInfo: {
      LastSyncInfoId: 0,
      Time: getSyncCases() === syncCases.Never ? null : new Date(),
      SlotNum: getSyncCases() === syncCases.Never ? null : 0,
      BlockHash: getSyncCases() === syncCases.Never ? null : 'b4a244a86e95308f988d20a77e9576b0b84807d43e733d6fa13475f52b46825c',
      Height: 0
    },
    requests: {
      ...oldResults.requests,
      getBalanceRequest: balance,
    },
  });
  return wallet;
};

const genBaseProps: {|
  lookup: *,
  publicDerivers: Array<PublicDeriver<>>,
  openDialog?: *,
  getReceiveAddress: *,
|} => * = (request) => {
  return {
    getReceiveAddress: request.getReceiveAddress,
    stores: {
      profile: {
        shouldHideBalance: false,
      },
      wallets: {
        publicDerivers: request.publicDerivers,
        getPublicKeyCache: request.lookup.getPublicKeyCache
      },
      tokenInfoStore: {
        tokenInfo: mockFromDefaults(defaultAssets),
        getDefaultTokenInfo: networkId => getDefaultEntryTokenInfo(
          networkId,
          mockFromDefaults(defaultAssets)
        ),
      },
      transactions: {
        getTxRequests: request.lookup.getTransactions,
        isWalletRefreshing: _publicDeriver => false,
      },
      walletSettings: {
        getConceptualWalletSettingsCache: request.lookup.getConceptualWalletSettingsCache,
      },
      delegation: {
        getDelegationRequests: request.lookup.getDelegation
      },
      uiDialogs: {
        isOpen: clazz => clazz === request.openDialog,
      },
    },
    actions: {
      profile: {
        updateHideBalance: { trigger: async (req) => action('updateHideBalance')(req) },
      },
      router: {
        goToRoute: { trigger: action('goToRoute') },
      },
      wallets: {
        unselectWallet: { trigger: action('unselectWallet') },
        setActiveWallet: { trigger: action('setActiveWallet') },
      },
      dialogs: {
        open: { trigger: action('open') },
        closeActiveDialog: { trigger: action('closeActiveDialog') },
      },
    },
    SidebarContainerProps: {
      generated: {
        stores: {
          wallets: {
            hasAnyWallets: request.publicDerivers.length > 0,
            selected: null,
          },
          app: { currentRoute: ROUTES.MY_WALLETS },
          profile: {
            isSidebarExpanded: false,
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
  };
}

const mockAddressInfo = {
  addr: {
    AddressId: 0,
    Digest: 0,
    Type: CoreAddressTypes.CARDANO_BASE,
    Hash: '0136e35ce4f06cdcf74d2307f6cefa1ad74e14060be6dac5a29eb1423f56db5cd4889c84110d4de90c0d503b51b844db3e6fd87991238995bb'
  },
  row: {
    CanonicalAddressId: 0,
    KeyDerivationId: 0,
  },
  addressing: {
    path: [],
    startLevel: 0,
  },
};

export const Wallets = (): Node => {
  const wallets = [
    genWallet(),
    genWallet(),
    genWallet(),
    genWallet(),
  ];
  const lookup = walletLookup(wallets);
  const publicDerivers = [
    ...wallets.map(cache => cache.publicDeriver),
  ];
  return (<MyWalletsPage
    generated={genBaseProps({
      lookup,
      publicDerivers,
      getReceiveAddress: async () => mockAddressInfo,
    })}
  />);
};

export const BuySellAddressList = (): Node => {
  const wallets = [
    genWallet(),
    genWallet(),
    genWallet(),
    genWallet(),
  ];
  const lookup = walletLookup(wallets);
  const publicDerivers = [
    ...wallets.map(cache => cache.publicDeriver),
  ];
  return (<MyWalletsPage
    generated={genBaseProps({
      lookup,
      publicDerivers,
      openDialog: BuySellDialog,
      getReceiveAddress: async () => mockAddressInfo,
    })}
  />);
};
