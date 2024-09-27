// @flow
import type { MessageDescriptor } from 'react-intl';
import { ReactComponent as dappConnectorIcon } from '../../assets/images/dapp-connector/dapp-connector.inline.svg';
import { ReactComponent as walletsIcon } from '../../assets/images/sidebar/my_wallets.inline.svg';
import { ReactComponent as governanceIcon } from '../../assets/images/sidebar/revamp/governance.inline.svg';
import { ReactComponent as nftsIcon } from '../../assets/images/sidebar/revamp/nfts.inline.svg';
import { ReactComponent as portfolioIcon } from '../../assets/images/sidebar/revamp/portfolio.inline.svg';
import { ReactComponent as settingIcon } from '../../assets/images/sidebar/revamp/setting.inline.svg';
import { ReactComponent as stakingIcon } from '../../assets/images/sidebar/revamp/staking.inline.svg';
import { ReactComponent as swapIcon } from '../../assets/images/sidebar/revamp/swap.inline.svg';
import { ReactComponent as votingIcon } from '../../assets/images/sidebar/revamp/voting.inline.svg';
import { ReactComponent as walletIcon } from '../../assets/images/sidebar/revamp/wallet.inline.svg';
import { ReactComponent as transferIcon } from '../../assets/images/sidebar/transfer_wallets.inline.svg';
import { ReactComponent as settingsIcon } from '../../assets/images/sidebar/wallet-settings-2-ic.inline.svg';
import { ReactComponent as goBackIcon } from '../../assets/images/top-bar/back-arrow-white.inline.svg';
import environment from '../../environment';
import globalMessages, { connectorMessages } from '../../i18n/global-messages';
import { ROUTES } from '../../routes-config';

export type SidebarCategory = {|
  +className: string,
  +route: string,
  +icon: string,
  +label?: MessageDescriptor,
  +isVisible: ({|
    hasAnyWallets: boolean,
    selected: ?{ publicDeriverId: number, ... },
    currentRoute: string,
  |}) => boolean,
|};

export const allCategories: Array<SidebarCategory> = [];
function registerCategory(category: SidebarCategory): SidebarCategory {
  allCategories.push(category);
  return category;
}

export const MY_WALLETS: SidebarCategory = registerCategory({
  className: 'wallets',
  route: ROUTES.MY_WALLETS,
  icon: walletsIcon,
  label: globalMessages.sidebarWallets,
  isVisible: request => request.hasAnyWallets && request.selected == null,
});

export const WALLETS_ROOT: SidebarCategory = registerCategory({
  className: 'wallets',
  route: ROUTES.WALLETS.ROOT,
  icon: walletsIcon,
  label: globalMessages.sidebarWallets,
  isVisible: request => request.hasAnyWallets && request.selected != null,
});

export const BACK_TO_ADD: SidebarCategory = registerCategory({
  className: 'go-back',
  route: ROUTES.WALLETS.ADD,
  icon: goBackIcon,
  label: globalMessages.goBack,
  isVisible: request => !request.hasAnyWallets,
});

export const SETTINGS: SidebarCategory = registerCategory({
  className: 'settings',
  route: ROUTES.SETTINGS.ROOT,
  icon: settingsIcon,
  label: globalMessages.sidebarSettings,
  isVisible: r => r.selected != null,
});

export const TRANSFER_PAGE: SidebarCategory = registerCategory({
  className: 'wallet-transfer',
  route: ROUTES.TRANSFER.ROOT,
  icon: transferIcon,
  label: globalMessages.sidebarTransfer,
  isVisible: r => r.selected != null,
});

export const CONNECTED_WEBSITES: SidebarCategory = registerCategory({
  className: 'dapp-connector',
  route: ROUTES.DAPP_CONNECTOR.CONNECTED_WEBSITES,
  icon: dappConnectorIcon,
  label: connectorMessages.dappConnector,
  isVisible: _request => !environment.isLight,
});

type isVisibleFunc = ({|
  hasAnyWallets: boolean,
  selected: ?WalletState,
  currentRoute: string,
  isRewardWallet: isRewardWalletFunc,
|}) => boolean;

type isRewardWalletFunc = ({ publicDeriverId: number, ... }) => boolean;

export type SidebarCategoryRevamp = {|
  +className: string,
  +route: string,
  +icon: string,
  +label?: MessageDescriptor,
  +isVisible: isVisibleFunc,
  +featureFlagName?: string,
|};

// TODO: Fix routes and isVisible prop
export const allCategoriesRevamp: Array<SidebarCategoryRevamp> = [
  // Open `/wallets` only if the user is on any other page other than `/wallets/add`
  makeWalletCategory(
    ROUTES.WALLETS.ROOT,
    ({ currentRoute, hasAnyWallets }) => currentRoute !== ROUTES.WALLETS.ADD && hasAnyWallets
  ),
  // Open `/wallets/transactions` if the user is on the `/wallet/add`
  makeWalletCategory(
    ROUTES.WALLETS.TRANSACTIONS,
    ({ currentRoute, hasAnyWallets }) => currentRoute === ROUTES.WALLETS.ADD && hasAnyWallets
  ),
  // If user didn't restored any wallets, it should redirect to the add wallet page.
  makeWalletCategory(ROUTES.WALLETS.ADD, ({ hasAnyWallets }) => !hasAnyWallets),
  {
    className: 'staking',
    route: ROUTES.STAKING,
    icon: stakingIcon,
    label: globalMessages.sidebarStaking,
    isVisible: ({ selected, isRewardWallet }) => !!selected && isRewardWallet(selected),
  },
  {
    className: 'swap',
    route: ROUTES.SWAP.ROOT,
    icon: swapIcon,
    label: globalMessages.sidebarSwap,
    isVisible: ({ selected }) => (environment.isDev() || environment.isNightly()) && !selected?.isTestnet,
  },
  // {
  //   className: 'assets',
  //   route: ROUTES.ASSETS.ROOT,
  //   icon: assetsIcon,
  //   label: globalMessages.sidebarAssets,
  //   isVisible: _request => _request.selected !== null,
  // },
  {
    className: 'portfolio',
    route: ROUTES.PORTFOLIO.ROOT,
    icon: portfolioIcon,
    label: globalMessages.sidebarPortfolio,
    isVisible: () => environment.isDev(),
  },
  {
    className: 'nfts',
    route: ROUTES.NFTS.ROOT,
    icon: nftsIcon,
    label: globalMessages.sidebarNfts,
    isVisible: _request => _request.selected !== null,
  },
  {
    className: 'voting',
    route: ROUTES.REVAMP.CATALYST_VOTING,
    icon: votingIcon,
    label: globalMessages.sidebarVoting,
    // $FlowFixMe[prop-missing]
    isVisible: request => request.selected != null,
  },
  {
    className: 'connected-websites',
    route: ROUTES.DAPP_CONNECTOR.CONNECTED_WEBSITES,
    icon: dappConnectorIcon,
    label: connectorMessages.connector,
    isVisible: _request => true,
  },
  // {
  //   className: 'swap',
  //   route: '/swap',
  //   icon: swapIcon,
  //   label: globalMessages.sidebarSwap,
  //   isVisible: _request => true,
  // },
  {
    className: 'governance',
    route: '/governance',
    icon: governanceIcon,
    label: globalMessages.sidebarGovernance,
    isVisible: ({ selected }) => selected != null && selected.type !== 'trezor',
  },
  {
    className: 'settings',
    route: '/settings',
    icon: settingIcon,
    label: globalMessages.sidebarSettings,
    isVisible: _request => true,
  },
  // {
  //   className: 'new-updates',
  //   route: '/new-updates',
  //   icon: newUpdatesIcon,
  //   label: globalMessages.sidebarNewUpdates,
  //   isVisible: _request => true,
  // },
  // {
  //   className: 'feedback',
  //   route: '/feedback',
  //   icon: feedbackIcon,
  //   label: globalMessages.sidebarFeedback,
  //   isVisible: _request => true,
  // },
];

function makeWalletCategory(route: string, isVisible: isVisibleFunc): SidebarCategoryRevamp {
  return {
    className: 'wallets',
    route,
    icon: walletIcon,
    label: globalMessages.walletLabel,
    isVisible,
  };
}
