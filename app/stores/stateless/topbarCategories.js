// @flow
import { ROUTES } from '../../routes-config';
import type { MessageDescriptor } from 'react-intl';
import { defineMessages, } from 'react-intl';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { asGetStakingKey } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { networks, isCardanoHaskell, } from '../../api/ada/lib/storage/database/prepackaged/networks';

import transactionsIcon from '../../assets/images/wallet-nav/tab-transactions.inline.svg';
import sendIcon from '../../assets/images/wallet-nav/tab-send.inline.svg';
import receiveIcon from '../../assets/images/wallet-nav/tab-receive.inline.svg';
import dashboardIcon from '../../assets/images/wallet-nav/tab-dashboard.inline.svg';
import delegationListIcon from '../../assets/images/wallet-nav/tab-delegation_list.inline.svg';
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
  }
});

export type TopbarCategory = {|
  +className: string,
  +route: string,
  +icon?: string,
  +label?: MessageDescriptor,
  +isVisible: {|
    selected: PublicDeriver<>,
  |} => (boolean | {| disabledReason: MessageDescriptor |}),
|};

export const allCategories: Array<TopbarCategory> = [];
function registerCategory(category: TopbarCategory): TopbarCategory {
  allCategories.push(category);
  return category;
}

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
export const RECEIVE: TopbarCategory = registerCategory({
  className: 'receive',
  route: ROUTES.WALLETS.RECEIVE.ROOT,
  icon: receiveIcon,
  label: messages.receive,
  isVisible: _request => true,
});
export const STAKE_DASHBOARD: TopbarCategory = registerCategory({
  className: 'stakeDashboard',
  route: ROUTES.WALLETS.DELEGATION_DASHBOARD,
  icon: dashboardIcon,
  label: messages.delegationDashboard,
  isVisible: request => (
    asGetStakingKey(request.selected) != null
  ),
});
export const VOTING: TopbarCategory = registerCategory({
  className: 'voting',
  route: ROUTES.WALLETS.CATALYST_VOTING,
  icon: undefined,
  label: messages.voting,
  isVisible: request => (
    asGetStakingKey(request.selected) != null && !environment.isProduction()
  ),
});
export const SEIZA_STAKE_SIMULATOR: TopbarCategory = registerCategory({
  className: 'stakeSimulator',
  route: ROUTES.WALLETS.ADAPOOL_DELEGATION_SIMPLE,
  icon: delegationListIcon,
  label: messages.delegationList,
  isVisible: request => (
    asGetStakingKey(request.selected) != null &&
    request.selected.getParent().getNetworkInfo().NetworkId === networks.CardanoMainnet.NetworkId
  ),
});
export const CARDANO_DELEGATION: TopbarCategory = registerCategory({
  className: 'cardanoStake',
  route: ROUTES.WALLETS.CARDANO_DELEGATION,
  icon: undefined,
  label: messages.delegationById,
  isVisible: request => (
    asGetStakingKey(request.selected) != null &&
    isCardanoHaskell(request.selected.getParent().getNetworkInfo())
  ),
});
