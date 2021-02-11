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
import NoItemsFoundImg from '../../assets/images/no-websites-connected.inline.svg';

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
  noWebsitesConnected: {
    id: 'connector.connect.noWebsitesConnected',
    defaultMessage: `!!!You don't have any websites connected yet`,
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
        {accounts.length ? (
          <>
            <h1 className={styles.title}>
              {intl.formatMessage(connectorMessages.connectedWebsites)}
            </h1>
            <div className={styles.walletList}>
              {accounts.map(({ url, walletIndex }) => (
                <DropdownCard
                  label={intl.formatMessage(messages.connectedWallets)}
                  infoText={intl.formatMessage(connectorMessages.messageReadOnly)}
                  key={url}
                  url={url}
                  wallet={wallets[walletIndex]}
                  onRemoveWallet={onRemoveWallet}
                />
              ))}
            </div>
          </>
        ) : !accounts.length ? (
          <div className={styles.noItems}>
            <NoItemsFoundImg />
            <h3>{intl.formatMessage(messages.noWebsitesConnected)} </h3>
            <p>{intl.formatMessage(connectorMessages.messageReadOnly)}</p>
          </div>
        ) : null}
      </div>
    );
  }
}
