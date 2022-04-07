// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './NoWalletsAccessList.scss';
import StarIcon from '../../assets/images/add-wallet/wallet-list/stared.inline.svg';
import QuickAccessListheader from './QuickAccessListHeader';

const messages = defineMessages({
  quickAccess: {
    id: 'wallet.nav.noWalletsAccessList.quickAccess',
    defaultMessage: '!!!Quick access wallets',
  },
  noWallets: {
    id: 'wallet.nav.noWalletsAccessList.noWallets',
    defaultMessage: '!!!No wallets added to this list yet',
  },
  goToWallets: {
    id: 'wallet.nav.noWalletsAccessList.goToWallets',
    defaultMessage: '!!!Go to all my wallets and star those you use most often',
  },
});

type Props = {||};

@observer
export default class NoWalletsAccessList extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <div className={styles.wrapper}>
        <QuickAccessListheader />
        <div className={styles.content}>
          <p className={styles.noWallets}>{intl.formatMessage(messages.noWallets)}</p>
          <p className={styles.goToWallets}>{intl.formatMessage(messages.goToWallets)}</p>
        </div>
      </div>
    );
  }
}
