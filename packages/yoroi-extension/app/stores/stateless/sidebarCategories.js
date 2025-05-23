// @flow
import type { MessageDescriptor } from 'react-intl';
import { ReactComponent as dappConnectorIcon } from '../../assets/images/dapp-connector/dapp-connector.inline.svg';
import { ReactComponent as CashbackIcon } from '../../assets/images/sidebar/cashback.inline.svg';
import { ReactComponent as governanceIcon } from '../../assets/images/sidebar/revamp/governance.inline.svg';
import { ReactComponent as nftsIcon } from '../../assets/images/sidebar/revamp/nfts.inline.svg';
import { ReactComponent as portfolioIcon } from '../../assets/images/sidebar/revamp/portfolio.inline.svg';
import { ReactComponent as settingIcon } from '../../assets/images/sidebar/revamp/setting.inline.svg';
import { ReactComponent as stakingIcon } from '../../assets/images/sidebar/revamp/staking.inline.svg';
import { ReactComponent as swapIcon } from '../../assets/images/sidebar/revamp/swap.inline.svg';
import { ReactComponent as votingIcon } from '../../assets/images/sidebar/revamp/voting.inline.svg';
import { ReactComponent as walletIcon } from '../../assets/images/sidebar/revamp/wallet.inline.svg';
import globalMessages, { connectorMessages } from '../../i18n/global-messages';
import { ROUTES } from '../../routes-config';
import type { WalletState } from '../../../chrome/extension/background/types';
import environment from '../../environment';

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

const existsSelectedWallet = ({ selected }) => selected != null;
const isOnMainnet = ({ selected }): boolean => selected != null && !selected.isTestnet;
const nonTrezorWallet = ({ selected }): boolean => selected?.type !== 'trezor';

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
    isVisible: existsSelectedWallet,
  },
  {
    className: 'swap',
    route: ROUTES.SWAP.ROOT,
    icon: swapIcon,
    label: globalMessages.sidebarSwap,
    isVisible: isOnMainnet,
  },
  {
    className: 'swap',
    route: ROUTES.SWAP_REVAMP.ASSET_SWAP,
    icon: swapIcon,
    label: globalMessages.sidebarSwap,
    isVisible: () => environment.isDev(),
  },
  {
    className: 'portfolio',
    route: ROUTES.PORTFOLIO.ROOT,
    icon: portfolioIcon,
    label: globalMessages.sidebarPortfolio,
    isVisible: existsSelectedWallet,
  },
  {
    className: 'nfts',
    route: ROUTES.NFTS.ROOT,
    icon: nftsIcon,
    label: globalMessages.sidebarNfts,
    isVisible: existsSelectedWallet,
  },
  {
    className: 'nft-gallery',
    route: ROUTES.NFT_GALLERY.ROOT,
    icon: nftsIcon,
    label: globalMessages.sidebarNfts,
    isVisible: () => environment.isDev(),
  },
  {
    className: 'voting',
    route: ROUTES.REVAMP.CATALYST_VOTING,
    icon: votingIcon,
    label: globalMessages.sidebarVoting,
    isVisible: existsSelectedWallet,
  },
  {
    className: 'cashback',
    route: ROUTES.CASHBACK.ROOT,
    icon: CashbackIcon,
    label: globalMessages.sidebarCashback,
    isVisible: params => isOnMainnet(params) && nonTrezorWallet(params),
  },
  {
    className: 'connected-websites',
    route: ROUTES.DAPP_CONNECTOR.CONNECTED_WEBSITES,
    icon: dappConnectorIcon,
    label: connectorMessages.connector,
    isVisible: () => !environment.isDev(),
  },
  {
    className: 'dapp-center',
    route: ROUTES.DAPP_CONNECTOR.DAPP_CENTER,
    icon: dappConnectorIcon,
    label: connectorMessages.connector,
    isVisible: () => environment.isDev(),
  },
  {
    className: 'governance',
    route: '/governance',
    icon: governanceIcon,
    label: globalMessages.sidebarGovernance,
    isVisible: existsSelectedWallet,
  },
  {
    className: 'settings',
    route: '/settings',
    icon: settingIcon,
    label: globalMessages.sidebarSettings,
    isVisible: () => true,
  },
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
