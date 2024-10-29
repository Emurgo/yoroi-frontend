// @flow
import type { MessageDescriptor } from 'react-intl';
import { ReactComponent as dappConnectorIcon } from '../../assets/images/dapp-connector/dapp-connector.inline.svg';
import { ReactComponent as assetsIcon } from '../../assets/images/sidebar/revamp/assets.inline.svg';
import { ReactComponent as governanceIcon } from '../../assets/images/sidebar/revamp/governance.inline.svg';
import { ReactComponent as nftsIcon } from '../../assets/images/sidebar/revamp/nfts.inline.svg';
import { ReactComponent as portfolioIcon } from '../../assets/images/sidebar/revamp/portfolio.inline.svg';
import { ReactComponent as settingIcon } from '../../assets/images/sidebar/revamp/setting.inline.svg';
import { ReactComponent as stakingIcon } from '../../assets/images/sidebar/revamp/staking.inline.svg';
import { ReactComponent as swapIcon } from '../../assets/images/sidebar/revamp/swap.inline.svg';
import { ReactComponent as votingIcon } from '../../assets/images/sidebar/revamp/voting.inline.svg';
import { ReactComponent as walletIcon } from '../../assets/images/sidebar/revamp/wallet.inline.svg';
import environment from '../../environment';
import globalMessages, { connectorMessages } from '../../i18n/global-messages';
import { ROUTES } from '../../routes-config';
import type { WalletState } from '../../../chrome/extension/background/types';

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
    isVisible: ({ selected }) => !selected?.isTestnet,
  },
  {
    className: 'assets',
    route: ROUTES.ASSETS.ROOT,
    icon: assetsIcon,
    label: globalMessages.sidebarAssets,
    isVisible: _request => _request.selected !== null,
  },
  {
    className: 'portfolio',
    route: ROUTES.PORTFOLIO.ROOT,
    icon: portfolioIcon,
    label: globalMessages.sidebarPortfolio,
    isVisible: ({ selected }) => environment.isDev() && selected?.networkId === 250,
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
