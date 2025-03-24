// @flow
import { ROUTES } from '../../routes-config';
import type { MessageDescriptor } from 'react-intl';
import { defineMessages } from 'react-intl';
import globalMessages from '../../i18n/global-messages';

const messages = defineMessages({
  send: {
    id: 'wallet.navigation.send',
    defaultMessage: '!!!Send',
  },
  receive: {
    id: 'wallet.navigation.receive',
    defaultMessage: '!!!Receive',
  },
  delegationDashboard: {
    id: 'wallet.navigation.delegationDashboard',
    defaultMessage: '!!!Dashboard',
  },
  delegationById: {
    id: 'wallet.navigation.delegationById',
    defaultMessage: '!!!Delegation by Id',
  },
  delegationList: {
    id: 'wallet.navigation.delegationList',
    defaultMessage: '!!!Delegation List',
  },
  voting: {
    id: 'wallet.navigation.voting',
    defaultMessage: '!!!Voting',
  },
  assets: {
    id: 'wallet.navigation.assets',
    defaultMessage: '!!!Assets',
  },
});

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
    label: messages.send,
    isVisible: _request => true,
  },
  {
    className: 'receive',
    route: ROUTES.WALLETS.RECEIVE.ROOT,
    label: messages.receive,
    isVisible: _request => true,
  },
];
