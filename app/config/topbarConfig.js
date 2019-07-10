// @flow
import { ROUTES } from '../routes-config';
import type { MessageDescriptor } from 'react-intl';
import walletsIcon from '../assets/images/yoroi-logo-shape-white.inline.svg';
import withLedgerNanoSIcon from '../assets/images/top-bar/with-ledger-nano-s-logo.inline.svg';
import withTrezorTIcon from '../assets/images/top-bar/with-trezor-t-logo-white.inline.svg';
import settingsIcon from '../assets/images/top-bar/setting-active.inline.svg';
import daedalusTransferIcon from '../assets/images/top-bar/daedalus-migration-active.inline.svg';
import goBackIcon from '../assets/images/top-bar/back-arrow-white.inline.svg';
import styles from '../components/topbar/TopBarCategory.scss';
import globalMessages from '../i18n/global-messages';

export type Category = {
  name: string,
  className: string,
  route: string,
  icon: string,
  iconStyle?: string,
  messageDescriptor?: MessageDescriptor
}

export const WALLETS_CATEGORY: Category = {
  name: 'WALLETS',
  className: 'wallets',
  route: ROUTES.WALLETS.ROOT,
  icon: walletsIcon,
  iconStyle: styles.walletsIcon,
};

export const WITH_TREZOR_T_CATEGORY: Category = {
  name: 'WITH_TREZOR_T',
  className: 'with-trezor-t',
  route: ROUTES.WALLETS.ROOT,
  icon: withTrezorTIcon,
  iconStyle: styles.withTrezorTIcon,
};

export const WITH_LEDGER_NANO_S_CATEGORY: Category = {
  name: 'WITH_LEDGER_NANO_S',
  className: 'with-ledger-nano-s',
  route: ROUTES.WALLETS.ROOT,
  icon: withLedgerNanoSIcon,
  iconStyle: styles.withLedgerNanoSIcon,
};

export const GO_BACK_CATEGORY: Category = {
  name: 'GO_BACK',
  className: 'go-back',
  route: ROUTES.WALLETS.ADD,
  icon: goBackIcon,
  iconStyle: styles.goBackIcon,
  messageDescriptor: globalMessages.goBack
};

export const CURRENCY_SPECIFIC_CATEGORIES = {
  ada: [
    {
      name: 'DAEDALUS_TRANSFER',
      className: 'daedalus-transfer',
      route: ROUTES.DAEDALUS_TRANFER.ROOT,
      icon: daedalusTransferIcon,
    }
  ]
};

export const SETTINGS_CATEGORY: Category = {
  name: 'SETTINGS',
  className: 'settings',
  route: ROUTES.SETTINGS.ROOT,
  icon: settingsIcon,
};

// Default common categories
export const COMMON_CATEGORIES = ([
  WALLETS_CATEGORY,
  SETTINGS_CATEGORY,
]: Array<Category>);
