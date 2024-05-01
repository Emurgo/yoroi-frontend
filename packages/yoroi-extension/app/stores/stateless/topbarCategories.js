// @flow
import { ROUTES } from '../../routes-config';
import type { MessageDescriptor } from 'react-intl';
import { defineMessages } from 'react-intl';
import {
  networks,
  isCardanoHaskell,
} from '../../api/ada/lib/storage/database/prepackaged/networks';

import { ReactComponent as transactionsIcon } from '../../assets/images/wallet-nav/tab-transactions.inline.svg';
import { ReactComponent as sendIcon } from '../../assets/images/wallet-nav/tab-send.inline.svg';
import { ReactComponent as receiveIcon } from '../../assets/images/wallet-nav/tab-receive.inline.svg';
import { ReactComponent as dashboardIcon } from '../../assets/images/wallet-nav/tab-dashboard.inline.svg';
import { ReactComponent as delegationListIcon } from '../../assets/images/wallet-nav/tab-delegation_list.inline.svg';
import { ReactComponent as votingIcon } from '../../assets/images/wallet-nav/voting.inline.svg';
import { ReactComponent as assetsIcon } from '../../assets/images/assets-page/assets.inline.svg';
import environment from '../../environment';

const messages = defineMessages({
  transactions: {
    id: 'wallet.navigation.transactions',
    defaultMessage: '!!!Transactions',
  },
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

export const allCategories: Array<TopbarCategory> = [];

function registerCategory(category: TopbarCategory): TopbarCategory {
  allCategories.push(category);
  return category;
}

export const STAKE_DASHBOARD: TopbarCategory = registerCategory({
  className: 'stakeDashboard',
  route: ROUTES.WALLETS.DELEGATION_DASHBOARD,
  icon: dashboardIcon,
  label: messages.delegationDashboard,
  // every wallet is Cardano Shelley wallet now
  isVisible: _request => true,
});
export const SUMMARY: TopbarCategory = registerCategory({
  className: 'summary',
  route: ROUTES.WALLETS.TRANSACTIONS,
  icon: transactionsIcon,
  label: messages.transactions,
  isVisible: _request => true,
});
export const SEND: TopbarCategory = registerCategory({
  className: 'send',
  route: ROUTES.WALLETS.SEND,
  icon: sendIcon,
  label: messages.send,
  isVisible: _request => true,
});
export const ASSETS: TopbarCategory = registerCategory({
  className: 'assets',
  route: ROUTES.WALLETS.ASSETS,
  icon: assetsIcon,
  label: messages.assets,
  isVisible: ({ walletHasAssets }) => walletHasAssets,
});
export const RECEIVE: TopbarCategory = registerCategory({
  className: 'receive',
  route: ROUTES.WALLETS.RECEIVE.ROOT,
  icon: receiveIcon,
  label: messages.receive,
  isVisible: _request => true,
});
export const VOTING: TopbarCategory = registerCategory({
  className: 'voting',
  route: ROUTES.WALLETS.CATALYST_VOTING,
  icon: votingIcon,
  label: messages.voting,
  isVisible: _request => true,
});
export const SEIZA_STAKE_SIMULATOR: TopbarCategory = registerCategory({
  className: 'stakeSimulator',
  route: ROUTES.WALLETS.ADAPOOL_DELEGATION_SIMPLE,
  icon: delegationListIcon,
  label: messages.delegationList,
  isVisible: request => request.networkId === networks.CardanoMainnet.NetworkId,
});

export const CARDANO_DELEGATION: TopbarCategory = registerCategory({
  className: 'cardanoStake',
  route: ROUTES.WALLETS.CARDANO_DELEGATION,
  icon: undefined,
  label: messages.delegationById,
  isVisible: request => {
    const { networkId } = request;
    return (
      (environment.isTest() ||
        networkId === networks.CardanoTestnet.NetworkId ||
        networkId === networks.CardanoPreprodTestnet.NetworkId ||
        networkId === networks.CardanoPreviewTestnet.NetworkId ||
        networkId === networks.CardanoSanchoTestnet.NetworkId)
    );
  },
  isHiddenButAllowed: true,
});

/** Revamp Wallet categoriess */
export const allSubcategoriesRevamp: Array<TopbarCategory> = [
  {
    className: 'summary',
    route: ROUTES.WALLETS.TRANSACTIONS,
    label: messages.transactions,
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
  {
    className: CARDANO_DELEGATION.className,
    route: CARDANO_DELEGATION.route,
    label: CARDANO_DELEGATION.label,
    isVisible: CARDANO_DELEGATION.isVisible,
  },
];
