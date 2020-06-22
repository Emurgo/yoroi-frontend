// @flow
import { ROUTES } from '../routes-config';
import type { MessageDescriptor } from 'react-intl';
import globalMessages from '../i18n/global-messages';
import walletsIcon from '../assets/images/sidebar/my_wallets.inline.svg';
import transferIcon from '../assets/images/sidebar/transfer_wallets.inline.svg';
import settingsIcon from '../assets/images/sidebar/wallet-settings-2-ic.inline.svg';
import withLedgerNanoIcon from '../assets/images/top-bar/with-ledger-nano-logo.inline.svg';
import withTrezorTIcon from '../assets/images/top-bar/with-trezor-t-logo-white.inline.svg';
import goBackIcon from '../assets/images/top-bar/back-arrow-white.inline.svg';
import noticeBoardIcon from '../assets/images/notice-board/notice-board.inline.svg';

export type Category = {|
  name: string,
  className: string,
  route: string,
  icon: string,
  inlineText?: MessageDescriptor,
  label?: MessageDescriptor,
|};

export const WALLETS: string => Category = route => ({
  name: 'WALLETS',
  className: 'wallets',
  route,
  icon: walletsIcon,
  label: globalMessages.sidebarWallets
});

export const WITH_TREZOR_T: Category = {
  name: 'WITH_TREZOR_T',
  className: 'with-trezor-t',
  route: ROUTES.WALLETS.ROOT,
  icon: withTrezorTIcon,
};

export const WITH_LEDGER_NANO: Category = {
  name: 'WITH_LEDGER_NANO',
  className: 'with-ledger-nano',
  route: ROUTES.WALLETS.ROOT,
  icon: withLedgerNanoIcon,
};

export const BACK_TO_ADD: Category = {
  name: 'BACK_TO_ADD',
  className: 'go-back',
  route: ROUTES.WALLETS.ADD,
  icon: goBackIcon,
  inlineText: globalMessages.goBack
};

export const BACK_TO_MY_WALLETS: Category = {
  name: 'BACK_TO_ADD',
  className: 'go-back',
  route: ROUTES.MY_WALLETS,
  icon: goBackIcon,
  inlineText: globalMessages.goBack
};

export const TRANSFER_PAGE: Category = {
  name: 'WALLET_TRANSFER',
  className: 'wallet-transfer',
  route: ROUTES.TRANSFER.ROOT,
  icon: transferIcon,
  label: globalMessages.sidebarTransfer
};

export const SETTINGS: Category = {
  name: 'SETTINGS',
  className: 'settings',
  route: ROUTES.SETTINGS.ROOT,
  icon: settingsIcon,
  label: globalMessages.sidebarSettings
};

export const NOTICE_BOARD: Category = {
  name: 'NOTICE_BOARD',
  className: 'notice-board',
  route: ROUTES.NOTICE_BOARD.ROOT,
  icon: noticeBoardIcon,
};
