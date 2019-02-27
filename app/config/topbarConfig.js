// @flow
import { ROUTES } from '../routes-config';
import walletsIcon from '../assets/images/yoroi-logo-shape-white.inline.svg';
import withLedgerNanoSIcon from '../assets/images/top-bar/with-ledger-nano-s-logo-white.inline.svg';
import withTrezorTIcon from '../assets/images/top-bar/with-trezor-t-logo-white.inline.svg';
import settingsIcon from '../assets/images/top-bar/settings-ic.inline.svg';
import daedalusTransferIcon from '../assets/images/top-bar/daedalus-transfer.inline.svg';

export type Category = {
  name: string,
  route: string,
  icon: string
}
export const CATEGORIES = ([
  {
    name: 'WALLETS',
    route: ROUTES.WALLETS.ROOT,
    icon: walletsIcon,
  },
  {
    name: 'DAEDALUS_TRANSFER',
    route: ROUTES.DAEDALUS_TRANFER.ROOT,
    icon: daedalusTransferIcon,
  },
  {
    name: 'SETTINGS',
    route: ROUTES.SETTINGS.ROOT,
    icon: settingsIcon,
  },
]: Array<Category>);

export const WITH_TREZOR_T_CATEGORIE = {
  name: 'WITH_TREZOR_T',
  route: ROUTES.WALLETS.ROOT,
  icon: withTrezorTIcon,
};

export const WITH_LEDGER_NANO_S_CATEGORIE = {
  name: 'WITH_LEDGER_NANO_S',
  route: ROUTES.WALLETS.ROOT,
  icon: withLedgerNanoSIcon,
};
