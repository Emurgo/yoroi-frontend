// @flow
import { ROUTES } from '../../routes-config';
import type { MessageDescriptor } from 'react-intl';
import { defineMessages, } from 'react-intl';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import environment from '../../environment';
import { asGetStakingKey } from '../../api/ada/lib/storage/models/PublicDeriver/traits';

import transactionsIcon from '../../assets/images/wallet-nav/tab-transactions.inline.svg';
import sendIcon from '../../assets/images/wallet-nav/tab-send.inline.svg';
import receiveIcon from '../../assets/images/wallet-nav/tab-receive.inline.svg';
import {
  CoinTypes,
} from '../../config/numbersConfig';

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
  delegationAdvance: {
    id: 'wallet.navigation.delegationAdvance',
    defaultMessage: '!!!Delegation (Advance)',
  },
  delegationSimple: {
    id: 'wallet.navigation.delegationSimple',
    defaultMessage: '!!!Delegation (Simple)',
  },
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
  isVisible: request => (
    request.selected.getParent().getCoinType() !== CoinTypes.ERGO
  ),
});
export const SEND: TopbarCategory = registerCategory({
  className: 'send',
  route: ROUTES.WALLETS.SEND,
  icon: sendIcon,
  label: messages.send,
  isVisible: request => {
    if (request.selected.getParent().getCoinType() !== CoinTypes.ERGO) {
      return true;
    }
    return false;
  },
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
  icon: undefined,
  label: messages.delegationDashboard,
  isVisible: request => (
    asGetStakingKey(request.selected) != null
  ),
});
export const STAKE_SIMULATOR_SIMPLE: TopbarCategory = registerCategory({
  className: 'stakeSimulator',
  route: ROUTES.WALLETS.DELEGATION_SIMPLE,
  icon: undefined,
  label: messages.delegationSimple,
  isVisible: request => (
    asGetStakingKey(request.selected) != null
  ),
});
export const STAKE_SIMULATOR_ADVANCED: TopbarCategory = registerCategory({
  className: 'stakeAdvancedSimulator',
  route: ROUTES.WALLETS.DELEGATION_ADVANCE,
  icon: undefined,
  label: messages.delegationAdvance,
  isVisible: request => (
    !environment.isProduction() &&
    asGetStakingKey(request.selected) != null
  ),
});
