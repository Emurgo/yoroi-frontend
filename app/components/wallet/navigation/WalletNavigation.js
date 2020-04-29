// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './WalletNavigation.scss';
import WalletNavButton from './WalletNavButton';
import environment from '../../../environment';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import { asGetStakingKey } from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import { Bip44Wallet } from '../../../api/ada/lib/storage/models/Bip44Wallet/wrapper';
import { ROUTES } from '../../../routes-config';

import transactionsIcon from '../../../assets/images/wallet-nav/tab-transactions.inline.svg';
import sendIcon from '../../../assets/images/wallet-nav/tab-send.inline.svg';
import receiveIcon from '../../../assets/images/wallet-nav/tab-receive.inline.svg';

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

type Props = {|
  +wallet: PublicDeriver<>,
  +isActiveNavItem: (string, ?boolean) => boolean,
  +onNavItemClick: string => void,
|};

@observer
export default class WalletNavigation extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { isActiveNavItem, onNavItemClick } = this.props;
    const { intl } = this.context;

    const canStake = asGetStakingKey(this.props.wallet) != null;

    // sending from a balance wallet in Shelley doesn't really work
    // since you can't generate change addresses
    // it's easier to have people use the "upgrade wallet" UX
    // then to make a special "send" page that only allows sendAll
    const canSend = !environment.isShelley() ||
      !(this.props.wallet.getParent() instanceof Bip44Wallet);
    return (
      <div className={styles.component}>

        <div className={styles.navItem}>
          <WalletNavButton
            className="summary"
            label={intl.formatMessage(messages.transactions)}
            icon={transactionsIcon}
            isActive={isActiveNavItem(ROUTES.WALLETS.TRANSACTIONS)}
            onClick={() => onNavItemClick(ROUTES.WALLETS.TRANSACTIONS)}
          />
        </div>

        {canSend && (
          <div className={styles.navItem}>
            <WalletNavButton
              className="send"
              label={intl.formatMessage(messages.send)}
              icon={sendIcon}
              isActive={isActiveNavItem(ROUTES.WALLETS.SEND)}
              onClick={() => onNavItemClick(ROUTES.WALLETS.SEND)}
            />
          </div>
        )}

        <div className={styles.navItem}>
          <WalletNavButton
            className="receive"
            label={intl.formatMessage(messages.receive)}
            icon={receiveIcon}
            isActive={isActiveNavItem(ROUTES.WALLETS.RECEIVE.ROOT, true)}
            onClick={() => onNavItemClick(ROUTES.WALLETS.RECEIVE.ROOT)}
          />
        </div>

        {environment.isShelley() && canStake && (
          <>
            <div className={styles.navItem}>
              <WalletNavButton
                className="stakeDashboard"
                label={intl.formatMessage(messages.delegationDashboard)}
                isActive={isActiveNavItem(ROUTES.WALLETS.DELEGATION_DASHBOARD)}
                onClick={() => onNavItemClick(ROUTES.WALLETS.DELEGATION_DASHBOARD)}
              />
            </div>

            <div className={styles.navItem}>
              <WalletNavButton
                className="stakeSimulator"
                label={intl.formatMessage(messages.delegationSimple)}
                isActive={isActiveNavItem(ROUTES.WALLETS.DELEGATION_SIMPLE)}
                onClick={() => onNavItemClick(ROUTES.WALLETS.DELEGATION_SIMPLE)}
              />
            </div>

            {!environment.isProduction() && ( // Hide temporarily
              <div className={styles.navItem}>
                <WalletNavButton
                  className="stakeAdvancedSimulator"
                  label={intl.formatMessage(messages.delegationAdvance)}
                  isActive={isActiveNavItem(ROUTES.WALLETS.DELEGATION_ADVANCE)}
                  onClick={() => onNavItemClick(ROUTES.WALLETS.DELEGATION_ADVANCE)}
                />
              </div>)
            }
          </>
        )}
      </div>
    );
  }
}
