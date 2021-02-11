/* eslint-disable no-nested-ternary */
// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import DropdownCard from './DropdownCard';
import styles from './ConnectWebsitesPage.scss';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { connectorMessages } from '../../../i18n/global-messages';

type Props = {|
  accounts: any,
  wallets: any,
  onRemoveWallet: string => void,
|};
const messages = defineMessages({
  connectedWallets: {
    id: 'connector.connect.connectedWallets',
    defaultMessage: '!!!Connected Wallets',
  },
  messageReadOnly: {
    id: 'connector.connect.messageReadOnly',
    defaultMessage: '!!!We are granting read-only to view utxos/addresses.',
  },
  noWalletsFound: {
    id: 'connector.connect.noWalletsFound',
    defaultMessage: '!!!We havent found any wallet. Try again',
  },
});

@observer
export default class ConnectWebsitesPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { accounts, onRemoveWallet, wallets } = this.props;

    return (
      <div className={styles.component}>
        <h1 className={styles.title}>{intl.formatMessage(connectorMessages.connectedWebsites)}</h1>
        <div className={styles.walletList}>
          {accounts.length ? (
            accounts.map(({ url, walletIndex }) => (
              <DropdownCard
                label={intl.formatMessage(messages.connectedWallets)}
                infoText={intl.formatMessage(messages.messageReadOnly)}
                key={url}
                url={url}
                wallet={wallets[walletIndex]}
                onRemoveWallet={onRemoveWallet}
              />
            ))
          ) : !accounts.length ? (
            <p className={styles.noItems}>{intl.formatMessage(messages.noWalletsFound)} </p>
          ) : null}
        </div>
      </div>
    );
  }
}
