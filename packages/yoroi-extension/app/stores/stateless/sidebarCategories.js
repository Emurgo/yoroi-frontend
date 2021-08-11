// @flow
import { ROUTES } from '../../routes-config';
import type { MessageDescriptor } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import walletsIcon from '../../assets/images/sidebar/my_wallets.inline.svg';
import transferIcon from '../../assets/images/sidebar/transfer_wallets.inline.svg';
import settingsIcon from '../../assets/images/sidebar/wallet-settings-2-ic.inline.svg';
import goBackIcon from '../../assets/images/top-bar/back-arrow-white.inline.svg';
import noticeBoardIcon from '../../assets/images/notice-board/notice-board.inline.svg';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { matchRoute } from '../../utils/routing';
import environment from '../../environment';

import walletIcon from '../../assets/images/sidebar/revamp/wallet.inline.svg';
import stakingIcon from '../../assets/images/sidebar/revamp/staking.inline.svg';
import assetsIcon from '../../assets/images/sidebar/revamp/assets.inline.svg';
import votingIcon from '../../assets/images/sidebar/revamp/voting.inline.svg';
import swapIcon from '../../assets/images/sidebar/revamp/swap.inline.svg';
import settingIcon from '../../assets/images/sidebar/revamp/setting.inline.svg';
import faqIcon from '../../assets/images/sidebar/revamp/faq.inline.svg';
import newUpdatesIcon from '../../assets/images/sidebar/revamp/new-updates.inline.svg';
import feedbackIcon from '../../assets/images/sidebar/revamp/feedback.inline.svg';

export type SidebarCategory = {|
  +className: string,
  +route: string,
  +icon: string,
  +label?: MessageDescriptor,
  +isVisible: ({|
    hasAnyWallets: boolean,
    selected: null | PublicDeriver<>,
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
  isVisible: request =>
    request.hasAnyWallets &&
    request.selected == null &&
    matchRoute(ROUTES.WALLETS.ADD, request.currentRoute) === false,
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

export const BACK_TO_MY_WALLETS: SidebarCategory = registerCategory({
  className: 'go-back',
  route: ROUTES.MY_WALLETS,
  icon: goBackIcon,
  label: globalMessages.goBack,
  isVisible: request =>
    request.hasAnyWallets &&
    request.selected == null &&
    matchRoute(ROUTES.WALLETS.ADD, request.currentRoute) !== false,
});

export const SETTINGS: SidebarCategory = registerCategory({
  className: 'settings',
  route: ROUTES.SETTINGS.ROOT,
  icon: settingsIcon,
  label: globalMessages.sidebarSettings,
  isVisible: _request => true,
});

export const TRANSFER_PAGE: SidebarCategory = registerCategory({
  className: 'wallet-transfer',
  route: ROUTES.TRANSFER.ROOT,
  icon: transferIcon,
  label: globalMessages.sidebarTransfer,
  isVisible: _request => true,
});

export const NOTICE_BOARD: SidebarCategory = registerCategory({
  className: 'notice-board',
  route: ROUTES.NOTICE_BOARD.ROOT,
  icon: noticeBoardIcon,
  isVisible: _request => !environment.isProduction(),
});
export type SidebarCategoryRevamp = {|
  +className: string,
  +route: string,
  +icon: string,
  +label?: MessageDescriptor,
  +isVisible: ({|
    hasAnyWallets: boolean,
    selected: null | PublicDeriver<>,
    currentRoute: string,
  |}) => boolean,
|};
// TODO: Fix routes and isVisible prop
export const allCategoriesRevamp: Array<SidebarCategoryRevamp> = [
  {
    className: 'wallets',
    route: ROUTES.MY_WALLETS,
    icon: walletIcon,
    label: globalMessages.sidebarWallets,
    isVisible: request =>
      request.hasAnyWallets &&
      request.selected == null &&
      matchRoute(ROUTES.WALLETS.ADD, request.currentRoute) === false,
  },
  {
    className: 'staking',
    route: '/staking',
    icon: stakingIcon,
    label: globalMessages.sidebarStaking,
    isVisible: request => request.hasAnyWallets,
  },
  {
    className: 'assets',
    route: '/assets',
    icon: assetsIcon,
    label: globalMessages.sidebarAssets,
    isVisible: request => request.hasAnyWallets,
  },
  {
    className: 'voting',
    route: '/voting',
    icon: votingIcon,
    label: globalMessages.sidebarVoting,
    isVisible: request => request.hasAnyWallets,
  },
  {
    className: 'swap',
    route: '/swap',
    icon: swapIcon,
    label: globalMessages.sidebarSwap,
    isVisible: request => request.hasAnyWallets,
  },
  {
    className: 'settings',
    route: '/settings',
    icon: settingIcon,
    label: globalMessages.sidebarSettings,
    isVisible: request => request.hasAnyWallets,
  },
  {
    className: 'faq',
    route: '/faq',
    icon: faqIcon,
    label: globalMessages.sidebarFaq,
    isVisible: request => request.hasAnyWallets,
  },
  {
    className: 'new-updates',
    route: '/new-updates',
    icon: newUpdatesIcon,
    label: globalMessages.sidebarNewUpdates,
    isVisible: request => request.hasAnyWallets,
  },
  {
    className: 'feedback',
    route: '/feedback',
    icon: feedbackIcon,
    label: globalMessages.sidebarFeedback,
    isVisible: request => request.hasAnyWallets,
  },
];
