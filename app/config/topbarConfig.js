// @flow
import { ROUTES } from '../routes-config';
import walletsIcon from '../assets/images/yoroi-logo-shape-white.inline.svg';
import withLedgerNanoSIcon from '../assets/images/top-bar/with-ledger-nano-s-logo.inline.svg';
import withTrezorTIcon from '../assets/images/top-bar/with-trezor-t-logo-white.inline.svg';
import settingsIcon from '../assets/images/top-bar/setting-active.inline.svg';
import daedalusTransferIcon from '../assets/images/top-bar/daedalus-migration-active.inline.svg';
import goBackIcon from '../assets/images/top-bar/back-arrow-white.inline.svg';

export type Category = {
  name: string,
  route: string,
  icon: string
}

export const WALLETS_CATEGORIE: Category = {
  name: 'WALLETS',
  route: ROUTES.WALLETS.ROOT,
  icon: walletsIcon,
};

export const WITH_TREZOR_T_CATEGORIE: Category = {
  name: 'WITH_TREZOR_T',
  route: ROUTES.WALLETS.ROOT,
  icon: withTrezorTIcon,
};

export const WITH_LEDGER_NANO_S_CATEGORIE: Category = {
  name: 'WITH_LEDGER_NANO_S',
  route: ROUTES.WALLETS.ROOT,
  icon: withLedgerNanoSIcon,
};

export const GO_BACK_CATEGORIE: Category = {
  name: 'GO_BACK',
  route: ROUTES.WALLETS.ADD,
  icon: goBackIcon,
};

export const CURRENCY_SPECIFIC_CATEGORIES = {
  ada: [
    {
      name: 'DAEDALUS_TRANSFER',
      route: ROUTES.TRANSFER.ROOT,
      icon: daedalusTransferIcon,
    }
  ]
};

// It's kind of defalut category
export const COMMON_CATEGORIES = ([
  WALLETS_CATEGORIE,
  {
    name: 'SETTINGS',
    route: ROUTES.SETTINGS.ROOT,
    icon: settingsIcon,
  },
]: Array<Category>);
