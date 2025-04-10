// @flow
import { ROUTES } from '../../routes-config';
import type { MessageDescriptor } from 'react-intl';
import globalMessages from '../../i18n/global-messages';

export type TopbarCategory = {|
  +className: string,
  +route: string,
  +icon?: string,
  +label?: MessageDescriptor,
  +isVisible: ({|
    selected: number,
    networkId: number,
    walletHasAssets: boolean,
  |}) => boolean | {| disabledReason: MessageDescriptor |},
  isHiddenButAllowed?: boolean,
|};

/** Revamp Wallet categoriess */
export const allSubcategoriesRevamp: Array<TopbarCategory> = [
  {
    className: 'summary',
    route: ROUTES.WALLETS.TRANSACTIONS,
    label: globalMessages.transactions,
    isVisible: _request => true,
  },
  {
    className: 'send',
    route: ROUTES.WALLETS.SEND,
    label: globalMessages.send,
    isVisible: _request => true,
  },
  {
    className: 'receive',
    route: ROUTES.WALLETS.RECEIVE.ROOT,
    label: globalMessages.receive,
    isVisible: _request => true,
  },
];
