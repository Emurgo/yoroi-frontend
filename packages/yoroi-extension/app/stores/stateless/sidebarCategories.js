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

export type SidebarCategory = {|
  +className: string,
  +route: string,
  +icon: string,
  +label?: MessageDescriptor,
  +isVisible: {|
    hasAnyWallets: boolean,
    selected: null | PublicDeriver<>,
    currentRoute: string,
  |} => boolean,
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
  isVisible: request => (
    request.hasAnyWallets &&
    request.selected == null &&
    matchRoute(ROUTES.WALLETS.ADD, request.currentRoute) === false
  ),
});
export const WALLETS_ROOT: SidebarCategory = registerCategory({
  className: 'wallets',
  route: ROUTES.WALLETS.ROOT,
  icon: walletsIcon,
  label: globalMessages.sidebarWallets,
  isVisible: request => (
    request.hasAnyWallets &&
    request.selected != null
  ),
});

export const BACK_TO_ADD: SidebarCategory = registerCategory({
  className: 'go-back',
  route: ROUTES.WALLETS.ADD,
  icon: goBackIcon,
  label: globalMessages.goBack,
  isVisible: request => (
    !request.hasAnyWallets
  ),
});

export const BACK_TO_MY_WALLETS: SidebarCategory = registerCategory({
  className: 'go-back',
  route: ROUTES.MY_WALLETS,
  icon: goBackIcon,
  label: globalMessages.goBack,
  isVisible: request => (
    request.hasAnyWallets &&
    request.selected == null &&
    matchRoute(ROUTES.WALLETS.ADD, request.currentRoute) !== false
  ),
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
