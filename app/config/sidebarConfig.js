// @flow
import { ROUTES } from '../routes-config';
import walletsIcon from '../assets/images/sidebar/icarus-ic.inline.svg';
import settingsIcon from '../assets/images/sidebar/settings-ic.inline.svg';
import daedalusTransferIcon from '../assets/images/sidebar/daedalus-transfer-white.inline.svg';

export const CATEGORIES = [
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
];
