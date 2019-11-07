// @flow
import { ROUTES } from '../routes-config';
import type { MessageDescriptor } from 'react-intl';
import globalMessages from '../i18n/global-messages';
import walletsIcon from '../assets/images/yoroi-logo-shape-white.inline.svg';
import withLedgerNanoIcon from '../assets/images/top-bar/with-ledger-nano-logo.inline.svg';
import withTrezorTIcon from '../assets/images/top-bar/with-trezor-t-logo-white.inline.svg';
import settingsIcon from '../assets/images/top-bar/setting-active.inline.svg';
import daedalusTransferIcon from '../assets/images/top-bar/daedalus-migration-active.inline.svg';
import goBackIcon from '../assets/images/top-bar/back-arrow-white.inline.svg';
import styles from '../components/topbar/TopBarCategory.scss';

export type Category = {
  name: string,
  className: string,
  route: string,
  icon: string,
  iconStyle?: string,
  inlineText?: MessageDescriptor,
}

export const WALLETS: Category = {
  name: 'WALLETS',
  className: 'wallets',
  route: ROUTES.WALLETS.ROOT,
  icon: walletsIcon,
  iconStyle: styles.walletsIcon,
};

export const WITH_TREZOR_T: Category = {
  name: 'WITH_TREZOR_T',
  className: 'with-trezor-t',
  route: ROUTES.WALLETS.ROOT,
  icon: withTrezorTIcon,
  iconStyle: styles.withTrezorTIcon,
};

export const WITH_LEDGER_NANO: Category = {
  name: 'WITH_LEDGER_NANO',
  className: 'with-ledger-nano',
  route: ROUTES.WALLETS.ROOT,
  icon: withLedgerNanoIcon,
  iconStyle: styles.withLedgerNanoIcon,
};

export const GO_BACK: Category = {
  name: 'GO_BACK',
  className: 'go-back',
  route: ROUTES.WALLETS.ADD,
  icon: goBackIcon,
  iconStyle: styles.goBackIcon,
  inlineText: globalMessages.goBack
};

export const CURRENCY_SPECIFIC_CATEGORIES = {
  ada: [
    {
      name: 'DAEDALUS_TRANSFER',
      className: 'daedalus-transfer',
      route: ROUTES.TRANSFER.ROOT,
      icon: daedalusTransferIcon,
    }
  ]
};

export const SETTINGS: Category = {
  name: 'SETTINGS',
  className: 'settings',
  route: ROUTES.SETTINGS.ROOT,
  icon: settingsIcon,
};
